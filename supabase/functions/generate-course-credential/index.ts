import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.110.1";

import { corsHeaders, isUuid, jsonResponse } from "../_shared/http.ts";
import {
  createCredentialPdf,
  type CredentialPdfData,
  CredentialPdfError,
  type CredentialPdfFonts,
} from "../_shared/pdf.ts";
import {
  createLegacyCredentialPdf,
  type CredentialPdfData as LegacyCredentialPdfData,
} from "../_shared/pdf_legacy_v1.ts";

type GenerateCredentialBody = {
  completionId?: string;
  credentialId?: string;
  replacesCredentialId?: string;
};

type CredentialRow = {
  completion_id: string;
  id: string;
  credential_number: string;
  course_end_date: string | null;
  course_start_date: string | null;
  course_title: string;
  document_status: "failed" | "pending" | "ready";
  duration_unit: string | null;
  duration_value: number | null;
  expires_at: string | null;
  issued_at: string;
  issuer_name: string;
  participant_display_name: string;
  pdf_sha256: string | null;
  pdf_storage_path: string | null;
  status: "revoked" | "valid";
  user_id: string;
  verification_token: string;
};

type CompletionRow = {
  completed_at: string;
};

type CredentialSkillRow = {
  name_en: string;
  skill_id: string;
  skill_slug: string;
};

type CredentialSkillNameRow = Pick<CredentialSkillRow, "name_en">;

type RetryCredentialResponse = {
  completion_id: string;
  credential_id: string;
};

type ClaimCredentialResponse = RetryCredentialResponse & {
  attempt_id: string | null;
  document_status: "pending" | "ready";
};

type DocumentGenerationErrorCode =
  | "authorization_failed"
  | "claim_failed"
  | "document_finalize_failed"
  | "generation_failed"
  | "pdf_font_load_failed"
  | "pdf_generation_failed"
  | "pdf_input_invalid"
  | "pdf_unsupported_glyph"
  | "snapshot_load_failed"
  | "storage_hash_mismatch"
  | "storage_upload_failed";

const credentialPdfFontUrls = {
  bold: new URL("./fonts/LiberationSans-Bold.ttf", import.meta.url),
  regular: new URL("./fonts/LiberationSans-Regular.ttf", import.meta.url),
} as const;

const credentialPdfFontSha256 = {
  bold: "361c61b82d575c5c35fd9157fda8b0194bcfcd0d88ea8521a4fb5dd53d33dddc",
  regular: "f8ace1f892b2bd9dc1792ba7f097fa7588f84fed48321480e04de5390828221f",
} as const;

let credentialPdfFontsPromise: Promise<CredentialPdfFonts> | null = null;

class DocumentGenerationError extends Error {
  constructor(
    readonly code: DocumentGenerationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DocumentGenerationError";
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const environment = readEnvironment();
  if (environment.error) {
    return jsonResponse({
      error: "Credential document generation is unavailable.",
    }, 500);
  }

  const authorization = request.headers.get("Authorization");
  const accessToken = getBearerToken(authorization);
  if (!authorization || !accessToken) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  let body: GenerateCredentialBody;
  try {
    body = await request.json() as GenerateCredentialBody;
  } catch {
    return jsonResponse({ error: "A valid JSON body is required." }, 400);
  }

  const hasCompletion = isUuid(body.completionId);
  const hasCredential = isUuid(body.credentialId);
  const hasReplacement = isUuid(body.replacesCredentialId);
  if (
    Number(hasCompletion) + Number(hasCredential) + Number(hasReplacement) !== 1
  ) {
    return jsonResponse(
      { error: "Provide exactly one credential generation target." },
      400,
    );
  }

  const callerClient = createClient(environment.url, environment.publicKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(
    environment.url,
    environment.serviceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const { data: userData, error: userError } = await callerClient.auth.getUser(
    accessToken,
  );
  if (userError || !userData.user) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  let credentialId: string | null = null;
  let attemptId: string | null = null;

  try {
    let expectedCompletionId: string | null = null;

    if (hasCredential) {
      const { data: retryData, error: retryError } = await callerClient
        .rpc("retry_credential_document_generation", {
          p_credential_id: body.credentialId,
        })
        .single();

      if (retryError || !isRetryCredentialResponse(retryData)) {
        throw new DocumentGenerationError(
          "authorization_failed",
          "Credential document retry was rejected.",
        );
      }

      credentialId = retryData.credential_id;
      expectedCompletionId = retryData.completion_id;
    } else {
      const issueResult = hasCompletion
        ? await callerClient.rpc("issue_course_credential", {
          p_completion_id: body.completionId,
        })
        : await callerClient.rpc("reissue_course_credential", {
          p_credential_id: body.replacesCredentialId,
        });

      if (issueResult.error || typeof issueResult.data !== "string") {
        throw new DocumentGenerationError(
          "authorization_failed",
          "Credential issuance was rejected.",
        );
      }

      credentialId = issueResult.data;
      expectedCompletionId = hasCompletion ? body.completionId ?? null : null;
    }

    const { data: claimData, error: claimError } = await callerClient
      .rpc("claim_credential_document_generation", {
        p_credential_id: credentialId,
      })
      .single();

    if (claimError || !isClaimCredentialResponse(claimData)) {
      throw new DocumentGenerationError(
        "claim_failed",
        "Credential document generation could not be claimed.",
      );
    }

    if (
      claimData.credential_id !== credentialId ||
      (expectedCompletionId && claimData.completion_id !== expectedCompletionId)
    ) {
      throw new DocumentGenerationError(
        "claim_failed",
        "Credential document claim did not match the authorized target.",
      );
    }

    attemptId = claimData.attempt_id;
    const credential = await loadCredential(adminClient, credentialId);

    if (claimData.document_status === "ready") {
      if (
        credential.document_status !== "ready" ||
        !credential.pdf_storage_path ||
        !credential.pdf_sha256
      ) {
        throw new DocumentGenerationError(
          "snapshot_load_failed",
          "Ready credential document metadata is incomplete.",
        );
      }

      return readyResponse(credential);
    }

    if (!attemptId || credential.document_status !== "pending") {
      throw new DocumentGenerationError(
        "claim_failed",
        "Credential document generation attempt is invalid.",
      );
    }

    if (credential.completion_id !== claimData.completion_id) {
      throw new DocumentGenerationError(
        "snapshot_load_failed",
        "Credential completion identity is inconsistent.",
      );
    }

    const [completionAt, credentialSkills] = await Promise.all([
      loadCompletionAt(adminClient, credential.completion_id),
      loadCredentialSkills(adminClient, credential.id),
    ]);
    const verificationUrl = buildVerificationUrl(
      environment.verificationBaseUrl,
      credential.verification_token,
    );
    const legacyPdfData: LegacyCredentialPdfData = {
      credentialNumber: credential.credential_number,
      courseEndDate: credential.course_end_date,
      courseStartDate: credential.course_start_date,
      courseTitle: credential.course_title,
      durationUnit: credential.duration_unit,
      durationValue: credential.duration_value,
      expiresAt: credential.expires_at,
      issuedAt: credential.issued_at,
      issuerName: credential.issuer_name,
      participantName: credential.participant_display_name,
      skills: credentialSkills.legacy.map(({ name_en }) => ({ name_en })),
      verificationUrl,
    };
    const pdfData: CredentialPdfData = {
      ...legacyPdfData,
      completionAt,
      skills: credentialSkills.stable.map(({ name_en }) => ({ name_en })),
    };
    const pdfBytes = await generateCredentialPdf(pdfData);

    let legacyPdfBytes: Uint8Array;
    try {
      legacyPdfBytes = createLegacyCredentialPdf(legacyPdfData);
    } catch {
      throw new DocumentGenerationError(
        "pdf_generation_failed",
        "Legacy credential PDF verification could not be prepared.",
      );
    }

    const [sha256, legacySha256] = await Promise.all([
      sha256Hex(pdfBytes),
      sha256Hex(legacyPdfBytes),
    ]);
    const storagePath = `${credential.user_id}/${credential.id}.pdf`;

    await ensureStoredDocument(
      adminClient,
      storagePath,
      pdfBytes,
      sha256,
      legacySha256,
    );

    const { error: completeError } = await adminClient.rpc(
      "complete_credential_document",
      {
        p_attempt_id: attemptId,
        p_credential_id: credential.id,
        p_sha256: sha256,
        p_storage_path: storagePath,
      },
    );

    if (completeError) {
      throw new DocumentGenerationError(
        "document_finalize_failed",
        "Credential document completion could not be saved.",
      );
    }

    return readyResponse({
      ...credential,
      document_status: "ready",
      pdf_sha256: sha256,
      pdf_storage_path: storagePath,
    });
  } catch (error) {
    const errorCode = documentErrorCode(error);
    console.error("Credential document generation failed.", {
      attemptId,
      credentialId,
      errorCode,
    });

    if (credentialId && attemptId) {
      const { error: failureError } = await adminClient.rpc(
        "mark_credential_document_failed",
        {
          p_attempt_id: attemptId,
          p_credential_id: credentialId,
          p_error_code: errorCode,
        },
      );

      if (failureError) {
        console.error("Credential document failure state could not be saved.", {
          attemptId,
          credentialId,
          errorCode: "failure_state_persist_failed",
        });
      }
    }

    if (credentialId) {
      const reconciledCredential = await loadReadyCredential(
        adminClient,
        credentialId,
      );
      if (reconciledCredential) {
        return readyResponse(reconciledCredential);
      }
    }

    return jsonResponse(
      { error: "Credential document generation could not be completed." },
      errorCode === "claim_failed" || errorCode === "storage_hash_mismatch"
        ? 409
        : 400,
    );
  }
});

async function loadCredential(
  adminClient: SupabaseClient,
  credentialId: string,
): Promise<CredentialRow> {
  const { data, error } = await adminClient
    .from("issued_credentials")
    .select(
      "completion_id, id, credential_number, course_end_date, course_start_date, course_title, " +
        "document_status, duration_unit, duration_value, expires_at, issued_at, " +
        "issuer_name, participant_display_name, pdf_sha256, pdf_storage_path, " +
        "status, user_id, verification_token",
    )
    .eq("id", credentialId)
    .single();

  if (error || !isCredentialRow(data)) {
    throw new DocumentGenerationError(
      "snapshot_load_failed",
      "Credential snapshot could not be loaded.",
    );
  }

  return data;
}

async function loadCompletionAt(
  adminClient: SupabaseClient,
  completionId: string,
) {
  const { data, error } = await adminClient
    .from("course_completions")
    .select("completed_at")
    .eq("id", completionId)
    .single();

  if (error || !isCompletionRow(data)) {
    throw new DocumentGenerationError(
      "snapshot_load_failed",
      "Credential completion date could not be loaded.",
    );
  }

  return data.completed_at;
}

async function loadCredentialSkills(
  adminClient: SupabaseClient,
  credentialId: string,
) {
  const [stableResult, legacyResult] = await Promise.all([
    adminClient
      .from("credential_skills")
      .select("name_en:skill_name_en, skill_id, skill_slug")
      .eq("credential_id", credentialId)
      .order("skill_slug", { ascending: true })
      .order("skill_id", { ascending: true }),
    adminClient
      .from("credential_skills")
      .select("name_en:skill_name_en")
      .eq("credential_id", credentialId)
      .order("skill_name_en", { ascending: true }),
  ]);

  if (
    stableResult.error ||
    legacyResult.error ||
    !Array.isArray(stableResult.data) ||
    !stableResult.data.every(isCredentialSkillRow) ||
    !Array.isArray(legacyResult.data) ||
    !legacyResult.data.every(isCredentialSkillNameRow)
  ) {
    throw new DocumentGenerationError(
      "snapshot_load_failed",
      "Credential skills could not be loaded.",
    );
  }

  return {
    legacy: legacyResult.data,
    stable: stableResult.data,
  };
}

async function generateCredentialPdf(data: CredentialPdfData) {
  const fonts = await loadCredentialPdfFonts();

  try {
    return await createCredentialPdf(data, fonts);
  } catch (error) {
    if (error instanceof CredentialPdfError) {
      const errorCode: DocumentGenerationErrorCode =
        error.code === "invalid_pdf_input"
          ? "pdf_input_invalid"
          : error.code === "unsupported_glyph"
          ? "pdf_unsupported_glyph"
          : "pdf_generation_failed";
      throw new DocumentGenerationError(
        errorCode,
        "Credential PDF rendering failed validation.",
      );
    }

    throw new DocumentGenerationError(
      "pdf_generation_failed",
      "Credential PDF rendering failed.",
    );
  }
}

async function loadCredentialPdfFonts(): Promise<CredentialPdfFonts> {
  let fontsPromise = credentialPdfFontsPromise;
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const [bold, regular] = await Promise.all([
        Deno.readFile(credentialPdfFontUrls.bold),
        Deno.readFile(credentialPdfFontUrls.regular),
      ]);
      const [boldSha256, regularSha256] = await Promise.all([
        sha256Hex(bold),
        sha256Hex(regular),
      ]);

      if (
        boldSha256 !== credentialPdfFontSha256.bold ||
        regularSha256 !== credentialPdfFontSha256.regular
      ) {
        throw new Error("Embedded credential font integrity check failed.");
      }

      return { bold, regular };
    })();
    credentialPdfFontsPromise = fontsPromise;
  }

  try {
    return await fontsPromise;
  } catch {
    credentialPdfFontsPromise = null;
    throw new DocumentGenerationError(
      "pdf_font_load_failed",
      "Embedded credential fonts could not be loaded.",
    );
  }
}

async function loadReadyCredential(
  adminClient: SupabaseClient,
  credentialId: string,
): Promise<CredentialRow | null> {
  try {
    const credential = await loadCredential(adminClient, credentialId);
    return credential.document_status === "ready" &&
        Boolean(credential.pdf_storage_path) &&
        Boolean(credential.pdf_sha256)
      ? credential
      : null;
  } catch {
    return null;
  }
}

async function ensureStoredDocument(
  adminClient: SupabaseClient,
  storagePath: string,
  pdfBytes: Uint8Array,
  expectedSha256: string,
  legacySha256: string,
) {
  const existingSha256 = await storedDocumentSha256(adminClient, storagePath);
  if (existingSha256) {
    await acceptOrUpgradeStoredDocument(
      adminClient,
      storagePath,
      pdfBytes,
      expectedSha256,
      legacySha256,
      existingSha256,
    );
    return;
  }

  const { error: uploadError } = await adminClient.storage
    .from("credential-pdfs")
    .upload(storagePath, pdfBytes, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });

  if (!uploadError) {
    return;
  }

  // A concurrent or partially completed request may have created the object
  // after the first read. Re-read and accept it only when the bytes match.
  const racedSha256 = await storedDocumentSha256(adminClient, storagePath);
  if (racedSha256) {
    await acceptOrUpgradeStoredDocument(
      adminClient,
      storagePath,
      pdfBytes,
      expectedSha256,
      legacySha256,
      racedSha256,
    );
    return;
  }

  throw new DocumentGenerationError(
    "storage_upload_failed",
    "Credential document could not be stored.",
  );
}

async function acceptOrUpgradeStoredDocument(
  adminClient: SupabaseClient,
  storagePath: string,
  pdfBytes: Uint8Array,
  expectedSha256: string,
  legacySha256: string,
  storedSha256: string,
) {
  if (storedSha256 === expectedSha256) {
    return;
  }

  if (storedSha256 !== legacySha256) {
    throw new DocumentGenerationError(
      "storage_hash_mismatch",
      "Stored credential document hash does not match the immutable snapshot.",
    );
  }

  const { error: updateError } = await adminClient.storage
    .from("credential-pdfs")
    .update(storagePath, pdfBytes, {
      cacheControl: "3600",
      contentType: "application/pdf",
    });

  if (!updateError) {
    return;
  }

  // A concurrent retry can have completed the same deterministic upgrade.
  const reconciledSha256 = await storedDocumentSha256(adminClient, storagePath);
  if (reconciledSha256 === expectedSha256) {
    return;
  }

  if (reconciledSha256 && reconciledSha256 !== legacySha256) {
    throw new DocumentGenerationError(
      "storage_hash_mismatch",
      "Stored credential document changed during the legacy upgrade.",
    );
  }

  throw new DocumentGenerationError(
    "storage_upload_failed",
    "Legacy credential document could not be upgraded.",
  );
}

async function storedDocumentSha256(
  adminClient: SupabaseClient,
  storagePath: string,
) {
  const { data, error } = await adminClient.storage
    .from("credential-pdfs")
    .download(storagePath);

  if (error || !data) {
    return null;
  }

  return sha256Hex(new Uint8Array(await data.arrayBuffer()));
}

function readyResponse(credential: CredentialRow) {
  return jsonResponse({
    credentialId: credential.id,
    credentialNumber: credential.credential_number,
    documentStatus: "ready",
  });
}

function isCredentialRow(value: unknown): value is CredentialRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return isUuid(row.completion_id) &&
    isUuid(row.id) &&
    typeof row.credential_number === "string" &&
    (row.course_end_date === null || typeof row.course_end_date === "string") &&
    (row.course_start_date === null ||
      typeof row.course_start_date === "string") &&
    typeof row.course_title === "string" &&
    isDocumentStatus(row.document_status) &&
    (row.duration_unit === null || typeof row.duration_unit === "string") &&
    (row.duration_value === null || typeof row.duration_value === "number") &&
    (row.expires_at === null || typeof row.expires_at === "string") &&
    typeof row.issued_at === "string" &&
    typeof row.issuer_name === "string" &&
    typeof row.participant_display_name === "string" &&
    (row.pdf_sha256 === null || typeof row.pdf_sha256 === "string") &&
    (row.pdf_storage_path === null ||
      typeof row.pdf_storage_path === "string") &&
    (row.status === "revoked" || row.status === "valid") &&
    isUuid(row.user_id) &&
    typeof row.verification_token === "string";
}

function isCompletionRow(value: unknown): value is CompletionRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof (value as Record<string, unknown>).completed_at === "string";
}

function isCredentialSkillRow(value: unknown): value is CredentialSkillRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return typeof row.name_en === "string" &&
    isUuid(row.skill_id) &&
    typeof row.skill_slug === "string";
}

function isCredentialSkillNameRow(
  value: unknown,
): value is CredentialSkillNameRow {
  return Boolean(value) &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>).name_en === "string";
}

function isRetryCredentialResponse(
  value: unknown,
): value is RetryCredentialResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return isUuid(row.credential_id) && isUuid(row.completion_id);
}

function isClaimCredentialResponse(
  value: unknown,
): value is ClaimCredentialResponse {
  if (!isRetryCredentialResponse(value)) {
    return false;
  }

  const row = value as unknown as Record<string, unknown>;
  return (row.attempt_id === null || isUuid(row.attempt_id)) &&
    (row.document_status === "pending" || row.document_status === "ready");
}

function isDocumentStatus(
  value: unknown,
): value is CredentialRow["document_status"] {
  return value === "failed" || value === "pending" || value === "ready";
}

function documentErrorCode(error: unknown): DocumentGenerationErrorCode {
  return error instanceof DocumentGenerationError
    ? error.code
    : "generation_failed";
}

function readEnvironment() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const verificationBaseUrl =
    Deno.env.get("CREDENTIAL_VERIFICATION_BASE_URL") ?? "";

  if (!url || !publicKey || !serviceRoleKey || !verificationBaseUrl) {
    return {
      error: "Credential function environment is incomplete.",
      url,
      publicKey,
      serviceRoleKey,
      verificationBaseUrl,
    };
  }

  try {
    const candidate = verificationBaseUrl.includes("{token}")
      ? verificationBaseUrl.replace("{token}", "0".repeat(64))
      : `${verificationBaseUrl.replace(/\/$/, "")}/${"0".repeat(64)}`;
    const parsed = new URL(candidate);
    const isLocal = parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1";
    if (
      parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")
    ) {
      throw new Error(
        "Verification URL must use HTTPS outside local development.",
      );
    }
  } catch {
    return {
      error: "CREDENTIAL_VERIFICATION_BASE_URL is invalid.",
      url,
      publicKey,
      serviceRoleKey,
      verificationBaseUrl,
    };
  }

  return { error: "", url, publicKey, serviceRoleKey, verificationBaseUrl };
}

function getBearerToken(authorization: string | null) {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function buildVerificationUrl(baseUrl: string, token: string) {
  return baseUrl.includes("{token}")
    ? baseUrl.replace("{token}", token)
    : `${baseUrl.replace(/\/$/, "")}/${token}`;
}

async function sha256Hex(bytes: Uint8Array) {
  const digestInput = new Uint8Array(bytes.byteLength);
  digestInput.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", digestInput.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
