export type MusicProviderId = "spotify" | "appleMusic";

export type MusicTrack = {
  provider: MusicProviderId;
  providerTrackId: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  isrc?: string;
};

export const DefaultTrack: MusicTrack = {
  provider: "spotify",
  providerTrackId: "",
  title: "None",
  artist: "None",
  artworkUrl: require("@/assets/images/no_album_cover.png"),
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
