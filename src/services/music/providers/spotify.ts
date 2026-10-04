import {
  getCachedSong,
  getManagedPlaylistId,
  saveManagedPlaylistId,
} from "@/src/db/db";
import type { DiscoveryDocument } from "expo-auth-session";
import { MusicService } from "../music-service";
import type { MusicTrack, MusicTrackPage, PlaybackState, ServiceProfile } from "../types";
import { DEFAULT_PROFILE } from "../types";
import { spotifyRequest } from "./spotify-api";

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

const JAMTAG_MARKER = "[JamTag:current-jam]";

type SpotifyPlaylist = {
  id: string;
  description: string | null;
  owner: { id: string };
};

export class SpotifyMusicService extends MusicService {
  readonly id = "spotify";
  readonly displayName = "Spotify";

  async getProfile(): Promise<ServiceProfile> {
    const response = await spotifyRequest(this.authSession.accessToken, "/me");
    if (!response) {
      throw new Error("Spotify profile lookup returned no content (204).");
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.url;

    return {
      username: data.display_name ?? DEFAULT_PROFILE.username,
      profilePictureSource: imageUrl
        ? { uri: imageUrl }
        : DEFAULT_PROFILE.profilePictureSource,
    };
  }

  async exportCurrentJam(tracks: MusicTrack[]): Promise<{ url: string }> {
    if (!tracks.length) throw new Error("Select songs before exporting a jam.");
    if (tracks.some((track) => track.provider !== this.id)) {
      throw new Error("Only Spotify tracks can be exported to Spotify.");
    }

    const uris = [
      ...new Set(tracks.map((track) => `spotify:track:${track.providerTrackId}`)),
    ];
    const profileResponse = await spotifyRequest(
      this.authSession.accessToken,
      "/me",
    );
    if (!profileResponse) {
      throw new Error("Spotify profile lookup failed (204).");
    }
    const { id: accountId } = await profileResponse.json();
    const savedId = getManagedPlaylistId();
    let playlistId: string | undefined;

    // Check the library so a removed playlist isn't silently reused.
    for (let offset = 0; ; offset += 50) {
      const response = await spotifyRequest(
        this.authSession.accessToken,
        `/me/playlists?limit=50&offset=${offset}`,
      );
      if (!response) {
        throw new Error("Spotify playlist lookup failed (204).");
      }
      const page: {
        items: (SpotifyPlaylist | null)[];
        next: string | null;
      } = await response.json();
      const owned = page.items.filter(
        (playlist) => playlist?.owner.id === accountId,
      );
      if (savedId && owned.some((playlist) => playlist?.id === savedId)) {
        playlistId = savedId;
        break;
      }
      playlistId ??= owned.find(
        (playlist) => playlist?.description?.includes(JAMTAG_MARKER),
      )?.id;
      if (!page.next) break;
    }

    if (!playlistId) {
      const response = await spotifyRequest(
        this.authSession.accessToken,
        "/me/playlists",
        {
          method: "POST",
          body: JSON.stringify({
            name: "JamTag — Current Jam",
            description: `Your latest JamTag mix. Replaced each time you tap Listen. ${JAMTAG_MARKER}`,
            public: false,
          }),
        },
      );
      if (!response) {
        throw new Error("Spotify playlist creation failed (204).");
      }
      const playlist: SpotifyPlaylist = await response.json();
      playlistId = playlist.id;
    }
    // Save before uploading so a failed upload can retry using the same playlist.
    saveManagedPlaylistId(playlistId);

    for (let offset = 0; offset < uris.length; offset += 100) {
      await spotifyRequest(
        this.authSession.accessToken,
        `/playlists/${playlistId}/items`,
        {
          method: offset === 0 ? "PUT" : "POST",
          body: JSON.stringify({ uris: uris.slice(offset, offset + 100) }),
        },
      );
    }
    return { url: `https://open.spotify.com/playlist/${playlistId}` };
  }

  async getCurrentPlayback(): Promise<PlaybackState | null> {
    const response = await spotifyRequest(
      this.authSession.accessToken,
      "/me/player/currently-playing",
    );

    if (!response) {
      return null;
    }

    const result = await response.json();

    if (result.currently_playing_type !== "track" || !result.item) {
      return null;
    }

    const track: MusicTrack = {
      provider: "spotify",
      providerTrackId: result.item.id,
      title: result.item.name,
      artist: result.item.artists.map((artist: any) => artist.name).join(", "),
      album: result.item.album.name,
      artworkUrl: result.item.album.images?.[0]?.url,
      durationMs: result.item.duration_ms,
      isrc: result.item.external_ids?.isrc,
      isExplicit: result.item.explicit,
    };

    return {
      track,
      isPlaying: result.is_playing,
      progressMs: result.progress_ms,
    };
  }

  async searchTracks(_query: string, offset = 0): Promise<MusicTrackPage> {
    const response = await spotifyRequest(
      this.authSession.accessToken,
      `/search?q=${encodeURIComponent(_query)}&type=track&limit=10&offset=${offset}`,
    );

    if (!response) {
      throw new Error("Spotify search failed (204).");
    }

    const result = await response.json();

    const seen = new Set<string>();

    const items: MusicTrack[] = result.tracks.items
      .map((i: any) => {
        const song: MusicTrack = {
          provider: "spotify",
          providerTrackId: i.id,
          title: i.name,
          artist: i.artists.map((artist: any) => artist.name).join(", "),
          album: i.album.name,
          artworkUrl: i.album.images?.[0]?.url,
          durationMs: i.duration_ms,
          isrc: i.external_ids?.isrc,
          isExplicit: i.explicit,
        };
        //songs with duplicate ISRCS get overwritten by the cached one, consolidating the tags into one track object
        return getCachedSong(song.providerTrackId, song.isrc) ?? song;
      })
      .filter((track: MusicTrack) => {
        const identity = track.isrc ?? track.providerTrackId;

        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
      });

    const nextOffset = result.tracks.offset + result.tracks.limit;
    return {
      items,
      nextOffset: result.tracks.next && nextOffset <= 1000 ? nextOffset : null,
    };
  }

  async getTrack(_id: string): Promise<MusicTrack | null> {
    //try cached song first
    const dbSong = getCachedSong(_id);
    if (dbSong != null) {
      return dbSong;
    }

    const response = await spotifyRequest(
      this.authSession.accessToken,
      "/tracks/" + _id,
    );

    if (!response) {
      return null;
    }

    const result = await response.json();

    const song: MusicTrack = {
      provider: "spotify",
      providerTrackId: result.id,
      title: result.name,
      artist: result.artists.map((artist: any) => artist.name).join(", "),
      album: result.album.name,
      artworkUrl: result.album.images?.[0]?.url,
      durationMs: result.duration_ms,
      isrc: result.external_ids?.isrc,
      isExplicit: result.explicit,
    };
    //After the current track wasnt cached, get from Spotify and then check if it has same ISRC as cached song
    return getCachedSong(_id, song.isrc) ?? song;
  }
}
