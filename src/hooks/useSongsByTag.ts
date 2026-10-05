import { useCallback, useSyncExternalStore } from "react";
import { getSongsByTagsSnapshot, subscribeSongsByTag } from "../db/db";

export function useSongsByTag(tagId: number) {
  const subscribe = useCallback(
    (listener: () => void) => subscribeSongsByTag(tagId, listener),
    [tagId],
  );

  const getSnapshot = useCallback(() => getSongsByTagsSnapshot(tagId), [tagId]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
