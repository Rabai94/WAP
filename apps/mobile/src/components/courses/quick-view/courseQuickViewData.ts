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
>;

const courseDetailsCache = new Map<string, CourseDetails | null>();
const courseDetailsRequests = new Map<
  string,
  Promise<CourseDetails | null>
>();
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

  if (activeRequest) {
    return activeRequest;
  }

  if (force) {
    courseDetailsCache.delete(courseId);
  }

  const request = fetchCourseDetails(courseId)
    .then((details) => {
      courseDetailsCache.set(courseId, details);
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

export function readCachedCourseEnrollments(
  userId: string
): UserCourseEnrollment[] | undefined {
  return courseEnrollmentsCache.get(userId);
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
  const enrollment = enrollments.find((item) => item.course_id === courseId);

  if (enrollment) {
    return pickCourseEnrollmentSnapshot(enrollment);
  }

  return localCourseEnrollments.get(userId)?.get(courseId) ?? null;
}

export function markCourseEnrollmentLocally(
  userId: string,
  courseId: string,
  enrollmentId: string
): CourseEnrollmentSnapshot {
  const status: CourseEnrollmentStatus = "submitted";
  const enrollment = {
    course_id: courseId,
    enrollment_id: enrollmentId,
    status,
  };
  const userEnrollments =
    localCourseEnrollments.get(userId) ??
    new Map<string, CourseEnrollmentSnapshot>();

  userEnrollments.set(courseId, enrollment);
  localCourseEnrollments.set(userId, userEnrollments);

  return enrollment;
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
    localEnrollments.delete(enrollment.course_id);
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
    enrollment_id: enrollment.enrollment_id,
    status: enrollment.status,
  };
}
