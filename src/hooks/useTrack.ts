import { useEffect, useState } from "react";
import { MusicTrack } from "../services/music/types";
import { useSpotifyAuth } from "./auth/useSpotifyAuth";

export function useTrack(id: string) {
  const { musicService } = useSpotifyAuth();
  const [result, setResult] = useState<{
    id: string;
    service: typeof musicService;
    track: MusicTrack | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (musicService) {
      musicService.getTrack(id)
        .catch(() => null)
        .then((track) => {
          if (!cancelled) setResult({ id, service: musicService, track });
        });
    }
    return () => {
      cancelled = true;
    };
  }, [id, musicService]);

  const resolved = result?.id === id && result?.service === musicService;
  return {
    track: musicService && resolved ? result.track : null,
    loading: Boolean(musicService && !resolved),
  };
}
