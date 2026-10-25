import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Search, X } from "lucide-react-native";
import { useRef, type ComponentRef } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  type ReturnKeyTypeOptions,
} from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  bottomSheet?: boolean;
  placeholder: string;
  accessibilityLabel: string;
  autoCorrect?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
};

export default function SearchBar({
  value,
  onChangeText,
  bottomSheet = false,
  accessibilityLabel,
  placeholder,
  autoCorrect,
  returnKeyType,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const sheetInputRef = useRef<ComponentRef<typeof BottomSheetTextInput>>(null);

  function focusInput() {
    if (bottomSheet) sheetInputRef.current?.focus();
    else inputRef.current?.focus();
  }

  const props = {
    placeholder,
    autoCorrect,
    returnKeyType,
    value,
    onChangeText,
    accessibilityLabel,
    placeholderTextColor: "#8D8D8D",
    style: styles.input,
    clearButtonMode: "never" as const,
  };

  return (
    <Pressable
      style={styles.container}
      accessible={false}
      onPress={focusInput}
    >
      <Search color="white" style={styles.searchIcon} pointerEvents="none" />
      {bottomSheet ? (
        <BottomSheetTextInput ref={sheetInputRef} {...props} />
      ) : (
        <TextInput ref={inputRef} {...props} />
      )}
      {value.length > 0 && (
        <Pressable
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={(event) => {
            event.stopPropagation();
            onChangeText("");
            focusInput();
          }}
        >
          <X size={20} color="#ECEDEE" pointerEvents="none" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#272727",
    height: 50,
    flexShrink: 0,
    margin: 10,
    padding: 3,
    borderRadius: 5,
    borderColor: "#535353",
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
  },
  searchIcon: {
    marginLeft: 5,
    marginRight: 7,
  },
  input: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
    fontFamily: "UrbanistRegular",
    fontSize: 14,
    color: "white",
  },
  clearButton: {
    width: 44,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
});
