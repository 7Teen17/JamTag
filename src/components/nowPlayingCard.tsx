import { Image, Text, TouchableHighlight, View } from "react-native";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

export default function NowPlayingCard() {
  return (
    <View
      style={{
        borderRadius: 15,
        backgroundColor: "#1F1F1F",
        width: "100%",
        height: 150,
        borderColor: "#302F2F",
        borderWidth: 1,
        padding: 10,
      }}
    >
      <ThemedText
        type="smallText"
        style={{ position: "absolute", paddingLeft: 10, paddingTop: 10 }}
      >
        Now Playing
      </ThemedText>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={{
            width: "60%",
            height: "100%",
            alignItems: "flex-end",
            paddingTop: 15,
          }}
        >
          <ThemedText type="title">All Too Well Ten Minute</ThemedText>
          <ThemedText type="default">Taylor Swift</ThemedText>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 5,
              gap: 5,
            }}
          >
            <Tag></Tag>
            <Tag></Tag>
          </View>
          <TouchableHighlight
            style={{
              flex: 1,
              backgroundColor: "#3FA46B",
              alignSelf: "stretch",
              borderRadius: 15,
              marginTop: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontFamily: "UrbanistBold" }}>
                Tag This Song
              </Text>
            </View>
          </TouchableHighlight>
        </View>
        <View
          style={{
            //backgroundColor: "#00FF00",
            width: "40%",
            height: "100%",
            alignItems: "flex-end",
          }}
        >
          <Image
            source={require("@/assets/images/testimage.png")}
            style={{
              height: "100%",
              width: undefined,
              aspectRatio: 1,
              borderRadius: 10,
              overflow: "hidden",
            }}
          ></Image>
        </View>
      </View>
    </View>
  );
}
