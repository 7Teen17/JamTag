import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import type { PlaybackState } from "../services/music/types";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

const SONG_END_REFRESH_BUFFER_MS = 3000;
const FALLBACK_PLAYBACK_REFRESH_MS = 20000;

function getNextPlaybackRefreshDelay(playback: PlaybackState | null) {
  if (!playback?.isPlaying) {
    return FALLBACK_PLAYBACK_REFRESH_MS;
  }

  const { durationMs } = playback.track;
  const { progressMs } = playback;

  if (durationMs === undefined || progressMs === undefined) {
    return FALLBACK_PLAYBACK_REFRESH_MS;
  }

  const remainingMs = durationMs - progressMs;

  return Math.max(
    SONG_END_REFRESH_BUFFER_MS,
    remainingMs + SONG_END_REFRESH_BUFFER_MS,
  );
}

export default function NowPlayingCard() {
  const { isAuthenticated, musicService } = useSpotifyAuth();
  const [playback, setPlayback] = useState<PlaybackState | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setPlayback(null);
      return;
    }

    const service = musicService;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let isActive = true;

    async function loadPlayback() {
      let playback: PlaybackState | null = null;

      try {
        playback = await service.getCurrentPlayback();
      } catch (error) {
        console.warn("Failed to load current playback.", error);
      }

      if (!isActive) {
        return;
      }

      setPlayback(playback);

      timeoutId = setTimeout(
        loadPlayback,
        getNextPlaybackRefreshDelay(playback),
      );
    }

    loadPlayback();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, musicService]);

  return (
    <View style={styles.card}>
      <ThemedText type="smallText" style={styles.nowPlayingText}>
        Now Playing
      </ThemedText>
      <View style={styles.content}>
        <View style={styles.songInfo}>
          <ThemedText type="title" numberOfLines={1} ellipsizeMode="tail">
            {playback ? playback.track.title : "None"}
          </ThemedText>
          <ThemedText type="default" numberOfLines={1} ellipsizeMode="tail">
            {playback ? playback.track.artists[0] : "None"}
          </ThemedText>
          <View style={styles.tagRow}>
            <Tag></Tag>
            <Tag></Tag>
          </View>
          <TouchableHighlight style={styles.tagButton}>
            <View style={styles.tagButtonContent}>
              <Text style={styles.tagButtonText}>Tag This Song</Text>
            </View>
          </TouchableHighlight>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={
              playback?.track.artworkUrl
                ? { uri: playback.track.artworkUrl }
                : require("@/assets/images/testimage.png")
            }
            style={styles.albumImage}
          ></Image>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: "#1F1F1F",
    width: "100%",
    height: 150,
    borderColor: "#302F2F",
    borderWidth: 1,
    padding: 10,
  },
  nowPlayingText: {
    position: "absolute",
    paddingLeft: 10,
    paddingTop: 10,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%",
  },
  songInfo: {
    width: "60%",
    height: "100%",
    alignItems: "flex-end",
    paddingTop: 15,
  },
  tagRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
    gap: 5,
  },
  tagButton: {
    flex: 1,
    backgroundColor: "#3FA46B",
    alignSelf: "stretch",
    borderRadius: 15,
    marginTop: 10,
  },
  tagButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tagButtonText: {
    color: "white",
    fontFamily: "UrbanistBold",
  },
  imageContainer: {
    /// backgroundColor: "#00FF00",
    width: "40%",
    height: "100%",
    alignItems: "flex-end",
  },
  albumImage: {
    height: "100%",
    width: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
});
