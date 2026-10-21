import { ThemedText } from "@/src/components/default/themed-text";
import Divider from "@/src/components/Divider";
import LibraryTagSection from "@/src/components/LibraryTagSection";
import { createTag, deleteTag, tagColors, updateTag } from "@/src/db/db";
import { useSongTags } from "@/src/hooks/useSongTags";
import { SongTag } from "@/src/services/music/types";
import { Plus } from "lucide-react-native";
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
  const isNewTag = currentTag?.id === -1;

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
      if (currentTag.id === -1) {
        createTag(currentName, currentColor.current);
      } else {
        updateTag({
          id: currentTag.id,
          name: currentName,
          color: currentColor.current,
        });
      }
      closeModal();
    } catch (error) {
      Alert.alert(
        "Couldn't update tag",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  }, [currentTag, currentName, closeModal]);

  const confirmDeleteTag = useCallback(() => {
    if (!currentTag || currentTag.id === -1) return;

    Alert.alert(
      `Delete “${currentTag.name}”?`,
      "This removes the tag from all songs. Your songs will stay in your library. This can’t be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              deleteTag(currentTag.id);
              closeModal();
            } catch (error) {
              Alert.alert(
                "Couldn't delete tag",
                error instanceof Error ? error.message : "Please try again.",
              );
            }
          },
        },
      ],
    );
  }, [currentTag, closeModal]);

  return (
    <>
      <ThemedText type="title" style={{ fontSize: 40, paddingLeft: 10 }}>
        • Library
      </ThemedText>
      <Divider />
      <View>
        <TouchableOpacity
          style={styles.createTagButton}
          onPress={() => openModal({ id: -1, name: "", color: "#3FA46B" })}
        >
          <ThemedText type="subtitle">Create Tag</ThemedText>
          <Plus color="white" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {tags.map((tag) => (
          <LibraryTagSection
            tag={tag}
            key={tag.id}
            tagOnPress={() => openModal(tag)}
          ></LibraryTagSection>
        ))}
        <View style={styles.addMoreContainer}>
          <ThemedText type="smallText">
            Newly created tags will show up here
          </ThemedText>
        </View>
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
            {currentTag && !isNewTag && (
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.5}
                onPress={confirmDeleteTag}
                accessibilityRole="button"
              >
                <ThemedText
                  style={{
                    textAlign: "center",
                  }}
                  type="subtitle"
                >
                  Delete Tag
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.5}
              onPress={applySettings}
            >
              <ThemedText
                style={{
                  textAlign: "center",
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
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    gap: 12,
  },
  colorPicker: {
    gap: 10,
  },
  tagInput: {
    backgroundColor: "#e5e3e3",
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "UrbanistRegular",
    fontSize: 20,
    borderRadius: 5,
  },
  applyButton: {
    minHeight: 44,
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
  },
  deleteButton: {
    minHeight: 44,
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#a4463f",
  },
  addMoreContainer: {
    flex: 1,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  createTagButton: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#3FA46B",
    borderRadius: 10,
    padding: 8,
    alignSelf: "flex-end",
    marginRight: 5,
  },
});
