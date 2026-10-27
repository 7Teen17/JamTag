import Storage from "expo-sqlite/kv-store";
import { useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView as NativeScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const HIDE_FILTER_HELP_KEY = "hide_tag_filter_help";

export default function TagFilterHelpModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const savingLock = useRef(false);

  async function dontShowAgain() {
    if (savingLock.current) return;
    savingLock.current = true;
    setIsSaving(true);
    try {
      await Storage.setItem(HIDE_FILTER_HELP_KEY, "true");
      onClose();
    } catch {
      Alert.alert("Couldn't save preference", "Please try again.");
    } finally {
      savingLock.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.helpOverlay}>
        <View
          style={styles.helpCard}
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
        >
          <NativeScrollView
            style={styles.helpScroll}
            contentContainerStyle={styles.helpContent}
          >
            <Text style={styles.helpTitle} accessibilityRole="header">
              Build your mix
            </Text>
            {[
              [
                "Include",
                "Your Jam will include songs from all of these tags.",
              ],
              [
                "Required",
                "All songs in your Jam must have all of these tags.",
              ],
              ["Exclude", "No songs in your Jam will have any of these tags."],
            ].map(([label, description]) => (
              <View key={label}>
                <Text style={styles.helpLabel}>{label}</Text>
                <Text style={styles.helpDescription}>{description}</Text>
              </View>
            ))}
            <Text style={styles.helpDescription}>
              Combine these sections to narrow down your mix. Leave a section
              empty to skip that filter.
            </Text>
          </NativeScrollView>
          <View style={styles.helpActions}>
            <TouchableOpacity
              style={styles.helpOkButton}
              accessibilityRole="button"
              disabled={isSaving}
              accessibilityState={{ disabled: isSaving }}
              onPress={onClose}
            >
              <Text style={styles.helpOkText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helpSecondaryButton}
              accessibilityRole="button"
              disabled={isSaving}
              accessibilityState={{ disabled: isSaving, busy: isSaving }}
              onPress={dontShowAgain}
            >
              <Text style={styles.helpLabel}>
                {isSaving ? "Saving…" : "Don't show again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  helpOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  helpCard: {
    backgroundColor: "#202020",
    width: "100%",
    maxWidth: 340,
    maxHeight: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  helpContent: {
    padding: 24,
    gap: 16,
  },
  helpScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  helpTitle: {
    color: "#ECEDEE",
    fontFamily: "UrbanistBold",
    fontSize: 24,
  },
  helpLabel: {
    color: "#ECEDEE",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  helpDescription: {
    color: "#ECEDEE",
    fontSize: 16,
    lineHeight: 24,
  },
  helpActions: {
    padding: 16,
    gap: 8,
  },
  helpOkButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
  },
  helpSecondaryButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  helpOkText: {
    color: "#11181C",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
});
