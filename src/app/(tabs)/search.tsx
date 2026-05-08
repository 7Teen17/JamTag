import { ThemedText } from "@/src/components/default/themed-text";
import NowPlayingCard from "@/src/components/nowPlayingCard";
import RecentlyTaggedItem from "@/src/components/recently-tagged-item";
import { ScrollView, StyleSheet, View } from "react-native";

export default function SearchScreen() {
  return (
    <>
      <ThemedText style={styles.sectionTitle}>Recently Tagged</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recentItemsScroller}
        contentContainerStyle={styles.recentItems}
      >
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
      </ScrollView>
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
    paddingLeft: 5,
    paddingRight: 10,
  },
  recentItemsScroller: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
  },
  nowPlayingContainer: {
    padding: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 10,
    elevation: 10,
  },
});
