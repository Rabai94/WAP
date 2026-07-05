import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable
      style={[styles.button, buttonStyles[variant], style]}
      onPress={onPress}
    >
      <Text style={[styles.text, textStyles[variant], textStyle]}>
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
