import type { DiscoveryDocument } from "expo-auth-session";
import { MusicService } from "../music-service";
import type { MusicAuthSession, MusicTrack, PlaybackState } from "../types";

export const SPOTIFY_DISCOVERY: DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-currently-playing",
  "user-read-playback-state",
  "playlist-read-private",
  "playlist-modify-private",
];

export const SPOTIFY_TOKEN_KEY = "spotify_token_response";

export class SpotifyMusicService extends MusicService {
  readonly id = "spotify";
  readonly displayName = "Spotify";

  async connect(): Promise<MusicAuthSession> {
    if (!this.authSession) {
      throw new Error("Spotify auth has not been completed yet.");
    }

    return this.authSession;
  }

  async disconnect(): Promise<void> {
    this.authSession = null;
  }

  async getCurrentPlayback(): Promise<PlaybackState | null> {
    if (this.connected()) {
      let response = await fetch(
        "https://api.spotify.com/v1/me/player/currently-playing",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${this.authSession?.accessToken}` },
        },
      );

      if (!response.ok || response.status === 204) {
        return null;
      }
      const result = await response.json();

      if (result.currently_playing_type !== "track" || !result.item) {
        return null;
      }

      let track: MusicTrack = {
        provider: "spotify",
        providerTrackId: result.item.id,
        title: result.item.name,
        artists: result.item.artists.map((artist: any) => artist.name),
        album: result.item.album.name,
        artworkUrl: result.item.album.images?.[0]?.url,
        durationMs: result.item.duration_ms,
        isrc: result.item.external_ids?.isrc,
      };

      return {
        track: track,
        isPlaying: result.is_playing,
        progressMs: result.progress_ms,
      };
    }

    return null;
  }

  async searchTracks(_query: string): Promise<MusicTrack[]> {
    throw new Error("Spotify searchTracks is not implemented yet.");
  }

  async getTrack(_id: string): Promise<MusicTrack> {
    throw new Error("Spotify getTrack is not implemented yet.");
  }

  protected getAuthorizationHeaders() {
    if (!this.connected()) {
      throw new Error("Spotify access token is missing.");
    }

    return {
      Authorization: `Bearer ${this.authSession?.accessToken}`,
    };
  }
}
