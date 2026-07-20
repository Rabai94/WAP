import { useEffect, useId, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import FormField from "./FormField";

export type RabAISelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type RabAISelectProps = {
  label: string;
  options: RabAISelectOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fieldId?: string;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
};

export default function RabAISelect({
  disabled = false,
  emptyMessage = "Nu există opțiuni.",
  errorText,
  fieldId,
  helperText,
  label,
  loading = false,
  onChange,
  options,
  placeholder = "Selectează",
  required = false,
  style,
  value,
}: RabAISelectProps) {
  const generatedId = useId().replace(/:/g, "");
  const resolvedFieldId = fieldId ?? `rabai-select-${generatedId}`;
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value))
  );
  const selectedOption = options.find((option) => option.value === value);
  const isDisabled = disabled || loading;

  useEffect(() => {
    if (!open || Platform.OS !== "web") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        focusNode(triggerRef.current);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((current) => nextEnabledIndex(options, current, direction));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const option = options[activeIndex];

        if (option && !option.disabled) {
          event.preventDefault();
          onChange(option.value);
          setOpen(false);
          focusNode(triggerRef.current);
        }
      }
    }

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onChange, open, options]);

  return (
    <FormField
      containerStyle={style}
      disabled={isDisabled}
      errorText={errorText}
      fieldId={resolvedFieldId}
      helperText={helperText}
      label={label}
      required={required}
    >
      {(ids) => (
        <>
          <Pressable
            ref={triggerRef}
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, expanded: open }}
            aria-controls={`${resolvedFieldId}-listbox`}
            aria-haspopup="listbox"
            disabled={isDisabled}
            onBlur={() => {
              setFocused(false);
              setTimeout(() => setOpen(false), 180);
            }}
            onFocus={() => setFocused(true)}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            onPress={() => setOpen((current) => !current)}
            style={({ pressed }) => [
              styles.trigger,
              focused && styles.triggerFocused,
              hovered && !isDisabled && styles.triggerHovered,
              pressed && styles.triggerPressed,
              errorText && styles.triggerError,
              isDisabled && styles.triggerDisabled,
              InteractionStyles.pointer,
              focused && InteractionStyles.focusRing,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[styles.value, !selectedOption && styles.placeholder]}
            >
              {loading ? "Se încarcă…" : selectedOption?.label ?? placeholder}
            </Text>
            <Text accessibilityElementsHidden style={styles.chevron}>
              {open ? "⌃" : "⌄"}
            </Text>
          </Pressable>
          {open && !isDisabled ? (
            <View
              nativeID={`${resolvedFieldId}-listbox`}
              role={
                Platform.OS === "web" ? ("listbox" as never) : undefined
              }
              style={styles.list}
            >
              {options.length === 0 ? (
                <Text accessibilityLiveRegion="polite" style={styles.empty}>
                  {emptyMessage}
                </Text>
              ) : (
                <ScrollView
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={styles.optionList}
                >
                  {options.map((option, index) => {
                  const selected = option.value === value;
                  const active = index === activeIndex;

                    return (
                    <Pressable
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{
                        checked: selected,
                        disabled: option.disabled,
                      }}
                      disabled={option.disabled}
                      key={option.value}
                      onHoverIn={() => setActiveIndex(index)}
                      onPress={() => {
                        onChange(option.value);
                        setOpen(false);
                        focusNode(triggerRef.current);
                      }}
                      role={Platform.OS === "web" ? "option" : undefined}
                      style={({ pressed }) => [
                        styles.option,
                        (active || selected) && styles.optionActive,
                        pressed && styles.optionPressed,
                        option.disabled && styles.optionDisabled,
                        InteractionStyles.pointer,
                      ]}
                    >
                      <View style={styles.optionCopy}>
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        {option.description ? (
                          <Text style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        ) : null}
                      </View>
                      {selected ? (
                        <Text accessibilityElementsHidden style={styles.check}>
                          ✓
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
  );
}

export { RabAISelect };

function nextEnabledIndex(
  options: RabAISelectOption[],
  current: number,
  direction: 1 | -1
) {
  if (options.length === 0) {
    return -1;
  }

  for (let offset = 1; offset <= options.length; offset += 1) {
    const candidate = (current + direction * offset + options.length) % options.length;

    if (!options[candidate]?.disabled) {
      return candidate;
    }
  }

  return current;
}

function focusNode(node: View | null) {
  (node as View & { focus?: () => void } | null)?.focus?.();
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.control,
    justifyContent: "space-between",
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.inline,
  },
  triggerFocused: {
    borderColor: Colors.focusRing,
    borderWidth: 2,
  },
  triggerHovered: {
    borderColor: Colors.primary,
  },
  triggerPressed: {
    backgroundColor: Colors.surfaceMuted,
  },
  triggerError: {
    borderColor: Colors.danger,
  },
  triggerDisabled: {
    backgroundColor: Colors.surfaceDisabled,
    borderColor: Colors.borderMuted,
  },
  value: {
    color: Colors.textPrimary,
    flex: 1,
    fontSize: Typography.body,
  },
  placeholder: {
    color: Colors.placeholder,
  },
  chevron: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  list: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    marginTop: Spacing.compact,
    maxHeight: 300,
    overflow: "hidden",
  },
  optionList: {
    maxHeight: 298,
  },
  option: {
    alignItems: "center",
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    justifyContent: "space-between",
    minHeight: ControlHeight.large,
    paddingHorizontal: Spacing.inline,
    paddingVertical: Spacing.control,
  },
  optionActive: {
    backgroundColor: Colors.selection,
  },
  optionPressed: {
    backgroundColor: Colors.primarySoft,
  },
  optionDisabled: {
    opacity: 0.48,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  optionDescription: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: Typography.lineHeight.tight,
    marginTop: Spacing.compact,
  },
  check: {
    color: Colors.primaryPressed,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    padding: Spacing.inline,
  },
});
