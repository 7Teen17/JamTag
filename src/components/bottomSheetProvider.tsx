import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Search } from "lucide-react-native";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllTags, getTagsFromSong } from "../db/db";
import CurrentTaggingItem from "./currentTaggingItem";
import { ThemedText } from "./default/themed-text";
import Tag from "./tag";

type BottomSheetContextValue = {
  openSheet: (trackId?: string) => void;
  closeSheet: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error("useBottomSheet must be used inside BottomSheetProvider");
  }

  return context;
}

export default function BottomSheetProvider({ children }: PropsWithChildren) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "80%"], []);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState("");

  const openSheet = useCallback(
    async (providedTrackId?: string) => {
      if (providedTrackId && providedTrackId !== trackId) {
        setTrackId(providedTrackId);
      }
      bottomSheetRef.current?.present();
    },
    [trackId],
  );

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const contextValue = useMemo(
    () => ({ openSheet, closeSheet }),
    [openSheet, closeSheet],
  );

  const tags = trackId != null ? getTagsFromSong(trackId) : [];
  const normalizedSearch = tagSearch.trim().toLowerCase();
  const suggestions = getAllTags().filter(
    (tag) =>
      !tags.includes(tag) &&
      (!normalizedSearch || tag.toLowerCase().includes(normalizedSearch)),
  );

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#202020" }}
        handleIndicatorStyle={{ backgroundColor: "#adadad" }}
        footerComponent={Footer}
        backdropComponent={Backdrop}
        onDismiss={() => setTagSearch("")}
      >
        <BottomSheetView>
          <ThemedText type="title" style={styles.editTagsText}>
            Edit Tags
          </ThemedText>
          <CurrentTaggingItem id={trackId ? trackId : ""}></CurrentTaggingItem>
          <View
            style={{
              height: 1,
              backgroundColor: "#333",
              marginVertical: 8,
            }}
          />
          <View
            style={{
              margin: 5,
              marginBottom: 15,
            }}
          >
            <ThemedText style={styles.tagsText}>TAGS</ThemedText>
            <View style={styles.tagContainer}>
              {tags.map((val, index) => (
                <Tag key={index} value={val} type="large" removeable />
              ))}
              {tags.length == 0 && (
                <View style={{ width: "100%" }}>
                  <ThemedText
                    style={[styles.tagsText, { textAlign: "center" }]}
                  >
                    No Tags Found
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "#333",
              marginVertical: 8,
            }}
          />
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Search style={styles.searchIcon}></Search>
            <BottomSheetTextInput
              style={styles.searchText}
              value={tagSearch}
              onChangeText={setTagSearch}
              placeholder="Search or Create Tags"
              placeholderTextColor="#8D8D8D"
            />
          </View>
          <View style={{ margin: 5 }}>
            <ThemedText style={styles.tagsText}>SUGGESTIONS</ThemedText>
            <View style={styles.tagContainer}>
              {suggestions.map((tag) => (
                <Tag key={tag} type="large" value={tag} addable />
              ))}
              {tagSearch.trim() && suggestions.length === 0 && (
                <Tag type="large" value={`Create tag '${tagSearch}'`} addable />
              )}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetContext.Provider>
  );
}

function Footer({ animatedFooterPosition }: BottomSheetFooterProps) {
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  return (
    <BottomSheetFooter
      bottomInset={bottomSafeArea}
      animatedFooterPosition={animatedFooterPosition}
    >
      <TouchableOpacity style={styles.saveButton}>
        <ThemedText type="title">Save Tags</ThemedText>
      </TouchableOpacity>
    </BottomSheetFooter>
  );
}

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.75}
    ></BottomSheetBackdrop>
  );
}

const styles = StyleSheet.create({
  editTagsText: {
    width: "auto",
    textAlign: "center",
    color: "#878787",
  },
  saveButton: {
    width: "auto",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#3FA46B",
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tagContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagsText: {
    color: "#7e7e7e",
    fontFamily: "UrbanistBold",
    fontSize: 14,
    marginBottom: 5,
  },
  searchBar: {
    backgroundColor: "#272727",
    width: "auto",
    height: 50,
    margin: 10,
    padding: 3,
    borderRadius: 5,
    borderColor: "#535353",
    borderWidth: 1,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
  },
  searchIcon: {
    color: "white",
    marginLeft: 5,
    marginRight: 7,
  },
  searchText: {
    flex: 1,
    fontFamily: "UrbanistRegular",
    fontSize: 14,
    color: "#8D8D8D",
  },
});
