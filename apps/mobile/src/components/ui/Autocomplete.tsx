import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TextInputKeyPressEventData,
  type ViewStyle,
} from "react-native";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Layers,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import FormField, { type FormFieldIds } from "./FormField";

export type RabAIAutocompleteOption = {
  id: string;
  title: string;
  subtitle?: string;
};

export type RabAIAutocompleteProps<
  TOption extends RabAIAutocompleteOption,
> = {
  activeIndex: number;
  emptyMessage: string;
  errorMessage?: string | null;
  validationError?: string;
  helperText?: string;
  fieldId: string;
  isOpen: boolean;
  label: string;
  loading: boolean;
  loadingLabel?: string;
  onActiveIndexChange: (index: number) => void;
  onChangeText: (text: string) => void;
  onFocus: () => void;
  onRequestClose: () => void;
  onSelect: (option: TOption) => void;
  placeholder: string;
  queryText: string;
  suggestions: TOption[];
  value: string;
  dropdownMode?: "overlay" | "inline";
  required?: boolean;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function RabAIAutocomplete<
  TOption extends RabAIAutocompleteOption,
>({
  activeIndex,
  containerStyle,
  disabled = false,
  dropdownMode = "overlay",
  emptyMessage,
  errorMessage,
  fieldId,
  helperText,
  isOpen,
  label,
  loading,
  loadingLabel = "Se caută…",
  onActiveIndexChange,
  onChangeText,
  onFocus,
  onRequestClose,
  onSelect,
  placeholder,
  queryText,
  required = false,
  suggestions,
  validationError,
  value,
}: RabAIAutocompleteProps<TOption>) {
  const [focused, setFocused] = useState(false);
  const listboxId = `${fieldId}-listbox`;
  const activeOptionId =
    activeIndex >= 0 && suggestions[activeIndex]
      ? `${fieldId}-option-${suggestions[activeIndex].id}`
      : undefined;
  const shouldShowList =
    isOpen &&
    !disabled &&
    (loading ||
      Boolean(errorMessage) ||
      suggestions.length > 0 ||
      queryText.trim().length >= 2);
  const listStatus = useMemo(() => {
    if (loading) {
      return loadingLabel;
    }

    if (errorMessage) {
      return errorMessage;
    }

    if (queryText.trim().length >= 2 && suggestions.length === 0) {
      return emptyMessage;
    }

    return null;
  }, [emptyMessage, errorMessage, loading, loadingLabel, queryText, suggestions.length]);

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
    <View
      style={[
        styles.field,
        shouldShowList && dropdownMode === "overlay" && styles.fieldOpen,
        containerStyle,
      ]}
    >
      <FormField
        disabled={disabled}
        errorText={validationError}
        fieldId={fieldId}
        helperText={helperText}
        label={label}
        required={required}
      >
        {(ids) => (
          <>
            <View
              style={[
                styles.inputFrame,
                focused && styles.inputFrameFocused,
                validationError && styles.inputFrameError,
                disabled && styles.inputFrameDisabled,
              ]}
            >
              <TextInput
                accessibilityLabel={label}
                accessibilityLabelledBy={ids.labelId}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-describedby={describedBy(ids)}
                aria-expanded={shouldShowList}
                aria-invalid={Boolean(validationError)}
                aria-labelledby={ids.labelId}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!disabled}
                nativeID={ids.inputId}
                onBlur={() => {
                  setFocused(false);
                  setTimeout(onRequestClose, 180);
                }}
                onChangeText={onChangeText}
                onFocus={() => {
                  setFocused(true);
                  onFocus();
                }}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                placeholderTextColor={Colors.placeholder}
                role={Platform.OS === "web" ? "combobox" : undefined}
                style={styles.input}
                value={value}
              />
            </View>

            {shouldShowList ? (
              <View
                aria-label={label}
                nativeID={listboxId}
                role={
                  Platform.OS === "web" ? ("listbox" as never) : undefined
                }
                style={[
                  styles.dropdown,
                  dropdownMode === "overlay"
                    ? styles.dropdownOverlay
                    : styles.dropdownInline,
                ]}
              >
                {listStatus ? (
                  <View
                    accessibilityLiveRegion="polite"
                    accessibilityState={{ busy: loading }}
                    style={styles.statusRow}
                  >
                    {loading ? (
                      <ActivityIndicator color={Colors.goldPressed} size="small" />
                    ) : null}
                    <Text
                      style={[
                        styles.statusText,
                        errorMessage && styles.errorText,
                      ]}
                    >
                      {listStatus}
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    keyboardShouldPersistTaps="always"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    style={styles.optionList}
                  >
                    {suggestions.map((suggestion, index) => {
                      const active = activeIndex === index;

                      return (
                        <Pressable
                          aria-selected={active}
                          accessibilityLabel={suggestion.subtitle
                            ? `${suggestion.title}, ${suggestion.subtitle}`
                            : suggestion.title}
                          key={suggestion.id}
                          nativeID={`${fieldId}-option-${suggestion.id}`}
                          onHoverIn={() => onActiveIndexChange(index)}
                          onPress={() => onSelect(suggestion)}
                          role={Platform.OS === "web" ? "option" : undefined}
                          style={({ pressed }) => [
                            styles.option,
                            active && styles.optionActive,
                            pressed && styles.optionPressed,
                            InteractionStyles.pointer,
                          ]}
                        >
                          <Text style={styles.optionTitle}>
                            <HighlightedText
                              queryText={queryText}
                              text={suggestion.title}
                            />
                          </Text>
                          {suggestion.subtitle ? (
                            <Text style={styles.optionSubtitle}>
                              {suggestion.subtitle}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            ) : null}
          </>
        )}
      </FormField>
    </View>
  );
}

export { RabAIAutocomplete };

function HighlightedText({ queryText, text }: { queryText: string; text: string }) {
  const match = findMatch(text, queryText);

  if (!match) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, match.start)}
      <Text style={styles.highlight}>{text.slice(match.start, match.end)}</Text>
      {text.slice(match.end)}
    </>
  );
}

function findMatch(text: string, queryText: string) {
  const query = queryText.trim();

  if (query.length < 2) {
    return null;
  }

  const start = text.toLocaleLowerCase("de-DE").indexOf(
    query.toLocaleLowerCase("de-DE")
  );

  return start < 0 ? null : { end: start + query.length, start };
}

function describedBy(ids: FormFieldIds) {
  return [ids.descriptionId, ids.errorId].filter(Boolean).join(" ") || undefined;
}

const styles = StyleSheet.create({
  field: {
    alignSelf: "stretch",
    minWidth: 0,
    position: "relative",
    zIndex: Layers.base,
  },
  fieldOpen: {
    zIndex: Layers.dropdown,
  },
  inputFrame: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.inline,
  },
  inputFrameFocused: {
    borderColor: Colors.focusRing,
    ...InteractionStyles.focusRing,
  },
  inputFrameError: {
    borderColor: Colors.danger,
  },
  inputFrameDisabled: {
    backgroundColor: Colors.surfaceDisabled,
    borderColor: Colors.borderMuted,
  },
  input: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    minHeight: ControlHeight.medium - 2,
    padding: 0,
  },
  dropdown: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    left: 0,
    maxHeight: 296,
    overflow: "hidden",
    right: 0,
    ...Shadows.elevated,
  },
  dropdownOverlay: {
    position: "absolute",
    top: ControlHeight.medium + Typography.lineHeight.body + Spacing.component,
    zIndex: Layers.dropdown,
  },
  dropdownInline: {
    marginTop: Spacing.compact,
    position: "relative",
  },
  optionList: {
    maxHeight: 294,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.control,
    justifyContent: "center",
    minHeight: ControlHeight.large,
    paddingHorizontal: Spacing.inline,
    paddingVertical: Spacing.control,
  },
  statusText: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  errorText: {
    color: Colors.danger,
  },
  option: {
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    justifyContent: "center",
    minHeight: ControlHeight.large,
    paddingHorizontal: Spacing.inline,
    paddingVertical: Spacing.control,
  },
  optionActive: {
    backgroundColor: Colors.goldMuted,
  },
  optionPressed: {
    backgroundColor: Colors.surfaceMuted,
  },
  optionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
  },
  optionSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.compact,
  },
  highlight: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
});
