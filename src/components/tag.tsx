import { View } from "react-native";
import { ThemedText } from "./default/themed-text";

export default function Tag() {
  return (
    <View
      style={{
        backgroundColor: "red",
        borderRadius: 5,
        alignItems: "center",
        alignSelf: "flex-start",
      }}
    >
      <ThemedText
        type="tag"
        style={{ paddingHorizontal: 5, paddingVertical: 2 }}
      >
        Cool
      </ThemedText>
    </View>
  );
}
