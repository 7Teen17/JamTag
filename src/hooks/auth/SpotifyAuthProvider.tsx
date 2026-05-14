import {
  CodeChallengeMethod,
  ResponseType,
  TokenResponse,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
  type TokenResponseConfig,
} from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  SPOTIFY_TOKEN_KEY,
  SpotifyMusicService,
} from "@/src/services/music/providers/spotify";
import type { MusicAuthSession } from "@/src/services/music/types";
import {
  SpotifyAuthContext,
  type SpotifyAuthContextValue,
} from "./useSpotifyAuth";

WebBrowser.maybeCompleteAuthSession();

const spotifyClientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
const TOKEN_REFRESH_CHECK_INTERVAL_MS = 30_000;

function toMusicAuthSession(tokenResponse: TokenResponse): MusicAuthSession {
  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken,
    expiresIn: tokenResponse.expiresIn,
    issuedAt: tokenResponse.issuedAt,
  };
}

async function saveToken(response: TokenResponse) {
  const storedToken: TokenResponseConfig = response.getRequestConfig();

  await SecureStore.setItemAsync(
    SPOTIFY_TOKEN_KEY,
    JSON.stringify(storedToken),
  );
}

async function deleteToken() {
  await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_KEY);
}

async function loadToken() {
  const raw = await SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY);

  if (!raw) {
    return null;
  }

  try {
    const storedToken = JSON.parse(raw) as Partial<TokenResponseConfig>;

    if (typeof storedToken.accessToken !== "string") {
      await deleteToken();
      return null;
    }

    return new TokenResponse(storedToken as TokenResponseConfig);
  } catch {
    await deleteToken();
    return null;
  }
}

async function refreshTokenResponse(tokenResponse: TokenResponse) {
  if (!spotifyClientId) {
    throw new Error("Missing EXPO_PUBLIC_SPOTIFY_CLIENT_ID.");
  }

  if (!tokenResponse.refreshToken) {
    return null;
  }

  const response = await refreshAsync(
    {
      clientId: spotifyClientId,
      refreshToken: tokenResponse.refreshToken,
    },
    SPOTIFY_DISCOVERY,
  );

  if (response.refreshToken) {
    return response;
  }

  return new TokenResponse({
    ...response.getRequestConfig(),
    refreshToken: tokenResponse.refreshToken,
  });
}

async function getFreshTokenResponse(tokenResponse: TokenResponse) {
  if (!tokenResponse.shouldRefresh()) {
    return tokenResponse;
  }

  const refreshedToken = await refreshTokenResponse(tokenResponse);

  if (refreshedToken) {
    await saveToken(refreshedToken);
  }

  return refreshedToken;
}

export function SpotifyAuthProvider({ children }: { children: ReactNode }) {
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringAuth, setIsRestoringAuth] = useState(true);

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

  useEffect(() => {
    let isActive = true;

    async function restoreToken() {
      try {
        const savedToken = await loadToken();
        const freshToken = savedToken
          ? await getFreshTokenResponse(savedToken)
          : null;

        if (savedToken && !freshToken) {
          await deleteToken();
        }

        if (isActive) {
          setTokenResponse(freshToken);
        }
      } catch {
        await deleteToken();

        if (isActive) {
          setTokenResponse(null);
        }
      } finally {
        if (isActive) {
          setIsRestoringAuth(false);
        }
      }
    }

    restoreToken();

    return () => {
      isActive = false;
    };
  }, []);

  const authSession = useMemo(
    () => (tokenResponse ? toMusicAuthSession(tokenResponse) : null),
    [tokenResponse],
  );

  const musicService = useMemo(
    () => (authSession ? new SpotifyMusicService(authSession) : null),
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

      await saveToken(response);
      setTokenResponse(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, redirectUri, request]);

  const clearToken = useCallback(async () => {
    await deleteToken();
    setTokenResponse(null);
  }, []);

  const refreshIfNeeded = useCallback(async () => {
    if (!tokenResponse) {
      return null;
    }

    try {
      const freshToken = await getFreshTokenResponse(tokenResponse);

      if (!freshToken) {
        await clearToken();
        return null;
      }

      if (freshToken !== tokenResponse) {
        setTokenResponse(freshToken);
      }

      return freshToken;
    } catch {
      await clearToken();
      return null;
    }
  }, [clearToken, tokenResponse]);

  useEffect(() => {
    if (!tokenResponse) {
      return;
    }

    const intervalId = setInterval(() => {
      refreshIfNeeded();
    }, TOKEN_REFRESH_CHECK_INTERVAL_MS);

    refreshIfNeeded();

    return () => clearInterval(intervalId);
  }, [refreshIfNeeded, tokenResponse]);

  const signOut = useCallback(async () => {
    await clearToken();
  }, [clearToken]);

  const value = useMemo<SpotifyAuthContextValue>(() => {
    const sharedValue = {
      isLoading,
      isRestoringAuth,
      isReady: Boolean(spotifyClientId && request),
      redirectUri,
      refresh: refreshIfNeeded,
      signIn,
      signOut,
    };

    if (tokenResponse && authSession && musicService) {
      return {
        ...sharedValue,
        accessToken: tokenResponse.accessToken,
        authSession,
        isAuthenticated: true,
        musicService,
        tokenResponse,
      };
    }

    return {
      ...sharedValue,
      accessToken: null,
      authSession: null,
      isAuthenticated: false,
      musicService: null,
      tokenResponse: null,
    };
  }, [
    authSession,
    isLoading,
    isRestoringAuth,
    musicService,
    redirectUri,
    refreshIfNeeded,
    request,
    signIn,
    signOut,
    tokenResponse,
  ]);

  return (
    <SpotifyAuthContext.Provider value={value}>
      {children}
    </SpotifyAuthContext.Provider>
  );
}
