import { Image, View } from "react-native";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

export default function RecentlyTaggedItem() {
  return (
    <View style={{ width: 125, padding: 5 }}>
      <View style={{ borderRadius: 15, overflow: "hidden" }}>
        <Image
          source={require("@/assets/images/testimage.png")}
          style={{ width: "100%", height: undefined, aspectRatio: 1 }}
        ></Image>
      </View>
      <View style={{ paddingLeft: 5 }}>
        <ThemedText style={{ paddingTop: 5 }}>Blinding Lights</ThemedText>
        <ThemedText type="smallText">The Weeknd</ThemedText>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 4,
            alignItems: "center",
            paddingTop: 3,
          }}
        >
          <Tag></Tag>
          <Tag></Tag>
          <ThemedText type="smallText">+17</ThemedText>
        </View>
      </View>
    </View>
  );
}
