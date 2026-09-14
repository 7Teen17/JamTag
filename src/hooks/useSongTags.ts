import { useCallback, useSyncExternalStore } from "react";
import { getSongTagsSnapshot, subscribeSongTags } from "../db/db";

export function useSongTags(songId = "") {
  const subscribe = useCallback(
    (listener: () => void) => subscribeSongTags(songId, listener),
    [songId],
  );
  const getSnapshot = useCallback(() => getSongTagsSnapshot(songId), [songId]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
