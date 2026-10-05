import { ImageSourcePropType } from "react-native";

export type MusicProviderId = "spotify" | "appleMusic";

export type SongTag = {
  id: number;
  name: string;
  color: string;
};

export type MusicTrack = {
  provider: MusicProviderId;
  providerTrackId: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  isrc?: string;
  isExplicit: boolean;
};

export type MusicTrackPage = {
  items: MusicTrack[];
  nextOffset: number | null;
};

export const DEFAULT_TRACK: MusicTrack = {
  provider: "spotify",
  providerTrackId: "",
  title: "None",
  artist: "None",
  artworkUrl: require("@/assets/images/no_album_cover.png"),
  isExplicit: false,
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

export type ServiceProfile = {
  username: string;
  profilePictureSource: ImageSourcePropType;
};

export const DEFAULT_PROFILE: ServiceProfile = {
  username: "None",
  profilePictureSource: require("@/assets/images/no_album_cover.png"),
};
