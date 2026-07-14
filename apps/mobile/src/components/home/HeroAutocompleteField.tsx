import { Radius, Spacing, Typography } from "@/theme";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";

export type HeroAutocompleteOption = {
  id: string;
  title: string;
  subtitle?: string;
};

type HeroAutocompleteFieldProps<TOption extends HeroAutocompleteOption> = {
  activeIndex: number;
  emptyMessage: string;
  errorMessage?: string | null;
  fieldId: string;
  isOpen: boolean;
  label: string;
  loading: boolean;
  onActiveIndexChange: (index: number) => void;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onRequestClose: () => void;
  onSelect: (option: TOption) => void;
  placeholder: string;
  queryText: string;
  suggestions: TOption[];
  value: string;
};

export default function HeroAutocompleteField<
  TOption extends HeroAutocompleteOption,
>({
  activeIndex,
  emptyMessage,
  errorMessage,
  fieldId,
  isOpen,
  label,
  loading,
  onActiveIndexChange,
  onChangeText,
  onFocus,
  onRequestClose,
  onSelect,
  placeholder,
  queryText,
  suggestions,
  value,
}: HeroAutocompleteFieldProps<TOption>) {
  const [focused, setFocused] = useState(false);
  const listboxId = `${fieldId}-listbox`;
  const activeOptionId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `${fieldId}-option-${suggestions[activeIndex].id}`
      : undefined;
  const shouldShowList =
    isOpen &&
    (loading ||
      Boolean(errorMessage) ||
      suggestions.length > 0 ||
      queryText.trim().length >= 2);

  const listStatus = useMemo(() => {
    if (loading) {
      return "Se cauta...";
    }

    if (errorMessage) {
      return errorMessage;
    }

    if (queryText.trim().length >= 2 && suggestions.length === 0) {
      return emptyMessage;
    }

    return null;
  }, [emptyMessage, errorMessage, loading, queryText, suggestions.length]);

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) {
    const key = event.nativeEvent.key;

    if (key === "Escape") {
      onRequestClose();
      return;
    }

    if (!shouldShowList || suggestions.length === 0) {
      return;
    }

    if (key === "ArrowDown") {
      onActiveIndexChange(
        activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0
      );
      return;
    }

    if (key === "ArrowUp") {
      onActiveIndexChange(
        activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1
      );
      return;
    }

    if (key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      onSelect(suggestions[activeIndex]);
    }
  }

  return (
    <View style={[styles.field, shouldShowList && styles.fieldOpen]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        aria-activedescendant={activeOptionId}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={shouldShowList}
        autoCapitalize="none"
        autoCorrect={false}
        onBlur={() => {
          setFocused(false);
          setTimeout(onRequestClose, 120);
        }}
        onChangeText={onChangeText}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        placeholderTextColor="#8B96B3"
        role={Platform.OS === "web" ? "combobox" : undefined}
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
      />

      {shouldShowList ? (
        <View
          aria-label={label}
          id={listboxId}
          role={Platform.OS === "web" ? ("listbox" as never) : undefined}
          style={styles.dropdown}
        >
          {listStatus ? (
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, errorMessage && styles.errorText]}>
                {listStatus}
              </Text>
            </View>
          ) : (
            suggestions.map((suggestion, index) => {
              const active = activeIndex === index;

              return (
                <Pressable
                  aria-selected={active}
                  id={`${fieldId}-option-${suggestion.id}`}
                  key={suggestion.id}
                  onHoverIn={() => {
                    onActiveIndexChange(index);
                  }}
                  onPress={() => {
                    onSelect(suggestion);
                  }}
                  role={Platform.OS === "web" ? "option" : undefined}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <Text style={styles.optionTitle}>
                    <HighlightedText queryText={queryText} text={suggestion.title} />
                  </Text>
                  {suggestion.subtitle ? (
                    <Text numberOfLines={1} style={styles.optionSubtitle}>
                      {suggestion.subtitle}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
}

function HighlightedText({
  queryText,
  text,
}: {
  queryText: string;
  text: string;
}) {
  const match = findMatch(text, queryText);

  if (!match) {
    return <>{text}</>;
  }

  const { end, start } = match;

  return (
    <>
      {text.slice(0, start)}
      <Text style={styles.highlight}>{text.slice(start, end)}</Text>
      {text.slice(end)}
    </>
  );
}

function findMatch(text: string, queryText: string) {
  const query = queryText.trim();

  if (query.length < 2) {
    return null;
  }

  const haystack = text.toLocaleLowerCase("de-DE");
  const needle = query.toLocaleLowerCase("de-DE");
  const start = haystack.indexOf(needle);

  if (start < 0) {
    return null;
  }

  return {
    end: start + query.length,
    start,
  };
}

const styles = StyleSheet.create({
  field: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 220,
    position: "relative",
    zIndex: 1,
  },
  fieldOpen: {
    zIndex: 80,
  },
  label: {
    color: "#17213F",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderColor: "rgba(214, 224, 245, 0.86)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: "#0A1028",
    minHeight: 54,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputFocused: {
    borderColor: "rgba(24, 199, 223, 0.86)",
    shadowColor: "#145CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 2,
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(118, 111, 255, 0.22)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    elevation: 16,
    left: 0,
    maxHeight: 292,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    top: 82,
    zIndex: 999,
  },
  statusRow: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusText: {
    color: "#66708A",
    fontSize: Typography.bodySmall,
  },
  errorText: {
    color: "#B42318",
  },
  option: {
    borderBottomColor: "rgba(218, 227, 245, 0.78)",
    borderBottomWidth: 1,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionActive: {
    backgroundColor: "#EEF4FF",
  },
  optionTitle: {
    color: "#0A1028",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  optionSubtitle: {
    color: "#66708A",
    fontSize: 12,
    marginTop: 3,
  },
  highlight: {
    color: "#145CFF",
    fontWeight: Typography.fontWeight.black,
  },
});
