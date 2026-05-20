import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { ThemedText } from "./default/themed-text";

type BottomSheetContextValue = {
  openSheet: () => void;
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

  const openSheet = useCallback(() => {
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
      >
        <BottomSheetView>
          <ThemedText>Testing!</ThemedText>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetContext.Provider>
  );
}
