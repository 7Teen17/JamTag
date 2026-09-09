import { router } from "expo-router";
import { Button } from "react-native";

export default function TabTwoScreen() {
  return (
    <Button
      onPress={() => {
        router.push("/login");
      }}
      title="Go to Login"
    ></Button>
  );
}
