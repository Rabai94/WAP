import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type CourseCategory = {
  id: string;
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
  sort_order: number | null;
};

export type SearchCoursesInput = {
  categoryId?: string | null;
  deliveryMode?: string | null;
  languageCode?: string | null;
  level?: string | null;
  locationId?: string | null;
  maximumPrice?: number | null;
  page?: number | null;
  pageSize?: number | null;
  searchText?: string | null;
};

export type SearchCourseResult = {
  course_id: string;
  title: string;
  short_description: string | null;
  provider_id: string;
  provider_name: string;
  category_id: string | null;
  category_slug: string | null;
  category_name_ro: string | null;
  category_name_de: string | null;
  category_name_en: string | null;
  location_id: string | null;
  location_label: string | null;
  city: string | null;
  postal_code: string | null;
  state: string | null;
  delivery_mode: string | null;
  language_code: string | null;
  price_amount: number | null;
  currency_code: string | null;
  duration_value: number | null;
  duration_unit: string | null;
  start_date: string | null;
  certificate_available: boolean | null;
  level: string | null;
  published_at: string;
  total_count: number;
};

export type CourseDetails = Omit<SearchCourseResult, "total_count"> & {
  slug: string | null;
  description: string;
  provider_description: string | null;
  provider_website: string | null;
  provider_email: string | null;
  provider_phone: string | null;
  end_date: string | null;
  enrollment_deadline: string | null;
  capacity: number | null;
  enrolled_count: number;
  available_spots: number | null;
  expires_at: string | null;
};

export type CourseEnrollmentStatus =
  | "submitted"
  | "viewed"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type UserCourseEnrollment = {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  provider_name: string;
  location_label: string | null;
  status: CourseEnrollmentStatus;
  message: string | null;
  start_date: string | null;
  created_at: string;
  updated_at: string;
};

export type ProviderCourseEnrollment = {
  enrollment_id: string;
  course_id: string;
  course_title: string;
  applicant_user_id: string;
  applicant_email: string | null;
  status: CourseEnrollmentStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchCourseCategories() {
  const { data, error } = await supabase
    .from("course_categories")
    .select("id, slug, name_ro, name_de, name_en, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<CourseCategory[]>();

  if (error) {
    throw new Error(error.message || "Course categories could not be loaded.");
  }

  return data ?? [];
}

export async function searchCourses(input: SearchCoursesInput) {
  const { data, error } = await supabase
    .rpc("search_courses", {
      p_category_id: input.categoryId || null,
      p_delivery_mode: input.deliveryMode || null,
      p_language_code: input.languageCode || null,
      p_level: input.level || null,
      p_location_id: input.locationId || null,
      p_maximum_price: input.maximumPrice ?? null,
      p_page: input.page ?? 1,
      p_page_size: input.pageSize ?? 20,
      p_search_text: input.searchText || null,
    });

  if (error) {
    throw new Error(error.message || "Courses could not be loaded.");
  }

  return (data ?? []) as SearchCourseResult[];
}

export async function fetchLatestPublishedCourses(limit = 4) {
  const safeLimit = Math.min(Math.max(limit, 1), 4);
  const results = await searchCourses({
    page: 1,
    pageSize: safeLimit,
  });

  return results.slice(0, safeLimit);
}

export async function fetchCourseDetails(courseId: string) {
  const { data, error } = await supabase
    .rpc("get_course_details", {
      p_course_id: courseId,
    })
    .maybeSingle()
    .returns<CourseDetails | null>();

  if (error) {
    throw new Error(error.message || "Course could not be loaded.");
  }

  return data ?? null;
}

export async function enrollInCourse(courseId: string, message?: string | null) {
  const { data, error } = await supabase.rpc("enroll_in_course", {
    p_course_id: courseId,
    p_message: message ?? null,
  });

  if (error) {
    throw new Error(error.message || "Course enrollment could not be created.");
  }

  return data as string;
}

export async function withdrawCourseEnrollment(enrollmentId: string) {
  const { data, error } = await supabase.rpc("withdraw_course_enrollment", {
    p_enrollment_id: enrollmentId,
  });

  if (error) {
    throw new Error(error.message || "Course enrollment could not be withdrawn.");
  }

  return data as string;
}

export async function listUserCourseEnrollments() {
  const { data, error } = await supabase
    .rpc("list_user_course_enrollments");

  if (error) {
    throw new Error(error.message || "Course enrollments could not be loaded.");
  }

  return (data ?? []) as UserCourseEnrollment[];
}

export async function listProviderCourseEnrollments() {
  const { data, error } = await supabase
    .rpc("list_provider_course_enrollments");

  if (error) {
    throw new Error(
      error.message || "Provider course enrollments could not be loaded."
    );
  }

  return (data ?? []) as ProviderCourseEnrollment[];
}
