import { useContext, createContext } from "react";
import type { TokenResponse } from "expo-auth-session";

import type { SpotifyMusicService } from "@/src/services/music/providers/spotify";
import type { MusicAuthSession } from "@/src/services/music/types";

export type SpotifyAuthContextValue = {
  isLoading: boolean;
  isRestoringAuth: boolean;
  isReady: boolean;
  redirectUri: string;
  refresh: () => Promise<TokenResponse | null>;
  signIn: () => Promise<TokenResponse | null>;
  signOut: () => Promise<void>;
} & (
  | {
      accessToken: string;
      authSession: MusicAuthSession;
      isAuthenticated: true;
      musicService: SpotifyMusicService;
      tokenResponse: TokenResponse;
    }
  | {
      accessToken: null;
      authSession: null;
      isAuthenticated: false;
      musicService: null;
      tokenResponse: null;
    }
);

export const SpotifyAuthContext =
  createContext<SpotifyAuthContextValue | null>(null);

export function useSpotifyAuth() {
  const auth = useContext(SpotifyAuthContext);

  if (!auth) {
    throw new Error("useSpotifyAuth must be used inside SpotifyAuthProvider.");
  }

  return auth;
}
