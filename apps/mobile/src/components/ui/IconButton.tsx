import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Layers,
  Opacity,
  Radius,
  Spacing,
  Typography,
} from "@/theme";

type IconButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export type RabAIIconButtonProps = Omit<
  PressableProps,
  "children" | "disabled" | "style"
> & {
  accessibilityLabel: string;
  icon: ReactNode;
  tooltip?: string;
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function RabAIIconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  onPress,
  style,
  tooltip,
  variant = "ghost",
  ...pressableProps
}: RabAIIconButtonProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || !onPress;

  return (
    <View style={styles.wrapper}>
      <Pressable
        {...pressableProps}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          variantStyles[variant],
          hovered && hoverStyles[variant],
          pressed && styles.pressed,
          focused && InteractionStyles.focusRing,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {icon}
      </Pressable>
      {tooltip && hovered ? (
        <View accessibilityElementsHidden style={styles.tooltip}>
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </View>
      ) : null}
    </View>
  );
}

export { RabAIIconButton };

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
    position: "relative",
  },
  button: {
    alignItems: "center",
    borderRadius: Radius.control,
    borderWidth: 1,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    width: ControlHeight.minimumTouch,
    ...InteractionStyles.pointer,
  },
  pressed: {
    opacity: Opacity.pressed,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    backgroundColor: Colors.surfaceDisabled,
    borderColor: Colors.borderMuted,
    opacity: Opacity.disabled,
  },
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryHover: {
    backgroundColor: Colors.primaryHover,
  },
  secondary: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primarySoft,
  },
  secondaryHover: {
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  ghostHover: {
    backgroundColor: Colors.primarySoft,
  },
  destructive: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
  },
  destructiveHover: {
    backgroundColor: Colors.danger,
  },
  tooltip: {
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.sm,
    left: "50%",
    paddingHorizontal: Spacing.control,
    paddingVertical: Spacing.compact,
    position: "absolute",
    top: ControlHeight.minimumTouch + Spacing.compact,
    transform: [{ translateX: -22 }],
    zIndex: Layers.toast,
  },
  tooltipText: {
    color: Colors.white,
    fontSize: Typography.small,
  },
});

const variantStyles: Record<IconButtonVariant, ViewStyle> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  destructive: styles.destructive,
};

const hoverStyles: Record<IconButtonVariant, ViewStyle> = {
  primary: styles.primaryHover,
  secondary: styles.secondaryHover,
  ghost: styles.ghostHover,
  destructive: styles.destructiveHover,
};
