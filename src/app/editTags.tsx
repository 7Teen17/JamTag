import { StyleSheet } from "react-native";

import { ThemedView } from "@/src/components/default/themed-view";
import SearchedItem from "../components/searchedItem";

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <SearchedItem id="0nbXyq5TXYPCO7pr3N8S4I"></SearchedItem>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    padding: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
