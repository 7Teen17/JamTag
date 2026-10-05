import { useCallback, useSyncExternalStore } from "react";
import { getRecentlyTaggedSnapshot, subscribeRecentlyTagged } from "../db/db";

export function useRecentlyTagged(limit = 10) {
  const getSnapshot = useCallback(() => getRecentlyTaggedSnapshot(limit), [limit]);

  return useSyncExternalStore(subscribeRecentlyTagged, getSnapshot);
}
