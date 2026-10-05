import { ScrollView, StyleSheet, View } from "react-native";
import { useSongsByTag } from "../hooks/useSongsByTag";
import { SongTag } from "../services/music/types";
import { ThemedText } from "./default/themed-text";
import RecentlyTaggedItem from "./recently-tagged-item";
import Tag from "./tag";

export default function LibraryTagSection({ tag }: { tag: SongTag }) {
  const songs = useSongsByTag(tag.id);

  return (
    <>
      <View style={styles.headerContainer}>
        <ThemedText type="title">Tagged </ThemedText>
        <Tag value={tag.name} color={tag.color} type="large" editable />
      </View>
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
      <View
        style={{
          height: 1,
          backgroundColor: "#333",
          marginVertical: 8,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
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
