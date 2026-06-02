import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
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

  const openSheet = useCallback(async (providedTrackId?: string) => {
    if (providedTrackId && providedTrackId !== trackId) {
      setTrackId(providedTrackId);
    }
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const contextValue = useMemo(
    () => ({ openSheet, closeSheet }),
    [openSheet, closeSheet],
  );

  const data = [
    "Cool",
    "Late Night",
    "Fun",
    "Sleepy Time zzzzz",
    "Morning",
    "Slow and Sad",
  ];

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
          <View style={{ margin: 5 }}>
            <ThemedText style={styles.tagsText}>TAGS</ThemedText>
            <View style={styles.tagContainer}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Tag
                  key={index}
                  value={data[Math.floor(Math.random() * data.length)]}
                  type="large"
                  removeable
                />
              ))}
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: "#333",
              marginVertical: 8,
            }}
          />
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
});
