import { useId, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

export type FormFieldIds = {
  descriptionId?: string;
  errorId?: string;
  inputId: string;
  labelId: string;
};

export type FormFieldProps = {
  label: string;
  children: ReactNode | ((ids: FormFieldIds) => ReactNode);
  required?: boolean;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  fieldId?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FormField({
  children,
  containerStyle,
  disabled = false,
  errorText,
  fieldId,
  helperText,
  label,
  required = false,
}: FormFieldProps) {
  const generatedId = useId().replace(/:/g, "");
  const baseId = fieldId ?? `rabai-field-${generatedId}`;
  const ids: FormFieldIds = {
    descriptionId: helperText ? `${baseId}-description` : undefined,
    errorId: errorText ? `${baseId}-error` : undefined,
    inputId: baseId,
    labelId: `${baseId}-label`,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        nativeID={ids.labelId}
        style={[styles.label, disabled && styles.disabledLabel]}
      >
        {label}
        {required ? (
          <Text accessibilityLabel="obligatoriu" style={styles.required}>
            {" *"}
          </Text>
        ) : null}
      </Text>
      {typeof children === "function" ? children(ids) : children}
      {errorText ? (
        <Text
          accessibilityLiveRegion="polite"
          nativeID={ids.errorId}
          role="alert"
          style={styles.error}
        >
          {errorText}
        </Text>
      ) : helperText ? (
        <Text nativeID={ids.descriptionId} style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    minWidth: 0,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.control,
  },
  required: {
    color: Colors.danger,
  },
  disabledLabel: {
    color: Colors.textDisabled,
  },
  helper: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.control,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.control,
  },
});
