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
    throw new Error("Spotify getCurrentPlayback is not implemented yet.");
  }

  async searchTracks(_query: string): Promise<MusicTrack[]> {
    throw new Error("Spotify searchTracks is not implemented yet.");
  }

  async getTrack(_id: string): Promise<MusicTrack> {
    throw new Error("Spotify getTrack is not implemented yet.");
  }

  protected getAuthorizationHeaders() {
    if (!this.authSession?.accessToken) {
      throw new Error("Spotify access token is missing.");
    }

    return {
      Authorization: `Bearer ${this.authSession.accessToken}`,
    };
  }
}
