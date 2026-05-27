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
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./default/themed-text";
import SearchedItem from "./searchedItem";

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

  const openSheet = useCallback(async (trackId?: string) => {
    setTrackId(trackId ? trackId : null);
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const contextValue = useMemo(
    () => ({ openSheet, closeSheet }),
    [openSheet, closeSheet],
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
      >
        <BottomSheetView>
          <ThemedText type="title" style={styles.editTagsText}>
            Edit Tags
          </ThemedText>
          <SearchedItem id={trackId ? trackId : ""}></SearchedItem>
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
      <View style={styles.testing}>
        <ThemedText type="title">Save Tags</ThemedText>
      </View>
    </BottomSheetFooter>
  );
}

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.8}
    ></BottomSheetBackdrop>
  );
}

const styles = StyleSheet.create({
  editTagsText: {
    width: "auto",
    textAlign: "center",
    color: "#878787",
  },
  testing: {
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
});
