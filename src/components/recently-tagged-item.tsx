import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import { DefaultTrack, MusicTrack } from "../services/music/types";
import { useBottomSheet } from "./bottomSheetProvider";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

type RecentlyTaggedItemProps = {
  id: string;
};

export default function RecentlyTaggedItem({ id }: RecentlyTaggedItemProps) {
  const [track, setTrack] = useState<MusicTrack>(DefaultTrack);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, musicService } = useSpotifyAuth();
  const { openSheet } = useBottomSheet();

  useEffect(() => {
    if (!isAuthenticated || !musicService) {
      setLoading(false);
      return;
    }
    const service = musicService;
    async function loadTrack() {
      setLoading(true);
      const returned_track: MusicTrack | null = await service.getTrack(id);
      setTrack(returned_track || DefaultTrack);
      setLoading(false);
    }
    loadTrack();
  }, [id, isAuthenticated, musicService]);

  return (
    <TouchableOpacity
      onPress={(event) => {
        if (track) {
          openSheet(track);
        }
      }}
      activeOpacity={0.5}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={
              track?.artworkUrl
                ? { uri: track.artworkUrl }
                : require("@/assets/images/no_album_cover.png")
            }
            style={styles.image}
          ></Image>
        </View>
        <View style={styles.textContainer}>
          <ThemedText
            style={styles.title}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {loading ? "Loading..." : track ? track.title : "Not found."}
          </ThemedText>
          <ThemedText type="smallText" numberOfLines={1} ellipsizeMode="tail">
            {loading ? "..." : track ? track.artist : "Not found."}
          </ThemedText>
          <View style={styles.tagRow}>
            <Tag value="Cool"></Tag>
            <Tag value="Cool"></Tag>
            <ThemedText type="smallText">+17</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
