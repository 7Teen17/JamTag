import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSpotifyAuth } from "../hooks/auth/useSpotifyAuth";
import { DefaultTrack, MusicTrack } from "../services/music/types";
import { useBottomSheet } from "./bottomSheetProvider";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";
import { getTagsFromSong } from "../db/db";
import { getVisibleTagCount } from "../utils/getVisibleTagCount";

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

  const [tagRowWidth, setTagRowWidth] = useState(0);
  const tags = loading ? [] : getTagsFromSong(track);
  const visibleTagCount = getVisibleTagCount(tags, tagRowWidth, 4);

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
          <View style={styles.artistRow}>
            <ThemedText
              type="smallText"
              style={styles.artistText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {loading ? "..." : track ? track.artist : "Not found."}
            </ThemedText>
            {track.isExplicit && <Tag type="explicit" value="E"></Tag>}
          </View>
          <View
            style={styles.tagRow}
            onLayout={(event) => setTagRowWidth(event.nativeEvent.layout.width)}
          >
            {tags.slice(0, visibleTagCount).map((tag) => (
              <Tag key={tag} value={tag} />
            ))}
            {tagRowWidth > 0 && visibleTagCount < tags.length && (
              <ThemedText type="smallText" numberOfLines={1} style={{ flexShrink: 0 }}>
                +{tags.length - visibleTagCount}
              </ThemedText>
            )}
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
  artistRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  artistText: {
    flexShrink: 1,
  },
  tagRow: {
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingTop: 3,
  },
});
