import { ThemedText } from "@/src/components/default/themed-text";
import LibraryTagSection from "@/src/components/LibraryTagSection";
import { tagColors } from "@/src/db/db";
import { useSongTags } from "@/src/hooks/useSongTags";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import ColorPicker, {
  ColorFormatsObject,
  HueSlider,
  OpacitySlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";

export default function LibraryScreen() {
  const tags = useSongTags();
  const [modalOpen, setModalOpen] = useState(false);
  const onSelectColor = ({ hex }: ColorFormatsObject) => {
    "worklet";
    console.log(hex);
  };

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
          <View style={styles.modal}>
            <ColorPicker
              value="green"
              onComplete={onSelectColor}
              style={styles.colorPicker}
            >
              <Preview hideInitialColor />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches colors={tagColors} />
            </ColorPicker>
            <TextInput style={styles.tagInput}>Testing</TextInput>
            <TouchableOpacity style={styles.applyButton} activeOpacity={0.5}>
              <ThemedText
                style={{
                  flex: 1,
                  textAlign: "center",
                  textAlignVertical: "center",
                }}
                type="subtitle"
              >
                Apply
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  text: {
    color: "white",
  },
  modal: {
    width: 300,
    height: 500,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  colorPicker: {
    gap: 10,
  },
  tagInput: {
    backgroundColor: "#e5e3e3",
    height: "10%",
    fontFamily: "UrbanistRegular",
    fontSize: 20,
    borderRadius: 5,
  },
  applyButton: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
  },
});
