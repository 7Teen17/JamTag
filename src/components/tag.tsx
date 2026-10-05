import { Plus, X } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { getContrastingTextColor } from "../utils/color";
import { ThemedText } from "./default/themed-text";

type TagProps = {
  value: string;
  color?: string;
  type?: "regular" | "large" | "explicit";
  removeable?: boolean;
  addable?: boolean;
  onPress?: () => void;
};

export default function Tag({
  value,
  color = "#DC2626",
  type,
  removeable,
  addable,
  onPress,
}: TagProps) {
  const isLarge = type ? type === "large" : false;
  const isExplicit = type === "explicit";
  const background = isExplicit ? "#777777" : color;
  const foreground = isExplicit
    ? "#FFFFFF"
    : getContrastingTextColor(
        background,
        addable ? { opacity: 0.5, surfaceColor: "#202020" } : undefined,
      );
  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: color },
        isExplicit && styles.explicitContainer,
        addable && styles.addableContainer,
        addable && { backgroundColor: `${background}80`, borderColor: foreground },
      ]}
      onPress={onPress}
    >
      <ThemedText
        type="tag"
        style={[
          isLarge ? styles.largeText : isExplicit ? styles.explicitText : styles.text,
          { color: foreground },
        ]}
      >
        {value}
      </ThemedText>
      {removeable && (
        <View style={{ paddingHorizontal: 5 }}>
          <X color={foreground} size={14} strokeWidth={3} />
        </View>
      )}
      {addable && (
        <View style={{ paddingHorizontal: 5 }}>
          <Plus color={foreground} size={14} strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignContent: "center",
    maxWidth: "100%",
  },
  addableContainer: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "white",
  },
  explicitContainer: {
    backgroundColor: "#777777",
    borderRadius: 3,
  },
  text: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  largeText: {
    flexShrink: 1,
    fontSize: 20,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  explicitText: {
    color: "white",
    fontSize: 10,
    fontFamily: "UrbanistBold",
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
