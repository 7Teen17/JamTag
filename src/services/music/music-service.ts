import type {
  MusicAuthSession,
  MusicProviderId,
  MusicTrack,
  PlaybackState,
} from "./types";

export abstract class MusicService {
  abstract readonly id: MusicProviderId;
  abstract readonly displayName: string;

  protected authSession: MusicAuthSession | null = null;

  constructor(authSession?: MusicAuthSession | null) {
    this.authSession = authSession ?? null;
  }

  setAuthSession(authSession: MusicAuthSession | null) {
    this.authSession = authSession;
  }

  abstract connect(): Promise<MusicAuthSession>;
  abstract disconnect(): Promise<void>;
  abstract getCurrentPlayback(): Promise<PlaybackState | null>;
  abstract searchTracks(query: string): Promise<MusicTrack[]>;
  abstract getTrack(id: string): Promise<MusicTrack>;
}
