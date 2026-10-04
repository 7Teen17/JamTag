export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly reason?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

export async function spotifyRequest(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<Response | null> {
  if (!accessToken) throw new Error("Spotify access token is missing.");

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    method: options.method ?? "GET",
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const reason =
      typeof body?.error?.reason === "string" ? body.error.reason : undefined;
    const detail =
      typeof body?.error?.message === "string" ? body.error.message : undefined;
    const retryHeader = response.headers.get("Retry-After");
    const retryValue = retryHeader?.trim() ? Number(retryHeader) : NaN;
    const retryAfterSeconds =
      Number.isFinite(retryValue) && retryValue >= 0 ? retryValue : undefined;

    let message: string;
    switch (response.status) {
      case 400:
        message = "Spotify rejected the request as invalid.";
        break;
      case 401:
        message = "Spotify access token is invalid or expired. Sign in again.";
        break;
      case 403:
        message =
          "Spotify denied access. Check the app's permissions and account access.";
        break;
      case 404:
        message = "Spotify could not find the requested resource.";
        break;
      case 429:
        message =
          reason === "QUOTA_EXCEEDED"
            ? "Spotify development API quota exceeded. Pause requests until quota is available."
            : "Spotify rate limit exceeded. Pause requests before retrying.";
        break;
      default:
        message =
          response.status >= 500
            ? "Spotify is temporarily unavailable. Try again later."
            : "Spotify API request failed.";
    }

    if (retryAfterSeconds !== undefined) {
      message += ` Retry after ${retryAfterSeconds} seconds.`;
    }
    if (detail) message += ` ${detail}`;
    throw new SpotifyApiError(
      `${message} (${response.status})`,
      response.status,
      reason,
      retryAfterSeconds,
    );
  }

  if (response.status === 204) return null;
  return response;
}
