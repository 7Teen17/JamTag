import { ThemedText } from "@/src/components/default/themed-text";
import NowPlayingCard from "@/src/components/nowPlayingCard";
import RecentlyTaggedItem from "@/src/components/recently-tagged-item";
import { useRecentlyTagged } from "@/src/hooks/useRecentlyTagged";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const recentlyTaggedSongs = useRecentlyTagged();

  return (
    <>
      <ThemedText style={styles.sectionTitle}>Recently Tagged</ThemedText>
      {recentlyTaggedSongs.length === 0 ? (
        <View style={{ minHeight: 75, justifyContent: "center" }}>
          <ThemedText style={styles.noSongText}>No Songs Tagged</ThemedText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.recentItemsScroller}
          contentContainerStyle={styles.recentItems}
        >
          {recentlyTaggedSongs.map((song) => {
            return (
              <RecentlyTaggedItem key={song} id={song}></RecentlyTaggedItem>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.nowPlayingContainer}>
        <NowPlayingCard></NowPlayingCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 25,
    fontFamily: "UrbanistBold",
    padding: 10,
    paddingTop: 20,
  },
  recentItems: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 5,
    paddingRight: 10,
    flexGrow: 1,
  },
  recentItemsScroller: {
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 50,
  },
  nowPlayingContainer: {
    padding: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 10,
    elevation: 10,
  },
  noSongText: {
    textAlign: "center",
    marginLeft: 5,
    color: "#727272",
  },
});
