import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type CompanyVerificationStatus = "pending" | "verified" | "rejected";

export type CompanyStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "archived"
  | "draft"
  | "pending"
  | "verified";

export type PublicCompanyProfile = {
  id: string;
  name: string;
  city: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  employee_count_range: string | null;
  verification_status: CompanyVerificationStatus;
};

export type CompanyProfile = PublicCompanyProfile & {
  owner_user_id: string;
  profile_id: string | null;
  legal_name: string | null;
  country_code: string;
  postal_code: string | null;
  address: string | null;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
};

export type SaveCompanyInput = {
  address: string | null;
  city: string;
  countryCode?: string;
  description: string | null;
  employeeCountRange: string | null;
  industry: string;
  legalName: string | null;
  name: string;
  postalCode: string | null;
  website: string | null;
};

export type CompanyDashboardJob = {
  id: string;
  company_id: string;
  title: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  location: {
    id: string;
    postal_code: string;
    city: string;
    district: string | null;
    state: string;
  } | null;
};

const companySelect = [
  "id",
  "owner_user_id",
  "profile_id",
  "name",
  "legal_name",
  "country_code",
  "city",
  "postal_code",
  "address",
  "website",
  "description",
  "industry",
  "employee_count_range",
  "verification_status",
  "status",
  "created_at",
  "updated_at",
].join(", ");

// Keep the public projection deliberately small. The database currently grants
// row-level public reads for active, verified companies, but does not provide a
// column-restricted public view yet.
const publicCompanySelect = [
  "id",
  "name",
  "city",
  "website",
  "description",
  "industry",
  "employee_count_range",
  "verification_status",
].join(", ");

const companyDashboardJobSelect = [
  "id",
  "company_id",
  "title",
  "status",
  "created_at",
  "expires_at",
  "location:locations(id, postal_code, city, district, state)",
].join(", ");

export async function fetchOwnCompany(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select(companySelect)
    .eq("owner_user_id", userId)
    .maybeSingle()
    .returns<CompanyProfile | null>();

  if (error) {
    throw new Error(error.message || "Company profile could not be loaded.");
  }

  return data ?? null;
}

export async function fetchOwnCompanies(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select(companySelect)
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: true })
    .returns<CompanyProfile[]>();

  if (error) {
    throw new Error(error.message || "Company profiles could not be loaded.");
  }

  return data ?? [];
}

export async function fetchPublicCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select(publicCompanySelect)
    .eq("id", companyId)
    .eq("status", "active")
    .eq("verification_status", "verified")
    .maybeSingle()
    .returns<PublicCompanyProfile | null>();

  if (error) {
    throw new Error(error.message || "Company profile could not be loaded.");
  }

  return data ?? null;
}

export function toPublicCompanyProfile(
  company: CompanyProfile
): PublicCompanyProfile {
  return {
    city: company.city,
    description: company.description,
    employee_count_range: company.employee_count_range,
    id: company.id,
    industry: company.industry,
    name: company.name,
    verification_status: company.verification_status,
    website: company.website,
  };
}

export async function saveOwnCompany(
  input: SaveCompanyInput
): Promise<CompanyProfile> {
  const { data, error } = await supabase
    .rpc("upsert_own_company", {
      p_address: input.address,
      p_city: input.city,
      p_country_code: input.countryCode ?? "DE",
      p_description: input.description,
      p_employee_count_range: input.employeeCountRange,
      p_industry: input.industry,
      p_legal_name: input.legalName,
      p_name: input.name,
      p_postal_code: input.postalCode,
      p_website: input.website,
    })
    .returns<CompanyProfile | CompanyProfile[]>();

  if (error) {
    throw new Error(error.message || "Company profile could not be saved.");
  }

  const company = Array.isArray(data) ? data[0] : data;

  if (!isCompanyProfile(company)) {
    throw new Error("Company profile could not be saved.");
  }

  return company;
}

function isCompanyProfile(value: unknown): value is CompanyProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

export async function fetchOwnCompanyJobs(companyId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select(companyDashboardJobSelect)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .returns<CompanyDashboardJob[]>();

  if (error) {
    throw new Error(error.message || "Company jobs could not be loaded.");
  }

  return data ?? [];
}

export async function deactivateOwnJob(jobId: string) {
  const { data, error } = await supabase.rpc("deactivate_own_job", {
    p_job_id: jobId,
  });

  if (error) {
    throw new Error(error.message || "Job could not be deactivated.");
  }

  return data as string;
}
