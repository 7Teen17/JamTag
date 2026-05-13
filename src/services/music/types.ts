export type MusicProviderId = "spotify" | "appleMusic";

export type MusicTrack = {
  provider: MusicProviderId;
  providerTrackId: string;
  title: string;
  artists: string[];
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  isrc?: string;
};

export type PlaybackState = {
  track: MusicTrack;
  isPlaying: boolean;
  progressMs?: number;
};

export type MusicAuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  issuedAt?: number;
};
