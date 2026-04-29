import { ThemedText } from "@/src/components/default/themed-text";
import NowPlayingCard from "@/src/components/nowPlayingCard";
import RecentlyTaggedItem from "@/src/components/recently-tagged-item";
import { Link } from "expo-router";
import { View } from "react-native";

export default function SearchScreen() {
  return (
    <>
      <ThemedText
        style={{
          fontSize: 25,
          fontFamily: "UrbanistBold",
          padding: 10,
          paddingTop: 20,
        }}
      >
        Recently Tagged
      </ThemedText>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 5,
        }}
      >
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
        <RecentlyTaggedItem></RecentlyTaggedItem>
      </View>
      <View style={{ padding: 10, position: "absolute", bottom: 0 }}>
        <NowPlayingCard></NowPlayingCard>
      </View>
      <ThemedText
        style={{
          fontSize: 25,
          fontFamily: "UrbanistBold",
          padding: 10,
          paddingTop: 20,
        }}
      >
        Recently Tagged
      </ThemedText>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingLeft: 5,
        }}
      >
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
