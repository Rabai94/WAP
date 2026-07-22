import type { CourseEnrollmentStatus } from "@/services/courses/courseService";

export function canWithdrawCourseEnrollment(
  status: CourseEnrollmentStatus
): boolean {
  return status === "submitted" || status === "viewed";
}

export function formatCourseEnrollmentStatus(
  status: CourseEnrollmentStatus
): string {
  const labels: Record<CourseEnrollmentStatus, string> = {
    accepted: "Acceptată",
    rejected: "Respinsă",
    submitted: "Trimisă",
    viewed: "Vizualizată",
    withdrawn: "Retrasă",
  };

  return labels[status];
}
