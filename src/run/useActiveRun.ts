import { useCallback, useSyncExternalStore } from "react";
import type { Run } from "../types";
import { getActiveRunSnapshot, subscribeToRuns, updateActiveRun } from "./storage";

export function useActiveRun() {
  const run = useSyncExternalStore(subscribeToRuns, getActiveRunSnapshot);
  const id = run?.id;
  const setRun = useCallback((update: (current: Run) => Run) => {
    updateActiveRun(id, update);
  }, [id]);
  return [run, setRun] as const;
}
