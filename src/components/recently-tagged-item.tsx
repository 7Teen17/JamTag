import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import { MusicTrack } from "../services/music/types";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

type RecentlyTaggedItemProps = {
  id: string;
};

export default function RecentlyTaggedItem({ id }: RecentlyTaggedItemProps) {
  const [track, setTrack] = useState<MusicTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, musicService } = useSpotifyAuth();

  useEffect(() => {
    if (!isAuthenticated || !musicService) {
      setLoading(false);
      return;
    }
    const service = musicService;
    async function loadTrack() {
      setLoading(true);
      const returned_track: MusicTrack = await service.getTrack(id);
      setTrack(returned_track);
      setLoading(false);
    }
    loadTrack();
  }, [id, isAuthenticated, musicService]);

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/no_album_cover.png")}
          style={styles.image}
        ></Image>
      </View>
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>
          {loading ? "Loading..." : track ? track.title : "Not found."}
        </ThemedText>
        <ThemedText type="smallText">
          {loading ? "..." : track ? track.artists[0] : "Not found."}
        </ThemedText>
        <View style={styles.tagRow}>
          <Tag></Tag>
          <Tag></Tag>
          <ThemedText type="smallText">+17</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 125,
    padding: 5,
  },
  imageContainer: {
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
  },
  textContainer: {
    paddingLeft: 5,
  },
  title: {
    paddingTop: 5,
  },
  tagRow: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingTop: 3,
  },
});
