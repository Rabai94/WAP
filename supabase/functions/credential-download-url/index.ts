import { createClient } from "npm:@supabase/supabase-js@2.110.1";

import { corsHeaders, errorMessage, isUuid, jsonResponse } from "../_shared/http.ts";

type DownloadBody = {
  credentialId?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !publicKey || !serviceRoleKey) {
    return jsonResponse({ error: "Credential function environment is incomplete." }, 500);
  }

  const authorization = request.headers.get("Authorization");
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!authorization || !accessToken) {
    return jsonResponse({ error: "Authentication is required." }, 401);
  }

  let body: DownloadBody;
  try {
    body = await request.json() as DownloadBody;
  } catch {
    return jsonResponse({ error: "A valid JSON body is required." }, 400);
  }

  if (!isUuid(body.credentialId)) {
    return jsonResponse({ error: "A valid credentialId is required." }, 400);
  }

  const callerClient = createClient(url, publicKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const { data: userData, error: userError } = await callerClient.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return jsonResponse({ error: "Authentication is required." }, 401);
    }

    const { data: accessAllowed, error: accessError } = await callerClient.rpc(
      "can_access_credential_document",
      { p_credential_id: body.credentialId },
    );

    if (accessError || accessAllowed !== true) {
      return jsonResponse({ error: "Credential document is not available." }, 403);
    }

    const { data: credential, error: credentialError } = await adminClient
      .from("issued_credentials")
      .select("pdf_storage_path, document_status")
      .eq("id", body.credentialId)
      .single();

    if (
      credentialError
      || !credential
      || credential.document_status !== "ready"
      || !credential.pdf_storage_path
    ) {
      return jsonResponse({ error: "Credential document is not available." }, 404);
    }

    const expiresIn = 120;
    const { data: signedData, error: signedError } = await adminClient.storage
      .from("credential-pdfs")
      .createSignedUrl(credential.pdf_storage_path, expiresIn, { download: true });

    if (signedError || !signedData?.signedUrl) {
      throw new Error(signedError?.message || "Signed URL could not be created.");
    }

    const { error: auditError } = await adminClient.rpc("record_credential_download", {
      p_actor_user_id: userData.user.id,
      p_credential_id: body.credentialId,
    });

    if (auditError) {
      throw new Error(auditError.message);
    }

    return jsonResponse({
      expiresIn,
      signedUrl: signedData.signedUrl,
    });
  } catch (error) {
    return jsonResponse({ error: errorMessage(error) }, 400);
  }
});
