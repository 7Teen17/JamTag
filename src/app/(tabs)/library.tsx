import { ThemedText } from "@/src/components/default/themed-text";
import Divider from "@/src/components/Divider";
import LibraryTagSection from "@/src/components/LibraryTagSection";
import { tagColors, updateTag } from "@/src/db/db";
import { useSongTags } from "@/src/hooks/useSongTags";
import { SongTag } from "@/src/services/music/types";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import ColorPicker, {
  ColorFormatsObject,
  HueSlider,
  OpacitySlider,
  Panel1,
  Preview,
  Swatches,
} from "reanimated-color-picker";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const modalTiming = { duration: 250, easing: Easing.out(Easing.quad) };

export default function LibraryScreen() {
  const tags = useSongTags();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<SongTag | null>(null);
  const [currentName, setCurrentName] = useState("");
  const currentColor = useRef("");

  const onSelectColor = ({ hex }: ColorFormatsObject) => {
    currentColor.current = hex;
  };

  const { height } = useReanimatedKeyboardAnimation();
  const { height: screenHeight } = useWindowDimensions();
  const modalAnimationValue = useSharedValue(0);
  const modalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          // Start below the screen and keep the keyboard offset during the slide.
          (1 - modalAnimationValue.value) * screenHeight + height.value / 2,
      },
    ],
  }));

  const openModal = useCallback(
    (tag: SongTag) => {
      setCurrentTag(tag);
      setCurrentName(tag.name);
      currentColor.current = tag.color;
      modalAnimationValue.set(0);
      setModalOpen(true);
    },
    [modalAnimationValue],
  );

  const finishClosingModal = useCallback(() => {
    setCurrentTag(null);
    setModalOpen(false);
  }, []);
  const closeModal = useCallback(() => {
    modalAnimationValue.set(
      withTiming(0, modalTiming, (finished) => {
        if (finished) scheduleOnRN(finishClosingModal);
      }),
    );
  }, [modalAnimationValue, finishClosingModal]);

  const applySettings = useCallback(() => {
    if (!currentTag) return;

    try {
      updateTag({
        id: currentTag.id,
        name: currentName,
        color: currentColor.current,
      });
      closeModal();
    } catch (error) {
      Alert.alert(
        "Couldn't update tag",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  }, [currentTag, currentName, closeModal]);

  return (
    <>
      <ThemedText type="title" style={{ fontSize: 40, paddingLeft: 10 }}>
        • Library
      </ThemedText>
      <Divider />
      <ScrollView>
        {tags.map((tag) => (
          <LibraryTagSection
            tag={tag}
            key={tag.id}
            tagOnPress={() => openModal(tag)}
          ></LibraryTagSection>
        ))}
      </ScrollView>

      <Modal
        visible={modalOpen}
        animationType="none"
        presentationStyle="overFullScreen"
        onRequestClose={closeModal}
        transparent
        onShow={() => {
          modalAnimationValue.set(withTiming(1, modalTiming));
        }}
      >
        <View style={styles.container}>
          <AnimatedPressable
            onPress={closeModal}
            style={[styles.backdrop, { opacity: modalAnimationValue }]}
          />
          <Animated.View style={[styles.modal, modalStyle]}>
            <ColorPicker
              value={currentTag ? currentTag.color : "green"}
              onChangeJS={onSelectColor}
              style={styles.colorPicker}
            >
              <Preview hideInitialColor />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches colors={tagColors} />
            </ColorPicker>
            <TextInput
              style={styles.tagInput}
              value={currentName}
              onChangeText={setCurrentName}
            />
            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.5}
              onPress={applySettings}
            >
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
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modal: {
    width: 300,
    height: 500,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
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
