import { createClient } from "npm:@supabase/supabase-js@2.110.1";

import { corsHeaders, isUuid, jsonResponse } from "../_shared/http.ts";
import { createCredentialPdf } from "../_shared/pdf.ts";

type GenerateCredentialBody = {
  completionId?: string;
  credentialId?: string;
  replacesCredentialId?: string;
};

type CredentialRow = {
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
  | "snapshot_load_failed"
  | "storage_hash_mismatch"
  | "storage_upload_failed";

type SupabaseClient = ReturnType<typeof createClient>;

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
    return jsonResponse({ error: "Credential document generation is unavailable." }, 500);
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
  if (Number(hasCompletion) + Number(hasCredential) + Number(hasReplacement) !== 1) {
    return jsonResponse(
      { error: "Provide exactly one credential generation target." },
      400,
    );
  }

  const callerClient = createClient(environment.url, environment.publicKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(environment.url, environment.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser(accessToken);
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
          retryError?.message || "Credential document retry was rejected.",
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
          issueResult.error?.message || "Credential issuance was rejected.",
        );
      }

      credentialId = issueResult.data;
      expectedCompletionId = hasCompletion ? body.completionId : null;
    }

    const { data: claimData, error: claimError } = await callerClient
      .rpc("claim_credential_document_generation", {
        p_credential_id: credentialId,
      })
      .single();

    if (claimError || !isClaimCredentialResponse(claimData)) {
      throw new DocumentGenerationError(
        "claim_failed",
        claimError?.message || "Credential document generation could not be claimed.",
      );
    }

    if (
      claimData.credential_id !== credentialId
      || (expectedCompletionId && claimData.completion_id !== expectedCompletionId)
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
        credential.document_status !== "ready"
        || !credential.pdf_storage_path
        || !credential.pdf_sha256
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

    const { data: skillData, error: skillError } = await adminClient
      .from("credential_skills")
      .select("name_en:skill_name_en")
      .eq("credential_id", credential.id)
      .order("skill_name_en", { ascending: true });

    if (skillError) {
      throw new DocumentGenerationError("snapshot_load_failed", skillError.message);
    }

    const verificationUrl = buildVerificationUrl(
      environment.verificationBaseUrl,
      credential.verification_token,
    );
    const pdfBytes = createCredentialPdf({
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
      skills: (skillData ?? []) as { name_en: string }[],
      verificationUrl,
    });
    const sha256 = await sha256Hex(pdfBytes);
    const storagePath = `${credential.user_id}/${credential.id}.pdf`;

    await ensureStoredDocument(adminClient, storagePath, pdfBytes, sha256);

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
        completeError.message,
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
      message: technicalErrorMessage(error),
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
          message: failureError.message,
        });
      }
    }

    if (credentialId) {
      const reconciledCredential = await loadReadyCredential(adminClient, credentialId);
      if (reconciledCredential) {
        return readyResponse(reconciledCredential);
      }
    }

    return jsonResponse(
      { error: "Credential document generation could not be completed." },
      errorCode === "claim_failed" || errorCode === "storage_hash_mismatch" ? 409 : 400,
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
      "id, credential_number, course_end_date, course_start_date, course_title, "
        + "document_status, duration_unit, duration_value, expires_at, issued_at, "
        + "issuer_name, participant_display_name, pdf_sha256, pdf_storage_path, "
        + "status, user_id, verification_token",
    )
    .eq("id", credentialId)
    .single();

  if (error || !isCredentialRow(data)) {
    throw new DocumentGenerationError(
      "snapshot_load_failed",
      error?.message || "Credential snapshot could not be loaded.",
    );
  }

  return data;
}

async function loadReadyCredential(
  adminClient: SupabaseClient,
  credentialId: string,
): Promise<CredentialRow | null> {
  try {
    const credential = await loadCredential(adminClient, credentialId);
    return credential.document_status === "ready"
      && Boolean(credential.pdf_storage_path)
      && Boolean(credential.pdf_sha256)
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
) {
  const existingSha256 = await storedDocumentSha256(adminClient, storagePath);
  if (existingSha256) {
    if (existingSha256 !== expectedSha256) {
      throw new DocumentGenerationError(
        "storage_hash_mismatch",
        "Stored credential document hash does not match the immutable snapshot.",
      );
    }
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
  if (racedSha256 === expectedSha256) {
    return;
  }

  if (racedSha256) {
    throw new DocumentGenerationError(
      "storage_hash_mismatch",
      "Stored credential document hash does not match the immutable snapshot.",
    );
  }

  throw new DocumentGenerationError("storage_upload_failed", uploadError.message);
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
  return isUuid(row.id)
    && typeof row.credential_number === "string"
    && typeof row.course_title === "string"
    && isDocumentStatus(row.document_status)
    && typeof row.issued_at === "string"
    && typeof row.issuer_name === "string"
    && typeof row.participant_display_name === "string"
    && (row.pdf_sha256 === null || typeof row.pdf_sha256 === "string")
    && (row.pdf_storage_path === null || typeof row.pdf_storage_path === "string")
    && (row.status === "revoked" || row.status === "valid")
    && isUuid(row.user_id)
    && typeof row.verification_token === "string";
}

function isRetryCredentialResponse(value: unknown): value is RetryCredentialResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  return isUuid(row.credential_id) && isUuid(row.completion_id);
}

function isClaimCredentialResponse(value: unknown): value is ClaimCredentialResponse {
  if (!isRetryCredentialResponse(value)) {
    return false;
  }

  const row = value as unknown as Record<string, unknown>;
  return (row.attempt_id === null || isUuid(row.attempt_id))
    && (row.document_status === "pending" || row.document_status === "ready");
}

function isDocumentStatus(value: unknown): value is CredentialRow["document_status"] {
  return value === "failed" || value === "pending" || value === "ready";
}

function documentErrorCode(error: unknown): DocumentGenerationErrorCode {
  return error instanceof DocumentGenerationError ? error.code : "generation_failed";
}

function technicalErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

function readEnvironment() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const verificationBaseUrl = Deno.env.get("CREDENTIAL_VERIFICATION_BASE_URL") ?? "";

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
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) {
      throw new Error("Verification URL must use HTTPS outside local development.");
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
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
