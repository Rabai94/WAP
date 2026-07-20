import { createClient } from "npm:@supabase/supabase-js@2.110.1";

import { errorMessage, isUuid, jsonResponse, corsHeaders } from "../_shared/http.ts";
import { createCredentialPdf } from "../_shared/pdf.ts";

type GenerateCredentialBody = {
  completionId?: string;
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
  user_id: string;
  verification_token: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const environment = readEnvironment();
  if (environment.error) {
    return jsonResponse({ error: environment.error }, 500);
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
  const hasReplacement = isUuid(body.replacesCredentialId);
  if (hasCompletion === hasReplacement) {
    return jsonResponse(
      { error: "Provide either completionId or replacesCredentialId." },
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

  try {
    const issueResult = hasCompletion
      ? await callerClient.rpc("issue_course_credential", {
        p_completion_id: body.completionId,
      })
      : await callerClient.rpc("reissue_course_credential", {
        p_credential_id: body.replacesCredentialId,
      });

    if (issueResult.error || typeof issueResult.data !== "string") {
      throw new Error(issueResult.error?.message || "Credential issuance was rejected.");
    }

    credentialId = issueResult.data;

    const { data: credentialData, error: credentialError } = await adminClient
      .from("issued_credentials")
      .select(
        "id, credential_number, course_end_date, course_start_date, course_title, "
          + "document_status, duration_unit, duration_value, expires_at, issued_at, "
          + "issuer_name, participant_display_name, pdf_sha256, pdf_storage_path, "
          + "user_id, verification_token",
      )
      .eq("id", credentialId)
      .single();

    if (credentialError || !credentialData) {
      throw new Error(credentialError?.message || "Credential snapshot could not be loaded.");
    }

    const credential = credentialData as CredentialRow;

    if (
      credential.document_status === "ready"
      && credential.pdf_storage_path
      && credential.pdf_sha256
    ) {
      return jsonResponse({
        credentialId: credential.id,
        credentialNumber: credential.credential_number,
        documentStatus: "ready",
      });
    }

    const { data: skillData, error: skillError } = await adminClient
      .from("credential_skills")
      .select("name_en:skill_name_en")
      .eq("credential_id", credential.id)
      .order("skill_name_en", { ascending: true });

    if (skillError) {
      throw new Error(skillError.message);
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

    const { error: uploadError } = await adminClient.storage
      .from("credential-pdfs")
      .upload(storagePath, pdfBytes, {
        cacheControl: "3600",
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { error: completeError } = await adminClient.rpc(
      "complete_credential_document",
      {
        p_credential_id: credential.id,
        p_sha256: sha256,
        p_storage_path: storagePath,
      },
    );

    if (completeError) {
      throw new Error(completeError.message);
    }

    return jsonResponse({
      credentialId: credential.id,
      credentialNumber: credential.credential_number,
      documentStatus: "ready",
    });
  } catch (error) {
    if (credentialId) {
      await adminClient.rpc("mark_credential_document_failed", {
        p_credential_id: credentialId,
      });
    }

    return jsonResponse({ error: errorMessage(error) }, 400);
  }
});

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
