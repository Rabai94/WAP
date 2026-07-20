import {
  Pressable,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "ghost";

type ButtonProps = {
  accessibilityLabel?: string;
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type WebPressableState = {
  focused?: boolean;
  pressed?: boolean;
};

const focusRingWebStyle = Platform.OS === "web"
  ? ({
      outlineColor: "rgba(20, 92, 255, 0.72)",
      outlineOffset: 3,
      outlineStyle: "solid",
      outlineWidth: 2,
    } as unknown as ViewStyle)
  : null;

export default function Button({
  accessibilityLabel,
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={(state) => {
        const webState = state as WebPressableState;
        return [
          styles.button,
          buttonStyles[variant],
          webState.pressed && styles.pressedButton,
          webState.focused && focusRingWebStyle,
          disabled && styles.disabledButton,
          style,
        ];
      }}
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

export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="secondary" />;
}

export function DisabledButton(props: Omit<ButtonProps, "disabled">) {
  return <Button {...props} disabled />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 148,
    paddingHorizontal: Spacing.three,
    paddingVertical: 0,
  },

  primaryButton: {
    backgroundColor: Colors.brand,
    ...Shadows.button,
  },

  secondaryButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.brand,
    borderWidth: 1,
  },

  dangerButton: {
    backgroundColor: Colors.danger,
  },

  successButton: {
    backgroundColor: Colors.success,
  },

  ghostButton: {
    backgroundColor: "transparent",
    minWidth: 0,
    paddingHorizontal: Spacing.xl,
  },

  disabledButton: {
    backgroundColor: Colors.borderMuted,
    borderColor: Colors.borderNeutral,
    opacity: 1,
  },

  pressedButton: {
    opacity: 0.84,
  },

  text: {
    fontSize: Typography.button,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
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
