import { Plus, X } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./default/themed-text";

type TagProps = {
  value: string;
  type?: "regular" | "large";
  removeable?: boolean;
  addable?: boolean;
};

export default function Tag({ value, type, removeable, addable }: TagProps) {
  const isLarge = type ? type === "large" : false;
  return (
    <View style={[styles.container, addable && styles.addableContainer]}>
      <ThemedText type="tag" style={isLarge ? styles.largeText : styles.text}>
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
    </View>
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
});
