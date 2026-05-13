import { useRouter } from "expo-router";
import { Button } from "react-native";

export default function SearchScreen() {
  const router = useRouter();
  return (
    <>
      <Button
        onPress={() => {
          router.push("/login");
        }}
        title="Go to Login"
      ></Button>
    </>
  );
}
