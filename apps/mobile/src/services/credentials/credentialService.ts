import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";
import { Platform } from "react-native";

export type CredentialStatus = "expired" | "revoked" | "valid";
export type CredentialDocumentStatus = "failed" | "pending" | "ready";
export type CompletionOutcome = "abandoned" | "failed" | "passed";

export type CredentialSkill = {
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
};

export type IssuerCourse = {
  course_id: string;
  course_title: string;
  course_status: string;
  provider_id: string;
  provider_name: string;
  provider_status: string;
  provider_verification_status: string;
  start_date: string | null;
  end_date: string | null;
  participant_count: number;
  completion_count: number;
  credential_count: number;
  can_manage: boolean;
};

export type IssuerCourseParticipant = {
  enrollment_id: string;
  participant_display_name: string | null;
  enrollment_status: string;
  enrolled_at: string;
  completion_id: string | null;
  completion_outcome: CompletionOutcome | null;
  completion_score: number | null;
  completion_notes: string | null;
  completed_at: string | null;
  credential_id: string | null;
  credential_number: string | null;
  credential_status: CredentialStatus | null;
  credential_document_status: CredentialDocumentStatus | null;
};

export type WalletCredential = {
  credential_id: string;
  category: "certificate";
  credential_number: string;
  title: string;
  issuer_name: string;
  issued_at: string;
  expires_at: string | null;
  status: CredentialStatus;
  document_status: CredentialDocumentStatus;
  is_public: boolean;
  verification_token: string;
  skills: CredentialSkill[];
};

export type CredentialDetails = {
  credential_id: string;
  credential_number: string;
  title: string;
  participant_display_name: string;
  course_title: string;
  issuer_name: string;
  course_start_date: string | null;
  course_end_date: string | null;
  duration_value: number | null;
  duration_unit: string | null;
  issued_at: string;
  expires_at: string | null;
  status: CredentialStatus;
  document_status: CredentialDocumentStatus;
  pdf_sha256: string | null;
  is_public: boolean;
  verification_token: string;
  revoked_at: string | null;
  revoked_reason: string | null;
  replaces_credential_id: string | null;
  version: number;
  skills: CredentialSkill[];
};

export type PublicCredentialVerification = {
  credential_number: string;
  title: string;
  participant_display_name: string;
  issuer_name: string;
  course_title: string;
  issued_at: string;
  expires_at: string | null;
  status: CredentialStatus;
  revoked_at: string | null;
  skills: CredentialSkill[];
};

export type UserSkill = {
  user_skill_id: string;
  skill_id: string;
  skill_slug: string;
  skill_name_ro: string;
  skill_name_de: string;
  skill_name_en: string;
  source_type: "course_credential" | "organization_verified" | "self_declared";
  status: CredentialStatus;
  is_verified: boolean;
  obtained_at: string;
  expires_at: string | null;
  credential_id: string | null;
  credential_number: string | null;
  credential_title: string | null;
  issuer_name: string | null;
};

export type CredentialAuditEvent = {
  event_id: number;
  event_type: string;
  actor_role: "issuer" | "participant" | "system";
  metadata: Record<string, unknown>;
  created_at: string;
};

type GenerateCredentialResponse = {
  credentialId: string;
  credentialNumber: string;
  documentStatus: "ready";
};

type DownloadUrlResponse = {
  expiresIn: number;
  signedUrl: string;
};

export async function listIssuerCourses() {
  const { data, error } = await supabase.rpc("list_issuer_courses");
  if (error) {
    throw new Error(error.message || "Issuer courses could not be loaded.");
  }

  return (data ?? []) as IssuerCourse[];
}

export async function listCourseParticipantsForIssuer(courseId: string) {
  const { data, error } = await supabase.rpc(
    "list_course_participants_for_issuer",
    { p_course_id: courseId },
  );
  if (error) {
    throw new Error(error.message || "Course participants could not be loaded.");
  }

  return (data ?? []) as IssuerCourseParticipant[];
}

export async function updateEnrollmentStatusForIssuer(
  enrollmentId: string,
  status: "accepted" | "rejected" | "viewed",
) {
  const { data, error } = await supabase.rpc(
    "update_course_enrollment_status_for_issuer",
    { p_enrollment_id: enrollmentId, p_status: status },
  );
  if (error) {
    throw new Error(error.message || "Enrollment status could not be updated.");
  }

  return data as string;
}

export async function finalizeCourseEnrollment(input: {
  enrollmentId: string;
  notes?: string | null;
  outcome: CompletionOutcome;
  score?: number | null;
}) {
  const { data, error } = await supabase.rpc("finalize_course_enrollment", {
    p_enrollment_id: input.enrollmentId,
    p_notes: input.notes ?? null,
    p_outcome: input.outcome,
    p_score: input.score ?? null,
  });
  if (error) {
    throw new Error(error.message || "Course completion could not be saved.");
  }

  return data as string;
}

export async function generateCourseCredential(input: {
  completionId?: string;
  replacesCredentialId?: string;
}) {
  const { data, error } = await supabase.functions.invoke(
    "generate-course-credential",
    { body: input },
  );
  if (error) {
    throw new Error(error.message || "Credential PDF could not be generated.");
  }

  const result = data as Partial<GenerateCredentialResponse> | null;
  if (
    !result
    || typeof result.credentialId !== "string"
    || typeof result.credentialNumber !== "string"
    || result.documentStatus !== "ready"
  ) {
    throw new Error("Credential generation returned an invalid response.");
  }

  return result as GenerateCredentialResponse;
}

export async function revokeCredential(credentialId: string, reason: string) {
  const { data, error } = await supabase.rpc("revoke_credential", {
    p_credential_id: credentialId,
    p_reason: reason,
  });
  if (error) {
    throw new Error(error.message || "Credential could not be revoked.");
  }

  return data as string;
}

export async function listOwnCredentials() {
  const { data, error } = await supabase.rpc("list_own_credentials");
  if (error) {
    throw new Error(error.message || "Credential Wallet could not be loaded.");
  }

  return (data ?? []) as WalletCredential[];
}

export async function getOwnCredentialDetails(credentialId: string) {
  const { data, error } = await supabase
    .rpc("get_own_credential_details", { p_credential_id: credentialId })
    .maybeSingle();
  if (error) {
    throw new Error(error.message || "Credential details could not be loaded.");
  }

  return (data ?? null) as CredentialDetails | null;
}

export async function listOwnSkills() {
  const { data, error } = await supabase.rpc("list_own_skills");
  if (error) {
    throw new Error(error.message || "Verified skills could not be loaded.");
  }

  return (data ?? []) as UserSkill[];
}

export async function setCredentialVisibility(credentialId: string, isPublic: boolean) {
  const { data, error } = await supabase.rpc("set_credential_visibility", {
    p_credential_id: credentialId,
    p_is_public: isPublic,
  });
  if (error) {
    throw new Error(error.message || "Credential visibility could not be updated.");
  }

  return data as string;
}

export async function verifyCredentialByToken(token: string) {
  const { data, error } = await supabase
    .rpc("verify_credential_by_token", { p_token: token })
    .maybeSingle();
  if (error) {
    throw new Error(error.message || "Credential could not be verified.");
  }

  return (data ?? null) as PublicCredentialVerification | null;
}

export async function getCredentialDownloadUrl(credentialId: string) {
  const { data, error } = await supabase.functions.invoke(
    "credential-download-url",
    { body: { credentialId } },
  );
  if (error) {
    throw new Error(error.message || "Credential download could not be prepared.");
  }

  const result = data as Partial<DownloadUrlResponse> | null;
  if (
    !result
    || typeof result.signedUrl !== "string"
    || typeof result.expiresIn !== "number"
  ) {
    throw new Error("Credential download returned an invalid response.");
  }

  return result as DownloadUrlResponse;
}

export async function listCredentialAudit(credentialId: string) {
  const { data, error } = await supabase.rpc("list_credential_audit", {
    p_credential_id: credentialId,
  });
  if (error) {
    throw new Error(error.message || "Credential audit could not be loaded.");
  }

  return (data ?? []) as CredentialAuditEvent[];
}

export function buildCredentialVerificationUrl(token: string) {
  const configuredBase = process.env.EXPO_PUBLIC_CREDENTIAL_VERIFICATION_BASE_URL?.trim();
  if (configuredBase) {
    return configuredBase.includes("{token}")
      ? configuredBase.replace("{token}", token)
      : `${configuredBase.replace(/\/$/, "")}/${token}`;
  }

  if (Platform.OS === "web" && typeof globalThis.location?.origin === "string") {
    return `${globalThis.location.origin}/credentials/verify/${token}`;
  }

  throw new Error(
    "EXPO_PUBLIC_CREDENTIAL_VERIFICATION_BASE_URL is required on native platforms.",
  );
}
