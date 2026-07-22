import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
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
import FormField, { type FormFieldIds } from "./FormField";

export type RabAIInputProps = TextInputProps & {
  label: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fieldId?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
};

export function RabAIInput({
  accessibilityLabel,
  accessibilityState,
  containerStyle,
  disabled = false,
  editable,
  errorText,
  fieldId,
  helperText,
  inputContainerStyle,
  label,
  loading = false,
  multiline = false,
  onBlur,
  onFocus,
  placeholderTextColor = Colors.placeholder,
  prefix,
  readOnly = false,
  required = false,
  style,
  suffix,
  ...textInputProps
}: RabAIInputProps) {
  const [focused, setFocused] = useState(false);
  const isDisabled = disabled || loading || editable === false;
  const canEdit = !isDisabled && !readOnly;

  return (
    <FormField
      containerStyle={containerStyle}
      disabled={isDisabled}
      errorText={errorText}
      fieldId={fieldId}
      helperText={helperText}
      label={label}
      required={required}
    >
      {(ids) => (
        <View
          style={[
            styles.inputFrame,
            multiline && styles.inputFrameMultiline,
            focused && styles.inputFrameFocused,
            errorText && styles.inputFrameError,
            isDisabled && styles.inputFrameDisabled,
            readOnly && styles.inputFrameReadOnly,
            inputContainerStyle,
          ]}
        >
          {prefix ? <View style={styles.adornment}>{prefix}</View> : null}
          <TextInput
            {...textInputProps}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityLabelledBy={ids.labelId}
            accessibilityState={{
              ...accessibilityState,
              busy: loading || accessibilityState?.busy,
              disabled: isDisabled,
            }}
            aria-describedby={describedBy(ids)}
            aria-invalid={Boolean(errorText)}
            aria-labelledby={ids.labelId}
            editable={canEdit}
            multiline={multiline}
            nativeID={ids.inputId}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            placeholderTextColor={placeholderTextColor}
            readOnly={readOnly}
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              isDisabled && styles.inputDisabled,
              style,
            ]}
          />
          {loading ? (
            <ActivityIndicator
              accessibilityLabel="Se încarcă"
              color={Colors.goldPressed}
              size="small"
            />
          ) : suffix ? (
            <View style={styles.adornment}>{suffix}</View>
          ) : null}
        </View>
      )}
    </FormField>
  );
}

export default function Input(props: RabAIInputProps) {
  return (
    <RabAIInput
      {...props}
      containerStyle={[styles.legacySpacing, props.containerStyle]}
    />
  );
}

function describedBy(ids: FormFieldIds) {
  return [ids.descriptionId, ids.errorId].filter(Boolean).join(" ") || undefined;
}

const styles = StyleSheet.create({
  inputFrame: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.control,
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.inline,
  },
  inputFrameMultiline: {
    alignItems: "flex-start",
    minHeight: 120,
    paddingVertical: Spacing.inline,
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
  inputFrameReadOnly: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
  },
  input: {
    color: Colors.textPrimary,
    flex: 1,
    fontSize: Typography.body,
    minHeight: ControlHeight.medium - 2,
    minWidth: 0,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 94,
    textAlignVertical: "top",
  },
  inputDisabled: {
    color: Colors.textDisabled,
  },
  adornment: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
  },
  legacySpacing: {
    marginBottom: Spacing.inline,
  },
});
