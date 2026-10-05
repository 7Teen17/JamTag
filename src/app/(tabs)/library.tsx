import LibraryTagSection from "@/src/components/LibraryTagSection";
import { useSongTags } from "@/src/hooks/useSongTags";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function LibraryScreen() {
  const tags = useSongTags();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setModalOpen(true)}
        style={{ width: 100, height: 100 }}
      />
      <ScrollView>
        {/*Initial Padding*/}
        <View style={{ height: 10 }}></View>
        {tags.map((tag) => (
          <LibraryTagSection tag={tag} key={tag.id}></LibraryTagSection>
        ))}
      </ScrollView>
      <Modal
        visible={modalOpen}
        animationType="fade"
        presentationStyle="overFullScreen"
        onRequestClose={() => setModalOpen(false)}
        transparent
      >
        <Pressable
          onPress={() => setModalOpen(!modalOpen)}
          style={styles.container}
        >
          <View style={styles.modal}></View>
        </Pressable>
      </Modal>
    </>
  );
}
{
  /* <Pressable style={styles.container} onPress={() => setModalOpen(false)}>
          
        </Pressable>*/
}
const styles = StyleSheet.create({
  text: {
    color: "white",
  },
  modal: {
    width: 300,
    height: 400,
    backgroundColor: "white",
    borderRadius: 25,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
});
