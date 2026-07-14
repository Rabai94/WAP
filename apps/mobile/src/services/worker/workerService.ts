import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type WorkerProfile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  city: string | null;
  postal_code: string | null;
  location_id: string;
  phone: string | null;
  preferred_language: string;
  occupation_id: string;
  experience_years: number;
  availability_status: string;
  work_authorization_status: string;
  profile_status: string;
  professional_summary: string | null;
  created_at: string;
  updated_at: string;
  location?: {
    id: string;
    country_code: string;
    postal_code: string;
    city: string;
    district: string | null;
    state: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  occupation?: {
    id: string;
    slug: string;
    category_id: string;
    name_ro: string;
    name_de: string;
    name_en: string;
    category?: {
      id: string;
      slug: string;
      name_ro: string;
      name_de: string;
      name_en: string;
    } | null;
  } | null;
};

export type SaveWorkerProfileInput = {
  availabilityStatus: string;
  experienceYears: number;
  firstName: string;
  lastName: string;
  locationId: string;
  occupationId: string;
  phone: string | null;
  preferredLanguage: string;
  professionalSummary: string | null;
  workAuthorizationStatus: string;
};

export type JobDetails = {
  job_id: string;
  title: string;
  description: string;
  company_id: string;
  company_name: string;
  location_id: string;
  location_label: string;
  city: string;
  postal_code: string;
  state: string;
  salary_from: number | null;
  salary_to: number | null;
  salary_type: string;
  employment_type: string;
  experience_level: string;
  working_hours: string | null;
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
  expires_at: string | null;
};

export type WorkerApplication = {
  application_id: string;
  job_id: string;
  job_title: string;
  company_name: string;
  location_label: string;
  city: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyApplication = {
  application_id: string;
  job_id: string;
  job_title: string;
  worker_profile_id: string;
  worker_name: string;
  worker_city: string;
  worker_location_label: string;
  occupation_name_ro: string;
  occupation_name_de: string;
  occupation_name_en: string;
  experience_years: number;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
};

const workerProfileSelect = [
  "id",
  "user_id",
  "first_name",
  "last_name",
  "city",
  "postal_code",
  "location_id",
  "phone",
  "preferred_language",
  "occupation_id",
  "experience_years",
  "availability_status",
  "work_authorization_status",
  "profile_status",
  "professional_summary",
  "created_at",
  "updated_at",
  "location:locations(id, country_code, postal_code, city, district, state, latitude, longitude)",
  "occupation:occupations(id, slug, category_id, name_ro, name_de, name_en, category:job_categories(id, slug, name_ro, name_de, name_en))",
].join(", ");

export async function fetchOwnWorkerProfile(userId: string) {
  const { data, error } = await supabase
    .from("worker_profiles")
    .select(workerProfileSelect)
    .eq("user_id", userId)
    .maybeSingle()
    .returns<WorkerProfile | null>();

  if (error) {
    throw new Error(error.message || "Worker profile could not be loaded.");
  }

  return data ?? null;
}

export async function saveOwnWorkerProfile(input: SaveWorkerProfileInput) {
  const { data, error } = await supabase
    .rpc("upsert_own_worker_profile", {
      p_availability_status: input.availabilityStatus,
      p_experience_years: input.experienceYears,
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_location_id: input.locationId,
      p_occupation_id: input.occupationId,
      p_phone: input.phone,
      p_preferred_language: input.preferredLanguage,
      p_professional_summary: input.professionalSummary,
      p_work_authorization_status: input.workAuthorizationStatus,
    })
    .returns<WorkerProfile>();

  if (error) {
    throw new Error(error.message || "Worker profile could not be saved.");
  }

  return data;
}

export async function fetchJobDetails(jobId: string) {
  const { data, error } = await supabase
    .rpc("get_job_details", {
      p_job_id: jobId,
    })
    .maybeSingle()
    .returns<JobDetails | null>();

  if (error) {
    throw new Error(error.message || "Job could not be loaded.");
  }

  return data ?? null;
}

export async function applyToJob(jobId: string, message?: string | null) {
  const { data, error } = await supabase.rpc("apply_to_job", {
    p_job_id: jobId,
    p_message: message ?? null,
  });

  if (error) {
    throw new Error(error.message || "Application could not be sent.");
  }

  return data as string;
}

export async function withdrawApplication(applicationId: string) {
  const { data, error } = await supabase.rpc("withdraw_application", {
    p_application_id: applicationId,
  });

  if (error) {
    throw new Error(error.message || "Application could not be withdrawn.");
  }

  return data as string;
}

export async function listWorkerApplications() {
  const { data, error } = await supabase
    .rpc("list_worker_applications");

  if (error) {
    throw new Error(error.message || "Worker applications could not be loaded.");
  }

  return ((data ?? []) as unknown) as WorkerApplication[];
}

export async function listCompanyApplications() {
  const { data, error } = await supabase
    .rpc("list_company_applications");

  if (error) {
    throw new Error(error.message || "Company applications could not be loaded.");
  }

  return ((data ?? []) as unknown) as CompanyApplication[];
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const { data, error } = await supabase.rpc("update_application_status", {
    p_application_id: applicationId,
    p_status: status,
  });

  if (error) {
    throw new Error(error.message || "Application status could not be updated.");
  }

  return data as string;
}
