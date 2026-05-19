import { ThemedText } from "@/src/components/default/themed-text";
import NowPlayingCard from "@/src/components/nowPlayingCard";
import RecentlyTaggedItem from "@/src/components/recently-tagged-item";
import { useRouter } from "expo-router";
import { Button, ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const test_songs = [
    "0nbXyq5TXYPCO7pr3N8S4I",
    "4XcZp2xqbiD8YsnPboNUDo",
    "6CUP2khYzdphXebxVTfPE3",
    "7EW7Yivb93qKAtp5qEm5of",
    "45J4avUb9Ni0bnETYaYFVJ",
  ];

  return (
    <>
      <ThemedText style={styles.sectionTitle}>Recently Tagged</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recentItemsScroller}
        contentContainerStyle={styles.recentItems}
      >
        {test_songs.map((song) => {
          return <RecentlyTaggedItem key={song} id={song}></RecentlyTaggedItem>;
        })}
      </ScrollView>
      <Button
        onPress={() => {
          router.push("/login");
        }}
        title="Go to Login"
      ></Button>
      <Button
        onPress={() => {
          router.push("/editTags");
        }}
        title="Go to Modal"
      ></Button>
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
