import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import { MusicTrack } from "../services/music/types";
import { useBottomSheet } from "./bottomSheetProvider";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

type SearchedItemProps = {
  id: string;
  track?: MusicTrack;
};

export default function SearchedItem({ id, track: searchTrack }: SearchedItemProps) {
  const [loadedTrack, setTrack] = useState<MusicTrack | null>(null);
  const [loading, setLoading] = useState(!searchTrack);
  const { isAuthenticated, musicService } = useSpotifyAuth();
  const { openSheet } = useBottomSheet();

  const track = searchTrack ?? loadedTrack;

  useEffect(() => {
    if (searchTrack) return;
    async function loadTrack() {
      if (!isAuthenticated || !musicService) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const returned_track: MusicTrack | null = await musicService.getTrack(id);
      setTrack(returned_track);
      setLoading(false);
    }
    loadTrack();
  }, [id, isAuthenticated, musicService, searchTrack]);

  return (
    <TouchableOpacity
      onPress={(event) => {
        if (track) {
          openSheet(track);
        }
      }}
      style={styles.container}
    >
      <Image
        source={
          track?.artworkUrl
            ? { uri: track.artworkUrl }
            : require("@/assets/images/no_album_cover.png")
        }
        style={styles.image}
      ></Image>
      <View style={styles.infoView}>
        <ThemedText
          type="title"
          style={styles.titleText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {!searchTrack && loading ? "Loading..." : track ? track.title : "Not found."}
        </ThemedText>
        <ThemedText
          type="smallText"
          style={styles.artistText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {!searchTrack && loading ? "..." : track ? track.artist : "Not found."}
        </ThemedText>
        <Tag value="Cool"></Tag>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "auto",
    height: 60,
    margin: 7,
    display: "flex",
    flexDirection: "row",
  },
  image: {
    height: "100%",
    width: undefined,
    aspectRatio: 1,
    borderRadius: 5,
    marginRight: 5,
  },
  titleText: {
    fontSize: 16,
    marginTop: 3,
  },
  artistText: {
    marginBottom: 3,
  },
  infoView: {
    flex: 1,
  },
  tagButton: {
    width: 80,
    height: "auto",
    backgroundColor: "#D9D9D9",
    borderRadius: 5,
    margin: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tagButtonText: {
    color: "black",
    fontSize: 16,
  },
});
