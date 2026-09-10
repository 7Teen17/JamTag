import { Plus, X } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./default/themed-text";

type TagProps = {
  value: string;
  type?: "regular" | "large" | "explicit";
  removeable?: boolean;
  addable?: boolean;
  onPress?: () => void;
};

export default function Tag({
  value,
  type,
  removeable,
  addable,
  onPress,
}: TagProps) {
  const isLarge = type ? type === "large" : false;
  const isExplicit = type === "explicit";
  return (
    <Pressable
      style={[
        styles.container,
        isExplicit && styles.explicitContainer,
        addable && styles.addableContainer,
      ]}
      onPress={onPress}
    >
      <ThemedText
        type="tag"
        style={isLarge ? styles.largeText : isExplicit ? styles.explicitText : styles.text}
      >
        {value}
      </ThemedText>
      {removeable && (
        <View style={{ paddingHorizontal: 5 }}>
          <X color="white" size={14} strokeWidth={3} />
        </View>
      )}
      {addable && (
        <View style={{ paddingHorizontal: 5 }}>
          <Plus color="white" size={14} strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignContent: "center",
    maxWidth: "100%",
  },
  addableContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.5)",
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
