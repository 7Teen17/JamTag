import { ThemedText } from "@/src/components/default/themed-text";
import NowPlayingCard from "@/src/components/nowPlayingCard";
import RecentlyTaggedItem from "@/src/components/recently-tagged-item";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SearchScreen() {
  return (
    <>
      <ThemedText style={styles.sectionTitle}>
        Recently Tagged
      </ThemedText>
      <View style={styles.recentItems}>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
      </View>
      <View style={styles.nowPlayingContainer}>
        <NowPlayingCard></NowPlayingCard>
      </View>
      <ThemedText style={styles.sectionTitle}>
        Recently Tagged
      </ThemedText>
      <View style={styles.recentItems}>
        <Link href="/login">
          <RecentlyTaggedItem></RecentlyTaggedItem>
        </Link>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
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
  },
  nowPlayingContainer: {
    padding: 10,
    position: "absolute",
    bottom: 0,
  },
});
