import { useContext, createContext } from "react";
import type { TokenResponse } from "expo-auth-session";

import type { SpotifyMusicService } from "@/src/services/music/providers/spotify";

export type SpotifyAuthContextValue = {
  isSigningIn: boolean;
  canSignIn: boolean;
  refresh: () => Promise<TokenResponse | null>;
  signIn: () => Promise<TokenResponse | null>;
  signOut: () => Promise<void>;
} & (
  | {
      status: "signedIn";
      musicService: SpotifyMusicService;
    }
  | {
      status: "restoring" | "signedOut";
      musicService: null;
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
