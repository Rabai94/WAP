import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={[
        styles.button,
        buttonStyles[variant],
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          textStyles[variant],
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.xxl,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: Colors.brand,
  },

  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.brand,
  },

  dangerButton: {
    backgroundColor: Colors.danger,
  },

  successButton: {
    backgroundColor: Colors.success,
  },

  ghostButton: {
    backgroundColor: "transparent",
    padding: Spacing.xl,
  },

  disabledButton: {
    opacity: 0.6,
  },

  text: {
    fontSize: Typography.button,
    fontWeight: Typography.fontWeight.extraBold,
  },

  primaryText: {
    color: Colors.brandOn,
  },

  secondaryText: {
    color: Colors.brand,
  },

  dangerText: {
    color: Colors.brandOn,
  },

  successText: {
    color: Colors.brandOn,
  },

  ghostText: {
    color: Colors.brand,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },

  disabledText: {
    color: Colors.textMuted,
  },
});

const buttonStyles: Record<ButtonVariant, ViewStyle> = {
  primary: styles.primaryButton,
  secondary: styles.secondaryButton,
  danger: styles.dangerButton,
  success: styles.successButton,
  ghost: styles.ghostButton,
};

const textStyles: Record<ButtonVariant, TextStyle> = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  danger: styles.dangerText,
  success: styles.successText,
  ghost: styles.ghostText,
};
