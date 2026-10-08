import { ThemedText } from "@/src/components/default/themed-text";
import LibraryTagSection from "@/src/components/LibraryTagSection";
import { tagColors } from "@/src/db/db";
import { useSongTags } from "@/src/hooks/useSongTags";
import { SongTag } from "@/src/services/music/types";
import { useCallback, useRef, useState } from "react";
import {
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
  ColorPickerRef,
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
  const pickerRef = useRef<ColorPickerRef>(null);

  const onSelectColor = ({ hex }: ColorFormatsObject) => {
    "worklet";
    console.log(hex);
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
      modalAnimationValue.set(0);
      setModalOpen(true);
      if (pickerRef.current) {
        pickerRef.current.setColor(tag.color);
      }
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

  return (
    <>
      <ScrollView>
        <View style={{ height: 15 }} />
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
              onComplete={onSelectColor}
              style={styles.colorPicker}
            >
              <Preview hideInitialColor />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Swatches colors={tagColors} />
            </ColorPicker>
            <TextInput style={styles.tagInput}>
              {currentTag ? currentTag.name : ""}
            </TextInput>
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
