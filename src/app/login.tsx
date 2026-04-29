import { View } from "react-native";
import { ThemedText } from "../components/default/themed-text";

export default function LoginScreen() {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <ThemedText
        type="title"
        style={{ position: "absolute", top: 150, fontSize: 50 }}
      >
        TagLab
      </ThemedText>
      <View
        style={{
          width: "75%",
          height: 300,
          //backgroundColor: "red",
          alignItems: "center",
        }}
      >
        <ThemedText
          style={{
            fontFamily: "UrbanistRegular",
            fontSize: 16,
          }}
        >
          Connect a music service to start tagging
        </ThemedText>
      </View>
    </View>
  );
}
