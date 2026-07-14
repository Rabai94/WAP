import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type JobCategory = {
  id: string;
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
  sort_order: number | null;
};

export type JobOccupation = {
  id: string;
  category_id: string;
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
};

export type CompanySummary = {
  id: string;
  name: string;
  verification_status: string;
  status: string;
};

export type PublishJobInput = {
  categoryId: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  expiresAt: string | null;
  language: string;
  locationId: string;
  occupationId: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryType: string;
  title: string;
  workingHours: string | null;
};

export type SearchJobsInput = {
  employmentType?: string | null;
  experienceLevel?: string | null;
  language?: string | null;
  latitude?: number | null;
  locationId?: string | null;
  longitude?: number | null;
  occupationId?: string | null;
  occupationSlug?: string | null;
  page?: number | null;
  salaryMin?: number | null;
};

export type SearchJobResult = {
  job_id: string;
  title: string;
  company_id: string;
  company_name: string;
  location_id: string;
  location_label: string;
  city: string;
  postal_code: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  salary_from: number | null;
  salary_to: number | null;
  salary_type: string;
  employment_type: string;
  experience_level: string;
  language: string;
  occupation_id: string;
  occupation_slug: string;
  occupation_name_ro: string;
  occupation_name_de: string;
  occupation_name_en: string;
  category_id: string;
  category_slug: string;
  category_name_ro: string;
  category_name_de: string;
  category_name_en: string;
  published_at: string;
  total_count: number;
};

export async function fetchJobCategories() {
  const { data, error } = await supabase
    .from("job_categories")
    .select("id, slug, name_ro, name_de, name_en, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<JobCategory[]>();

  if (error) {
    throw new Error(error.message || "Job categories could not be loaded.");
  }

  return data ?? [];
}

export async function fetchOccupations(categoryId?: string | null) {
  let query = supabase
    .from("occupations")
    .select("id, category_id, slug, name_ro, name_de, name_en")
    .eq("is_active", true)
    .order("name_ro", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.returns<JobOccupation[]>();

  if (error) {
    throw new Error(error.message || "Occupations could not be loaded.");
  }

  return data ?? [];
}

export async function fetchCurrentUserCompany(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, verification_status, status")
    .eq("owner_user_id", userId)
    .eq("status", "active")
    .eq("verification_status", "verified")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
    .returns<CompanySummary | null>();

  if (error) {
    throw new Error(error.message || "Company profile could not be loaded.");
  }

  return data ?? null;
}

export async function publishJob(input: PublishJobInput) {
  const { data, error } = await supabase
    .rpc("publish_job", {
      p_category_id: input.categoryId,
      p_description: input.description,
      p_employment_type: input.employmentType,
      p_experience_level: input.experienceLevel,
      p_expires_at: input.expiresAt,
      p_language: input.language,
      p_location_id: input.locationId,
      p_occupation_id: input.occupationId,
      p_salary_from: input.salaryFrom,
      p_salary_to: input.salaryTo,
      p_salary_type: input.salaryType,
      p_title: input.title,
      p_working_hours: input.workingHours,
    });

  if (error) {
    throw new Error(error.message || "Job could not be published.");
  }

  return data as string;
}

export async function searchJobs(input: SearchJobsInput) {
  const { data, error } = await supabase
    .rpc("search_jobs", {
      p_employment_type: input.employmentType || null,
      p_experience_level: input.experienceLevel || null,
      p_language: input.language || null,
      p_latitude: input.latitude ?? null,
      p_location_id: input.locationId || null,
      p_longitude: input.longitude ?? null,
      p_occupation_id: input.occupationId || null,
      p_occupation_slug: input.occupationSlug || null,
      p_page: input.page ?? 1,
      p_salary_min: input.salaryMin ?? null,
    });

  if (error) {
    throw new Error(error.message || "Jobs could not be loaded.");
  }

  return (data ?? []) as SearchJobResult[];
}
