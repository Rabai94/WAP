import type { LanguageCode } from "@/i18n/translations";
import type {
  CompanyStatus,
  CompanyVerificationStatus,
  PublicCompanyProfile,
} from "@/services/company/companyService";

export const organizationCompletionFieldKeys = [
  "name",
  "description",
  "industry",
  "city",
  "website",
  "employee_count_range",
] as const;

export type OrganizationCompletionField =
  (typeof organizationCompletionFieldKeys)[number];

export type OrganizationCompletion = {
  completedCount: number;
  fields: Record<OrganizationCompletionField, boolean>;
  percentage: number;
  totalCount: number;
};

const companyStatusLabels: Record<
  LanguageCode,
  Record<CompanyStatus, string>
> = {
  de: {
    active: "Aktiv",
    archived: "Archiviert",
    draft: "Entwurf",
    inactive: "Inaktiv",
    pending: "Ausstehend",
    suspended: "Gesperrt",
    verified: "Bestätigt",
  },
  en: {
    active: "Active",
    archived: "Archived",
    draft: "Draft",
    inactive: "Inactive",
    pending: "Pending",
    suspended: "Suspended",
    verified: "Verified",
  },
  ro: {
    active: "Activă",
    archived: "Arhivată",
    draft: "Ciornă",
    inactive: "Inactivă",
    pending: "În așteptare",
    suspended: "Suspendată",
    verified: "Verificată",
  },
};

const verificationStatusLabels: Record<
  LanguageCode,
  Record<CompanyVerificationStatus, string>
> = {
  de: {
    pending: "Ausstehend",
    rejected: "Abgelehnt",
    verified: "Verifiziert",
  },
  en: {
    pending: "Pending",
    rejected: "Rejected",
    verified: "Verified",
  },
  ro: {
    pending: "În așteptare",
    rejected: "Respinsă",
    verified: "Verificată",
  },
};

export function calculateOrganizationCompletion(
  company: PublicCompanyProfile
): OrganizationCompletion {
  const fields = {
    city: hasText(company.city),
    description: hasText(company.description),
    employee_count_range: hasText(company.employee_count_range),
    industry: hasText(company.industry),
    name: hasText(company.name),
    website: hasText(company.website),
  } satisfies Record<OrganizationCompletionField, boolean>;
  const totalCount = organizationCompletionFieldKeys.length;
  const completedCount = organizationCompletionFieldKeys.filter(
    (field) => fields[field]
  ).length;

  return {
    completedCount,
    fields,
    percentage: Math.round((completedCount / totalCount) * 100),
    totalCount,
  };
}

export function getOrganizationInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "O";
}

export function getCompanyStatusLabel(
  status: CompanyStatus,
  language: LanguageCode
) {
  return companyStatusLabels[language][status];
}

export function getCompanyVerificationLabel(
  status: CompanyVerificationStatus,
  language: LanguageCode
) {
  return verificationStatusLabels[language][status];
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}
