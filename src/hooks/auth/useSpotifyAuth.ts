import {
  CodeChallengeMethod,
  ResponseType,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
  type TokenResponse,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";

import {
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  SpotifyMusicService,
} from "@/src/services/music/providers/spotify";
import type { MusicAuthSession } from "@/src/services/music/types";

WebBrowser.maybeCompleteAuthSession();

const spotifyClientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

let cachedTokenResponse: TokenResponse | null = null;

function toMusicAuthSession(tokenResponse: TokenResponse): MusicAuthSession {
  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresIn: tokenResponse.expiresIn,
    issuedAt: tokenResponse.issuedAt,
  };
}

export function useSpotifyAuth() {
  const [tokenResponse, setTokenResponseState] = useState<TokenResponse | null>(
    cachedTokenResponse,
  );
  const [isLoading, setIsLoading] = useState(false);

  const setTokenResponse = useCallback((response: TokenResponse | null) => {
    cachedTokenResponse = response;
    setTokenResponseState(response);
  }, []);

  const redirectUri = useMemo(
    () =>
      makeRedirectUri({
        scheme: "jamtag",
        path: "spotify-auth",
      }),
    [],
  );

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: spotifyClientId ?? "",
      codeChallengeMethod: CodeChallengeMethod.S256,
      redirectUri,
      responseType: ResponseType.Code,
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
    },
    spotifyClientId ? SPOTIFY_DISCOVERY : null,
  );

  const authSession = useMemo(
    () => (tokenResponse ? toMusicAuthSession(tokenResponse) : null),
    [tokenResponse],
  );

  const musicService = useMemo(
    () => new SpotifyMusicService(authSession),
    [authSession],
  );

  const signIn = useCallback(async () => {
    if (!spotifyClientId) {
      throw new Error("Missing EXPO_PUBLIC_SPOTIFY_CLIENT_ID.");
    }

    if (!request) {
      throw new Error("Spotify auth request is not ready yet.");
    }

    setIsLoading(true);

    try {
      const result = await promptAsync();

      if (result.type !== "success") {
        return null;
      }

      const code = result.params.code;

      if (!code) {
        throw new Error("Spotify did not return an authorization code.");
      }

      if (!request.codeVerifier) {
        throw new Error("Spotify PKCE code verifier is missing.");
      }

      const response = await exchangeCodeAsync(
        {
          clientId: spotifyClientId,
          code,
          extraParams: {
            code_verifier: request.codeVerifier,
          },
          redirectUri,
        },
        SPOTIFY_DISCOVERY,
      );

      setTokenResponse(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, redirectUri, request, setTokenResponse]);

  const refresh = useCallback(async () => {
    if (!spotifyClientId) {
      throw new Error("Missing EXPO_PUBLIC_SPOTIFY_CLIENT_ID.");
    }

    if (!tokenResponse?.refreshToken) {
      return null;
    }

    const response = await refreshAsync(
      {
        clientId: spotifyClientId,
        refreshToken: tokenResponse.refreshToken,
      },
      SPOTIFY_DISCOVERY,
    );

    setTokenResponse(response);
    return response;
  }, [setTokenResponse, tokenResponse]);

  const signOut = useCallback(() => {
    setTokenResponse(null);
  }, [setTokenResponse]);

  return {
    accessToken: tokenResponse?.accessToken ?? null,
    authSession,
    isAuthenticated: Boolean(tokenResponse?.accessToken),
    isLoading,
    isReady: Boolean(spotifyClientId && request),
    musicService,
    redirectUri,
    refresh,
    signIn,
    signOut,
    tokenResponse,
  };
}
