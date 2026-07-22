import {
  fetchCachedCourseEnrollments,
  readCourseEnrollmentMap,
  subscribeCourseEnrollments,
} from "./courseQuickViewData";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export function useCourseEnrollmentMap(userId: string | null) {
  const subscribe = useCallback(
    (listener: () => void) =>
      userId ? subscribeCourseEnrollments(userId, listener) : () => undefined,
    [userId]
  );
  const getSnapshot = useCallback(
    () => readCourseEnrollmentMap(userId),
    [userId]
  );
  const enrollmentMap = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    void fetchCachedCourseEnrollments(userId, true).catch(() => {
      // Enrollment-sensitive actions perform their own fail-closed refresh.
    });
  }, [userId]);

  return enrollmentMap;
}
