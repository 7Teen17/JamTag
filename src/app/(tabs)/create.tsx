import { ThemedText } from "@/src/components/default/themed-text";
import Divider from "@/src/components/Divider";
import HorizontalSongItem from "@/src/components/HorizontalSongItem";
import Tag from "@/src/components/tag";
import TagFilterHelpModal, {
  HIDE_FILTER_HELP_KEY,
} from "@/src/components/TagFilterHelpModal";
import { getAllTags, getSongsFromTags } from "@/src/db/db";
import { useSpotifyAuth } from "@/src/hooks/auth/useSpotifyAuth";
import type { SongTag } from "@/src/services/music/types";
import { useFocusEffect } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { Info, Search } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

let hasShownFilterHelpThisSession = false;

export default function CreateScreen() {
  const [filterHelpVisible, setFilterHelpVisible] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const [selectedTags, setSelectedTags] = useState<SongTag[]>([]);
  const [anyOfTags, setAnyOfTags] = useState<SongTag[]>([]);
  const [excludedTags, setExcludedTags] = useState<SongTag[]>([]);
  const [tagMode, setTagMode] = useState<"all" | "any" | "none">("all");
  const [allTags, setAllTags] = useState<SongTag[]>([]);
  const { musicService, refresh } = useSpotifyAuth();
  const [isExporting, setIsExporting] = useState(false);
  const exportInProgressLock = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function showFilterHelpIfNeeded() {
        if (hasShownFilterHelpThisSession) return;

        let hidden = false;
        try {
          hidden = (await Storage.getItem(HIDE_FILTER_HELP_KEY)) === "true";
        } catch (error) {
          console.warn("Couldn't read the filter help preference.", error);
        }

        if (active && !hidden && !hasShownFilterHelpThisSession) {
          hasShownFilterHelpThisSession = true;
          setFilterHelpVisible(true);
        }
      }

      void showFilterHelpIfNeeded();

      return () => {
        active = false;
        setFilterHelpVisible(false);
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const latestTags = getAllTags();

      const tagsById = new Map(latestTags.map((tag) => [tag.id, tag]));

      function reconcileTags(previous: SongTag[]): SongTag[] {
        return previous.flatMap((oldTag) => {
          const currentTag = tagsById.get(oldTag.id);

          return currentTag ? [currentTag] : [];
        });
      }

      setAllTags(latestTags);

      setSelectedTags(reconcileTags);
      setAnyOfTags(reconcileTags);
      setExcludedTags(reconcileTags);
    }, []),
  );

  const songs = getSongsFromTags(
    selectedTags.map((tag) => tag.id),
    excludedTags.map((tag) => tag.id),
    anyOfTags.map((tag) => tag.id),
  );
  const moreTags = allTags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.id === tag.id) &&
      !anyOfTags.some((selected) => selected.id === tag.id) &&
      !excludedTags.some((excluded) => excluded.id === tag.id) &&
      (!tagSearch.trim() ||
        tag.name.toLowerCase().includes(tagSearch.trim().toLowerCase())),
  );
  const totalMinutes = Math.floor(
    songs.reduce((total, song) => total + (song.durationMs ?? 0), 0) / 60000,
  );
  const duration =
    totalMinutes >= 60
      ? `${Math.floor(totalMinutes / 60)} hr ${totalMinutes % 60} min`
      : `${totalMinutes} min`;

  async function listen() {
    if (!musicService || !songs.length || exportInProgressLock.current) return;
    exportInProgressLock.current = true;
    setIsExporting(true);
    try {
      const token = await refresh();
      if (!token) throw new Error("Please sign in to Spotify again.");
      musicService.setAuthSession({ accessToken: token.accessToken });
      const playlist = await musicService.exportCurrentJam(songs);
      await Linking.openURL(playlist.url);
    } catch (error) {
      Alert.alert(
        "Couldn't open your jam",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      exportInProgressLock.current = false;
      setIsExporting(false);
    }
  }

  const toggleSelectedTag = useCallback((tag: SongTag) => {
    setSelectedTags((tags) =>
      tags.some((eachTag) => eachTag.id === tag.id)
        ? tags.filter((eachTag) => eachTag.id !== tag.id)
        : [...tags, tag],
    );
    setTagSearch("");
  }, []);

  const toggleExcludedTag = useCallback((tag: SongTag) => {
    setExcludedTags((tags) =>
      tags.some((eachTag) => eachTag.id === tag.id)
        ? tags.filter((eachTag) => eachTag.id !== tag.id)
        : [...tags, tag],
    );
    setTagSearch("");
  }, []);

  const toggleAnyOfTag = useCallback((tag: SongTag) => {
    setAnyOfTags((tags) =>
      tags.some((eachTag) => eachTag.id === tag.id)
        ? tags.filter((eachTag) => eachTag.id !== tag.id)
        : [...tags, tag],
    );
    setTagSearch("");
  }, []);

  const addTag = {
    all: toggleSelectedTag,
    any: toggleAnyOfTag,
    none: toggleExcludedTag,
  }[tagMode];
  return (
    <>
      <ThemedText type="title" style={{ fontSize: 40, paddingLeft: 10 }}>
        • Create
      </ThemedText>
      <Divider />
      <Pressable
        style={styles.searchBar}
        accessible={false}
        onPress={() => searchInputRef.current?.focus()}
      >
        <Search color="white" style={styles.searchIcon} pointerEvents="none" />
        <TextInput
          ref={searchInputRef}
          style={styles.searchText}
          accessibilityLabel="Search tags"
          value={tagSearch}
          onChangeText={(search) => {
            setTagSearch(search);
          }}
          placeholder="Search Tags"
          placeholderTextColor="#8D8D8D"
        />
        <TouchableOpacity
          style={styles.filterHelpButton}
          accessibilityRole="button"
          accessibilityLabel="Explain All Of, Any Of, and None Of filters"
          onPress={() => {
            hasShownFilterHelpThisSession = true;
            setFilterHelpVisible(true);
          }}
        >
          <Info size={20} color="#ECEDEE" />
        </TouchableOpacity>
      </Pressable>
      <TagRow
        title="All Of"
        tags={selectedTags}
        emptyText="No Tags Selected"
        onTagPress={toggleSelectedTag}
      />
      <TagRow
        title="Any Of"
        tags={anyOfTags}
        emptyText="No Tags Selected"
        onTagPress={toggleAnyOfTag}
      />
      <TagRow
        title="None Of"
        tags={excludedTags}
        emptyText="No Tags Excluded"
        onTagPress={toggleExcludedTag}
      />
      <Divider />

      {/*More Tags Section */}
      <View style={styles.moreTagsHeader}>
        <ThemedText style={styles.sectionNameText} type="bigText">
          More Tags
        </ThemedText>
        <View style={styles.addToControl}>
          <ThemedText>Add to</ThemedText>
          <View style={styles.tagModeToggle}>
            {(
              [
                { mode: "all", label: "All Of" },
                { mode: "any", label: "Any Of" },
                { mode: "none", label: "None Of" },
              ] as const
            ).map(({ mode, label }) => (
              <TouchableOpacity
                key={mode}
                accessibilityRole="button"
                accessibilityLabel={`Add tags to ${label}`}
                accessibilityState={{ selected: tagMode === mode }}
                style={[
                  styles.tagModeButton,
                  tagMode === mode && styles.tagModeButtonSelected,
                ]}
                onPress={() => setTagMode(mode)}
              >
                <ThemedText type="tag" style={styles.tagModeText}>
                  {label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagScroll}
        contentContainerStyle={styles.tagScrollContent}
      >
        {moreTags.length === 0 ? (
          <ThemedText
            style={{ color: "#727272", flex: 1, textAlign: "center" }}
          >
            No Tags Available
          </ThemedText>
        ) : (
          moreTags.map((tag) => (
            <Tag
              key={tag.id}
              value={tag.name}
              color={tag.color}
              type="large"
              addable
              onPress={() => addTag(tag)}
            />
          ))
        )}
      </ScrollView>
      {/*hide artists section for now <Divider />
      <View style={styles.artistContainer}>
        <ThemedText type="bigText">Artists</ThemedText>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ThemedText>All Artists Selected</ThemedText>
          <ChevronRight color="white" />
        </View>
      </View>*/}
      <Divider />
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
        }}
      >
        <ThemedText type="subtitle" style={styles.sectionNameText}>
          Your Jam
        </ThemedText>
        <ThemedText style={{ marginTop: 3 }}>
          {songs.length} {songs.length === 1 ? "Song" : "Songs"} • {duration}
        </ThemedText>
      </View>
      <ScrollView>
        {songs.map((song) => (
          <HorizontalSongItem key={song.providerTrackId} track={song} />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.createButton,
          (!musicService || !songs.length || isExporting) && { opacity: 0.5 },
        ]}
        activeOpacity={0.5}
        disabled={!musicService || !songs.length || isExporting}
        onPress={listen}
      >
        <ThemedText
          style={{
            flex: 1,
            textAlign: "center",
            textAlignVertical: "center",
          }}
          type="subtitle"
        >
          {isExporting ? "Preparing Jam…" : "Listen"}
        </ThemedText>
      </TouchableOpacity>
      <TagFilterHelpModal
        visible={filterHelpVisible}
        onClose={() => setFilterHelpVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filterHelpButton: {
    paddingHorizontal: 8,
  },
  searchBar: {
    backgroundColor: "#272727",
    width: "auto",
    height: 50,
    margin: 10,
    marginTop: 5,
    padding: 3,
    borderRadius: 5,
    borderColor: "#535353",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 7,
  },
  searchText: {
    flex: 1,
    alignSelf: "stretch",
    fontFamily: "UrbanistRegular",
    fontSize: 14,
    color: "#8D8D8D",
  },
  sectionNameText: {
    marginLeft: 10,
    marginVertical: 5,
  },
  moreTagsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingRight: 10,
  },
  addToControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagModeToggle: {
    flexDirection: "row",
    backgroundColor: "#272727",
    borderRadius: 8,
    padding: 2,
  },
  tagModeButton: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  tagModeButtonSelected: {
    backgroundColor: "#3FA46B",
  },
  tagModeText: {
    fontSize: 14,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    flexShrink: 0,
  },
  tagRowName: {
    width: 90,
    paddingLeft: 10,
    paddingRight: 8,
    fontSize: 14,
  },
  tagRowScroll: {
    flex: 1,
  },
  tagRowScrollContent: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  emptyTagsText: {
    color: "#727272",
  },
  tagScroll: {
    minHeight: 36,
    flexGrow: 0,
    flexShrink: 0,
    marginVertical: 10,
  },
  tagScrollContent: {
    gap: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  artistContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  createButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
  },
});

function TagRow({
  title,
  tags,
  emptyText,
  onTagPress,
}: {
  title: string;
  tags: SongTag[];
  emptyText: string;
  onTagPress: (tag: SongTag) => void;
}) {
  return (
    <View style={styles.tagRow}>
      <ThemedText style={styles.tagRowName} type="bigText">
        {title}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagRowScroll}
        contentContainerStyle={styles.tagRowScrollContent}
      >
        {tags.length === 0 ? (
          <ThemedText style={styles.emptyTagsText}>{emptyText}</ThemedText>
        ) : (
          tags.map((tag) => (
            <Tag
              key={tag.id}
              value={tag.name}
              color={tag.color}
              type="large"
              removeable
              onPress={() => onTagPress(tag)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
