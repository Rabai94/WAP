import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

export type OrganizationActionButtonVariant =
  | "primary"
  | "secondary"
  | "ghost";

export type OrganizationActionButtonProps = {
  accessibilityHint?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: OrganizationActionButtonVariant;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

const disabledWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "not-allowed" } as unknown as ViewStyle)
    : null;

export default function OrganizationActionButton({
  accessibilityHint,
  disabled = false,
  fullWidth = false,
  label,
  onPress,
  testID,
  variant = "primary",
}: OrganizationActionButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      focusable={!disabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant],
        disabled ? disabledWebStyle : pointerWebStyle,
        fullWidth && styles.fullWidth,
        focused && styles.focused,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.label,
          labelStyles[variant],
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  primary: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderColor: Colors.brand,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  fullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  focused: {
    borderColor: Colors.text,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    backgroundColor: Colors.borderMuted,
    borderColor: Colors.borderNeutral,
    opacity: 1,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.compact,
    textAlign: "center",
  },
  primaryLabel: {
    color: Colors.brandOn,
  },
  secondaryLabel: {
    color: Colors.brand,
  },
  ghostLabel: {
    color: Colors.brand,
  },
  disabledLabel: {
    color: Colors.textMuted,
  },
});

const buttonStyles: Record<OrganizationActionButtonVariant, ViewStyle> = {
  ghost: styles.ghost,
  primary: styles.primary,
  secondary: styles.secondary,
};

const labelStyles: Record<OrganizationActionButtonVariant, TextStyle> = {
  ghost: styles.ghostLabel,
  primary: styles.primaryLabel,
  secondary: styles.secondaryLabel,
};
