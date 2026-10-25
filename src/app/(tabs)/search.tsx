import { useBottomSheet } from "@/src/components/bottomSheetProvider";
import { ThemedText } from "@/src/components/default/themed-text";
import Divider from "@/src/components/Divider";
import HorizontalSongItem from "@/src/components/HorizontalSongItem";
import SearchBar from "@/src/components/SearchBar";
import { useSpotifyAuth } from "@/src/hooks/auth/useSpotifyAuth";
import type { MusicTrack } from "@/src/services/music/types";
import { Search } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

export default function SearchScreen() {
  const { musicService } = useSpotifyAuth();
  const { openSheet } = useBottomSheet();
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextOffset = useRef<number | null>(null);
  const generation = useRef(0);
  const pending = useRef(false);

  const loadPage = useCallback(
    async (offset: number, version: number) => {
      if (!musicService || !query.trim() || pending.current) return;
      pending.current = true;
      setLoading(true);
      setError(null);
      try {
        const page = await musicService.searchTracks(query.trim(), offset);
        if (version !== generation.current) return;
        setTracks((previous) => {
          if (offset === 0) return page.items;
          const ids = new Set(previous.map((track) => track.providerTrackId));
          return [
            ...previous,
            ...page.items.filter((track) => !ids.has(track.providerTrackId)),
          ];
        });
        nextOffset.current = page.nextOffset;
      } catch (error) {
        if (version === generation.current) {
          setError(error instanceof Error ? error.message : "Search failed.");
        }
      } finally {
        if (version === generation.current) {
          pending.current = false;
          setLoading(false);
        }
      }
    },
    [musicService, query],
  );

  useEffect(() => {
    const version = ++generation.current;
    pending.current = false;
    nextOffset.current = null;
    const timeout = setTimeout(() => {
      setTracks([]);
      setError(null);
      setLoading(false);
      void loadPage(0, version);
    }, 300);
    return () => {
      clearTimeout(timeout);
      generation.current = version + 1;
    };
  }, [loadPage, musicService, query]);

  return (
    <>
      <ThemedText type="title" style={{ fontSize: 40, paddingLeft: 10 }}>
        • Search
      </ThemedText>
      <Divider />
      <View style={styles.container}>
        <SearchBar
          placeholder="Search Songs, Artists, Albums"
          accessibilityLabel="Search songs"
          value={query}
          onChangeText={(text) => {
            if (text === query) return;
            generation.current++;
            nextOffset.current = null;
            setTracks([]);
            setError(null);
            setLoading(Boolean(musicService && text.trim()));
            setQuery(text);
          }}
          autoCorrect={false}
          returnKeyType="search"
        />
        <FlatList
          key={query}
          data={tracks}
          contentContainerStyle={
            !loading && !error && tracks.length === 0
              ? styles.emptyListContent
              : undefined
          }
          keyExtractor={(track) => track.providerTrackId}
          renderItem={({ item }) => (
            <HorizontalSongItem track={item} onPress={openSheet} />
          )}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (!error && nextOffset.current !== null) {
              void loadPage(nextOffset.current, generation.current);
            }
          }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyState}>
                <Search size={48} color="#8D8D8D" strokeWidth={1.5} />
                <ThemedText style={styles.emptyStateText}>
                  Search for Songs
                </ThemedText>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading ? (
              <ActivityIndicator />
            ) : error ? (
              <ThemedText
                accessibilityRole="button"
                onPress={() =>
                  void loadPage(nextOffset.current ?? 0, generation.current)
                }
              >
                {error} Tap to retry.
              </ThemedText>
            ) : null
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyStateText: {
    color: "#8D8D8D",
    fontFamily: "UrbanistRegular",
    fontSize: 18,
    marginTop: 12,
  },
});
