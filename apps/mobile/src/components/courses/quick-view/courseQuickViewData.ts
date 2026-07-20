import {
  fetchCourseDetails,
  listUserCourseEnrollments,
  type CourseDetails,
  type CourseEnrollmentStatus,
  type UserCourseEnrollment,
} from "@/services/courses/courseService";

export type CourseEnrollmentSnapshot = Pick<
  UserCourseEnrollment,
  "course_id" | "enrollment_id" | "status"
> &
  Partial<
    Pick<
      UserCourseEnrollment,
      | "course_title"
      | "created_at"
      | "location_label"
      | "message"
      | "provider_name"
      | "start_date"
      | "updated_at"
    >
  >;

type CourseEnrollmentListener = () => void;

type LocalEnrollmentDetails = {
  courseTitle?: string;
  locationLabel?: string | null;
  message?: string | null;
  providerName?: string;
};

const courseDetailsCache = new Map<string, CourseDetails | null>();
const courseDetailsRequests = new Map<
  string,
  Promise<CourseDetails | null>
>();
const courseDetailsCacheVersions = new Map<string, number>();
const courseEnrollmentsCache = new Map<string, UserCourseEnrollment[]>();
const courseEnrollmentsRequests = new Map<
  string,
  Promise<UserCourseEnrollment[]>
>();
const courseEnrollmentsCacheVersions = new Map<string, number>();
const localCourseEnrollments = new Map<
  string,
  Map<string, CourseEnrollmentSnapshot>
>();
const courseEnrollmentMaps = new Map<
  string,
  ReadonlyMap<string, CourseEnrollmentSnapshot>
>();
const courseEnrollmentListeners = new Map<
  string,
  Set<CourseEnrollmentListener>
>();
const emptyCourseEnrollmentMap = new Map<
  string,
  CourseEnrollmentSnapshot
>();

export function readCachedCourseDetails(
  courseId: string
): CourseDetails | null | undefined {
  return courseDetailsCache.get(courseId);
}

export async function fetchCachedCourseDetails(
  courseId: string,
  force = false
): Promise<CourseDetails | null> {
  if (!force && courseDetailsCache.has(courseId)) {
    return courseDetailsCache.get(courseId) ?? null;
  }

  const activeRequest = courseDetailsRequests.get(courseId);

  if (activeRequest && !force) {
    return activeRequest;
  }

  if (force) {
    courseDetailsCache.delete(courseId);
    courseDetailsCacheVersions.set(
      courseId,
      readCourseDetailsCacheVersion(courseId) + 1
    );
  }

  const requestVersion = readCourseDetailsCacheVersion(courseId);
  const request = fetchCourseDetails(courseId)
    .then((details) => {
      if (readCourseDetailsCacheVersion(courseId) === requestVersion) {
        courseDetailsCache.set(courseId, details);
      }

      return details;
    })
    .finally(() => {
      if (courseDetailsRequests.get(courseId) === request) {
        courseDetailsRequests.delete(courseId);
      }
    });

  courseDetailsRequests.set(courseId, request);
  return request;
}

function readCourseDetailsCacheVersion(courseId: string): number {
  return courseDetailsCacheVersions.get(courseId) ?? 0;
}

export function readCachedCourseEnrollments(
  userId: string
): UserCourseEnrollment[] | undefined {
  return courseEnrollmentsCache.get(userId);
}

export function readCourseEnrollmentMap(
  userId: string | null
): ReadonlyMap<string, CourseEnrollmentSnapshot> {
  if (!userId) {
    return emptyCourseEnrollmentMap;
  }

  const cachedMap = courseEnrollmentMaps.get(userId);

  if (cachedMap) {
    return cachedMap;
  }

  return publishCourseEnrollmentMap(userId, false);
}

export function subscribeCourseEnrollments(
  userId: string,
  listener: CourseEnrollmentListener
): () => void {
  const listeners =
    courseEnrollmentListeners.get(userId) ?? new Set<CourseEnrollmentListener>();

  listeners.add(listener);
  courseEnrollmentListeners.set(userId, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      courseEnrollmentListeners.delete(userId);
    }
  };
}

export function invalidateCachedCourseEnrollments(userId: string): void {
  courseEnrollmentsCache.delete(userId);
  courseEnrollmentsRequests.delete(userId);
  courseEnrollmentsCacheVersions.set(
    userId,
    readCourseEnrollmentsCacheVersion(userId) + 1
  );
}

export async function fetchCachedCourseEnrollments(
  userId: string,
  force = false
): Promise<UserCourseEnrollment[]> {
  if (!force && courseEnrollmentsCache.has(userId)) {
    return courseEnrollmentsCache.get(userId) ?? [];
  }

  const activeRequest = courseEnrollmentsRequests.get(userId);

  if (activeRequest) {
    return activeRequest;
  }

  if (force) {
    courseEnrollmentsCache.delete(userId);
  }

  const requestVersion = readCourseEnrollmentsCacheVersion(userId);
  const request = listUserCourseEnrollments()
    .then((enrollments) => {
      if (readCourseEnrollmentsCacheVersion(userId) === requestVersion) {
        courseEnrollmentsCache.set(userId, enrollments);
        reconcileLocalCourseEnrollments(userId, enrollments);
        publishCourseEnrollmentMap(userId);
      }

      return enrollments;
    })
    .finally(() => {
      if (courseEnrollmentsRequests.get(userId) === request) {
        courseEnrollmentsRequests.delete(userId);
      }
    });

  courseEnrollmentsRequests.set(userId, request);
  return request;
}

export function findExistingCourseEnrollment(
  userId: string,
  courseId: string,
  enrollments: readonly UserCourseEnrollment[]
): CourseEnrollmentSnapshot | null {
  const localEnrollment = localCourseEnrollments.get(userId)?.get(courseId);

  if (localEnrollment) {
    return localEnrollment;
  }

  const enrollment = enrollments.find((item) => item.course_id === courseId);

  if (enrollment) {
    return pickCourseEnrollmentSnapshot(enrollment);
  }

  return readCourseEnrollmentMap(userId).get(courseId) ?? null;
}

export function markCourseEnrollmentLocally(
  userId: string,
  courseId: string,
  enrollmentId: string,
  details: LocalEnrollmentDetails = {}
): CourseEnrollmentSnapshot {
  const status: CourseEnrollmentStatus = "submitted";
  const enrollment = {
    course_id: courseId,
    course_title: details.courseTitle,
    enrollment_id: enrollmentId,
    location_label: details.locationLabel,
    message: details.message,
    provider_name: details.providerName,
    status,
  };
  const userEnrollments =
    localCourseEnrollments.get(userId) ??
    new Map<string, CourseEnrollmentSnapshot>();

  userEnrollments.set(courseId, enrollment);
  localCourseEnrollments.set(userId, userEnrollments);
  publishCourseEnrollmentMap(userId);

  return enrollment;
}

export function markCourseEnrollmentStatusLocally(
  userId: string,
  courseId: string,
  enrollmentId: string,
  status: CourseEnrollmentStatus,
  fallbackEnrollment?: CourseEnrollmentSnapshot
): CourseEnrollmentSnapshot | null {
  const currentEnrollment =
    readCourseEnrollmentMap(userId).get(courseId) ?? fallbackEnrollment;

  if (
    !currentEnrollment ||
    currentEnrollment.enrollment_id !== enrollmentId
  ) {
    return null;
  }

  const nextEnrollment: CourseEnrollmentSnapshot = {
    ...currentEnrollment,
    status,
  };
  const userEnrollments =
    localCourseEnrollments.get(userId) ??
    new Map<string, CourseEnrollmentSnapshot>();

  userEnrollments.set(courseId, nextEnrollment);
  localCourseEnrollments.set(userId, userEnrollments);
  publishCourseEnrollmentMap(userId);

  return nextEnrollment;
}

function readCourseEnrollmentsCacheVersion(userId: string): number {
  return courseEnrollmentsCacheVersions.get(userId) ?? 0;
}

function reconcileLocalCourseEnrollments(
  userId: string,
  enrollments: readonly UserCourseEnrollment[]
): void {
  const localEnrollments = localCourseEnrollments.get(userId);

  if (!localEnrollments) {
    return;
  }

  for (const enrollment of enrollments) {
    const localEnrollment = localEnrollments.get(enrollment.course_id);

    // A confirmed withdrawal wins until the server returns that same terminal state.
    if (
      localEnrollment?.enrollment_id === enrollment.enrollment_id &&
      (localEnrollment.status !== "withdrawn" ||
        enrollment.status === "withdrawn")
    ) {
      localEnrollments.delete(enrollment.course_id);
    }
  }

  if (localEnrollments.size === 0) {
    localCourseEnrollments.delete(userId);
  }
}

function pickCourseEnrollmentSnapshot(
  enrollment: UserCourseEnrollment
): CourseEnrollmentSnapshot {
  return {
    course_id: enrollment.course_id,
    course_title: enrollment.course_title,
    created_at: enrollment.created_at,
    enrollment_id: enrollment.enrollment_id,
    location_label: enrollment.location_label,
    message: enrollment.message,
    provider_name: enrollment.provider_name,
    start_date: enrollment.start_date,
    status: enrollment.status,
    updated_at: enrollment.updated_at,
  };
}

function publishCourseEnrollmentMap(
  userId: string,
  notify = true
): ReadonlyMap<string, CourseEnrollmentSnapshot> {
  const nextMap = new Map<string, CourseEnrollmentSnapshot>();

  for (const enrollment of courseEnrollmentsCache.get(userId) ?? []) {
    nextMap.set(
      enrollment.course_id,
      pickCourseEnrollmentSnapshot(enrollment)
    );
  }

  for (const [courseId, enrollment] of
    localCourseEnrollments.get(userId) ?? []) {
    nextMap.set(courseId, enrollment);
  }

  courseEnrollmentMaps.set(userId, nextMap);

  if (notify) {
    for (const listener of courseEnrollmentListeners.get(userId) ?? []) {
      listener();
    }
  }

  return nextMap;
}
