import type { SearchJobResult } from "@/services/jobs/jobFlowService";
import { useCallback, useState } from "react";

export type JobQuickViewIntent = "apply" | "view";

export type JobQuickViewSelection = {
  intent: JobQuickViewIntent;
  job: SearchJobResult;
  requestId: number;
  returnTo: string;
};

export function useJobQuickView() {
  const [selection, setSelection] = useState<JobQuickViewSelection | null>(null);

  const openJobQuickView = useCallback(
    (job: SearchJobResult, intent: JobQuickViewIntent, returnTo: string) => {
      setSelection((currentSelection) => ({
        intent,
        job,
        requestId: (currentSelection?.requestId ?? 0) + 1,
        returnTo,
      }));
    },
    []
  );

  const closeJobQuickView = useCallback(() => {
    setSelection(null);
  }, []);

  return {
    closeJobQuickView,
    openJobQuickView,
    selection,
  };
}
