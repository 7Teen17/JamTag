import { ThemedText } from "@/src/components/default/themed-text";
import SearchedItem from "@/src/components/searchedItem";
import { Search } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export default function SearchScreen() {
  const test_songs = [
    "0nbXyq5TXYPCO7pr3N8S4I",
    "4XcZp2xqbiD8YsnPboNUDo",
    "6CUP2khYzdphXebxVTfPE3",
    "7EW7Yivb93qKAtp5qEm5of",
    "45J4avUb9Ni0bnETYaYFVJ",
  ];

  return (
    <>
      <View style={styles.searchBar}>
        <Search style={styles.searchIcon}></Search>
        <ThemedText style={styles.searchText}>
          Search Songs, Artists, Albums
        </ThemedText>
      </View>
      {test_songs.map((song) => (
        <SearchedItem id={song} key={song}></SearchedItem>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: "#272727",
    width: "auto",
    height: 50,
    margin: 10,
    padding: 3,
    borderRadius: 5,
    borderColor: "#535353",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  searchIcon: {
    color: "white",
    marginLeft: 5,
    marginRight: 7,
  },
  searchText: {
    fontFamily: "UrbanistRegular",
    fontSize: 14,
    color: "#8D8D8D",
  },
});
