import Divider from "./Divider";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSongsByTag } from "../hooks/useSongsByTag";
import { SongTag } from "../services/music/types";
import { ThemedText } from "./default/themed-text";
import RecentlyTaggedItem from "./recently-tagged-item";
import Tag from "./tag";

export default function LibraryTagSection({
  tag,
  tagOnPress,
}: {
  tag: SongTag;
  tagOnPress: () => void;
}) {
  const songs = useSongsByTag(tag.id);

  return (
    <>
      <View style={styles.headerContainer}>
        <ThemedText type="title">Tagged </ThemedText>
        <Tag
          value={tag.name}
          color={tag.color}
          onPress={tagOnPress}
          type="large"
          editable
        />
      </View>
      {songs.length === 0 ? (
        <View
          style={{
            minHeight: 125,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ color: "#727272" }}>
            No songs with this tag
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recentItemsScroller}
          contentContainerStyle={styles.recentItems}
        >
          {songs.map((song) => {
            return (
              <RecentlyTaggedItem
                key={song.providerTrackId}
                id={song.providerTrackId}
              ></RecentlyTaggedItem>
            );
          })}
        </ScrollView>
      )}
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 3,
  },
  recentItems: {
    display: "flex",
    flexDirection: "row",
    paddingLeft: 5,
    paddingRight: 10,
  },
  recentItemsScroller: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
  },
});
