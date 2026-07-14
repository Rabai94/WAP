import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type CompanyProfile = {
  id: string;
  owner_user_id: string;
  profile_id: string | null;
  name: string;
  legal_name: string | null;
  country_code: string;
  city: string | null;
  postal_code: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  employee_count_range: string | null;
  verification_status: string;
  status: string;
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

export async function saveOwnCompany(input: SaveCompanyInput) {
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
    .returns<CompanyProfile>();

  if (error) {
    throw new Error(error.message || "Company profile could not be saved.");
  }

  return data;
}
