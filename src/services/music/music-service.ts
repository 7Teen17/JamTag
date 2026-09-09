import type {
  MusicAuthSession,
  MusicProviderId,
  MusicTrack,
  MusicTrackPage,
  PlaybackState,
} from "./types";

export abstract class MusicService {
  abstract readonly id: MusicProviderId;
  abstract readonly displayName: string;

  protected authSession: MusicAuthSession;

  constructor(authSession: MusicAuthSession) {
    this.authSession = authSession;
  }

  setAuthSession(authSession: MusicAuthSession) {
    this.authSession = authSession;
  }

  connected(): boolean {
    return Boolean(this.authSession.accessToken);
  }

  abstract getCurrentPlayback(): Promise<PlaybackState | null>;
  abstract searchTracks(query: string, offset?: number): Promise<MusicTrackPage>;
  abstract getTrack(id: string): Promise<MusicTrack | null>;
}
