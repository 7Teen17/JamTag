import { ThemedText } from "@/src/components/default/themed-text";
import Divider from "@/src/components/Divider";
import { useSpotifyAuth } from "@/src/hooks/auth/useSpotifyAuth";
import type { ServiceProfile } from "@/src/services/music/types";
import { DEFAULT_PROFILE } from "@/src/services/music/types";
import { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { status, musicService } = useSpotifyAuth();
  const [profile, setProfile] = useState<ServiceProfile>(DEFAULT_PROFILE);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setProfile(DEFAULT_PROFILE);
    setImageFailed(false);

    async function loadProfile() {
      if (!musicService) return;

      try {
        const result = await musicService.getProfile();
        if (active) setProfile(result);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [musicService]);
  return (
    <>
      <ThemedText type="title" style={{ fontSize: 40, paddingLeft: 10 }}>
        • Profile
      </ThemedText>
      <Divider />
      <View style={styles.screen}>
        <View style={styles.container}>
          <ThemedText type="title">{profile.username}</ThemedText>
          <Image
            source={
              imageFailed
                ? DEFAULT_PROFILE.profilePictureSource
                : (profile.profilePictureSource ??
                  DEFAULT_PROFILE.profilePictureSource)
            }
            onError={() => setImageFailed(true)}
            style={styles.profilePicture}
          />
          <ThemedText>
            {status === "signedIn"
              ? "Connected to Spotify"
              : "Not connected to Spotify"}
          </ThemedText>
          <TouchableOpacity style={styles.tagButton} activeOpacity={0.5}>
            <View style={styles.tagButtonContent}>
              <ThemedText type="subtitle">Log Out</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    marginBottom: 90,
  },
  profilePicture: {
    width: 125,
    height: 125,
    borderRadius: 999,
    marginVertical: 10,
  },
  tagButton: {
    backgroundColor: "#3FA46B",
    alignSelf: "stretch",
    borderRadius: 15,
    marginTop: 50,
  },
  tagButtonContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingHorizontal: 100,
  },
});

/*<Button
      onPress={() => {
        router.push("/login");
      }}
      title="Go to Login"
    ></Button>*/
