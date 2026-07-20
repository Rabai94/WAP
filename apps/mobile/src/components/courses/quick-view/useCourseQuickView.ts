import type { SearchCourseResult } from "@/services/courses/courseService";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export type CourseQuickViewIntent = "enroll" | "view";

export type CourseQuickViewSelection = {
  intent: CourseQuickViewIntent;
  course: SearchCourseResult;
  requestId: number;
  returnTo: string;
};

type FocusTarget = {
  focus: () => void;
};

export function useCourseQuickView() {
  const [selection, setSelection] =
    useState<CourseQuickViewSelection | null>(null);
  const openLockRef = useRef(false);
  const requestIdRef = useRef(0);
  const focusTargetRef = useRef<FocusTarget | null>(null);
  const restoreFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(
    () => () => {
      if (restoreFocusTimerRef.current !== null) {
        clearTimeout(restoreFocusTimerRef.current);
      }

      focusTargetRef.current = null;
      openLockRef.current = false;
    },
    []
  );

  const openCourseQuickView = useCallback(
    (
      course: SearchCourseResult,
      intent: CourseQuickViewIntent,
      returnTo: string
    ) => {
      if (openLockRef.current) {
        return;
      }

      openLockRef.current = true;

      if (restoreFocusTimerRef.current !== null) {
        clearTimeout(restoreFocusTimerRef.current);
        restoreFocusTimerRef.current = null;
      }

      focusTargetRef.current = readActiveFocusTarget();
      requestIdRef.current += 1;
      setSelection({
        course,
        intent,
        requestId: requestIdRef.current,
        returnTo,
      });
    },
    []
  );

  const closeCourseQuickView = useCallback(() => {
    if (!openLockRef.current) {
      return;
    }

    openLockRef.current = false;
    const focusTarget = focusTargetRef.current;
    focusTargetRef.current = null;
    setSelection(null);

    if (!focusTarget || Platform.OS !== "web") {
      return;
    }

    restoreFocusTimerRef.current = setTimeout(() => {
      restoreFocusTimerRef.current = null;

      try {
        focusTarget.focus();
      } catch {
        // The trigger can disappear while the modal is closing.
      }
    }, 0);
  }, []);

  return {
    closeCourseQuickView,
    openCourseQuickView,
    selection,
  };
}

function readActiveFocusTarget(): FocusTarget | null {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return null;
  }

  const activeElement: unknown = document.activeElement;

  if (activeElement === document.body || !isFocusTarget(activeElement)) {
    return null;
  }

  return activeElement;
}

function isFocusTarget(value: unknown): value is FocusTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof value.focus === "function"
  );
}
