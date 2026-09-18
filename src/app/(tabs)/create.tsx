import { ThemedText } from "@/src/components/default/themed-text";
import HorizontalSongItem from "@/src/components/HorizontalSongItem";
import { useBottomSheet } from "@/src/components/bottomSheetProvider";
import { useTrack } from "@/src/hooks/useTrack";
import Tag from "@/src/components/tag";
import { ChevronRight, Search } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function CreateScreen() {
  const [tagSearch, setTagSearch] = useState("");
  const { openSheet } = useBottomSheet();
  const { track, loading } = useTrack("0nbXyq5TXYPCO7pr3N8S4I");
  return (
    <>
      <View style={styles.searchBar}>
        <Search color="white" style={styles.searchIcon} />
        <TextInput
          style={styles.searchText}
          value={tagSearch}
          onChangeText={(search) => {
            setTagSearch(search);
          }}
          placeholder="Search Tags"
          placeholderTextColor="#8D8D8D"
        />
      </View>
      {/* Selected Tags Section */}
      <ThemedText style={styles.sectionNameText} type="bigText">
        Selected Tags
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagScroll}
        contentContainerStyle={styles.tagScrollContent}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <Tag key={index} value="test" type="large" removeable />
        ))}
      </ScrollView>
      {/* Suggested Tags Section */}
      <ThemedText style={styles.sectionNameText} type="bigText">
        More Tags
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagScroll}
        contentContainerStyle={styles.tagScrollContent}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <Tag key={index} value="test" type="large" addable />
        ))}
      </ScrollView>
      {/* Spacer bar */}
      <View
        style={{
          height: 1,
          backgroundColor: "#333",
          marginVertical: 8,
        }}
      />
      <View style={styles.artistContainer}>
        <ThemedText type="bigText">Artists</ThemedText>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ThemedText>All Artists Selected</ThemedText>
          <ChevronRight color="white" />
        </View>
      </View>
      {/* Spacer bar */}
      <View
        style={{
          height: 1,
          backgroundColor: "#333",
          marginVertical: 8,
        }}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <ThemedText type="subtitle" style={styles.sectionNameText}>
          Your Jam
        </ThemedText>
        <ThemedText>17 Songs • 1 million hours</ThemedText>
      </View>
      <ScrollView>
        {track ? (
          Array.from({ length: 7 }, (_, index) => (
            <HorizontalSongItem key={index} track={track} onPress={openSheet} />
          ))
        ) : (
          <ThemedText>{loading ? "Loading..." : "Not found."}</ThemedText>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.createButton} activeOpacity={0.5}>
        <ThemedText
          style={{
            flex: 1,
            textAlign: "center",
            textAlignVertical: "center",
          }}
          type="subtitle"
        >
          Listen
        </ThemedText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: "#272727",
    width: "auto",
    height: 50,
    margin: 10,
    marginBottom: 20,
    padding: 3,
    borderRadius: 5,
    borderColor: "#535353",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 7,
  },
  searchText: {
    flex: 1,
    fontFamily: "UrbanistRegular",
    fontSize: 14,
    color: "#8D8D8D",
  },
  sectionNameText: {
    marginLeft: 10,
    marginVertical: 5,
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 8,
    margin: 10,
  },
  tagScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginVertical: 10,
  },
  tagScrollContent: {
    gap: 8,
    paddingHorizontal: 10,
    alignItems: "flex-start",
  },
  artistContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  createButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
  },
});
