import {
  forwardRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Opacity,
  Radius,
  Spacing,
  Typography,
} from "@/theme";

export type RabAIButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "danger"
  | "success";

export type RabAIButtonSize = "sm" | "md" | "lg";

export type RabAIButtonProps = Omit<
  PressableProps,
  | "children"
  | "disabled"
  | "onBlur"
  | "onFocus"
  | "onHoverIn"
  | "onHoverOut"
  | "style"
> & {
  title: string;
  variant?: RabAIButtonVariant;
  size?: RabAIButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const RabAIButton = forwardRef<View, RabAIButtonProps>(function RabAIButton(
  {
    accessibilityLabel,
    accessibilityRole = "button",
    accessibilityState,
    disabled = false,
    fullWidth = false,
    iconAfter,
    iconBefore,
    loading = false,
    loadingLabel,
    onPress,
    size = "md",
    style,
    textStyle,
    title,
    variant = "primary",
    ...pressableProps
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const normalizedVariant = variant === "danger" ? "destructive" : variant;
  const isDisabled = disabled || loading || !onPress;
  const foreground = foregroundColors[normalizedVariant];

  return (
    <Pressable
      {...pressableProps}
      ref={ref}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        ...accessibilityState,
        busy: loading || accessibilityState?.busy,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={(event) => {
        if (!isDisabled) {
          onPress?.(event);
        }
      }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[normalizedVariant],
        hovered && hoverStyles[normalizedVariant],
        pressed && styles.pressed,
        focused && InteractionStyles.focusRing,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            accessibilityElementsHidden
            color={foreground}
            size="small"
          />
        ) : (
          iconBefore
        )}
        <Text
          numberOfLines={2}
          style={[
            styles.label,
            sizeTextStyles[size],
            { color: foreground },
            isDisabled && styles.disabledLabel,
            textStyle,
          ]}
        >
          {loading ? loadingLabel ?? title : title}
        </Text>
        {!loading ? iconAfter : null}
      </View>
    </Pressable>
  );
});

export default RabAIButton;
export { RabAIButton };

export function PrimaryButton(props: Omit<RabAIButtonProps, "variant">) {
  return <RabAIButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<RabAIButtonProps, "variant">) {
  return <RabAIButton {...props} variant="secondary" />;
}

export function DisabledButton(
  props: Omit<RabAIButtonProps, "disabled" | "onPress"> & {
    onPress?: RabAIButtonProps["onPress"];
  }
) {
  return <RabAIButton {...props} disabled />;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: Radius.control,
    borderWidth: 1,
    justifyContent: "center",
    maxWidth: "100%",
    ...InteractionStyles.pointer,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.control,
    justifyContent: "center",
    minWidth: 0,
  },
  fullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  pressed: {
    opacity: Opacity.pressed,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    backgroundColor: Colors.surfaceDisabled,
    borderColor: Colors.borderMuted,
    opacity: Opacity.disabled,
  },
  disabledLabel: {
    color: Colors.textDisabled,
  },
  label: {
    flexShrink: 1,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  sm: {
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
  },
  md: {
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.component,
  },
  lg: {
    minHeight: ControlHeight.large,
    paddingHorizontal: Spacing.content,
  },
  textSm: {
    fontSize: Typography.bodySmall,
  },
  textMd: {
    fontSize: Typography.label,
  },
  textLg: {
    fontSize: Typography.body,
  },
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryHover: {
    backgroundColor: Colors.primaryHover,
    borderColor: Colors.primaryHover,
  },
  secondary: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primarySoft,
  },
  secondaryHover: {
    backgroundColor: Colors.selection,
    borderColor: Colors.informationBorder,
  },
  outline: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
  },
  outlineHover: {
    backgroundColor: Colors.surfaceMuted,
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
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  destructiveHover: {
    backgroundColor: Colors.dangerHover,
    borderColor: Colors.dangerHover,
  },
  success: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  successHover: {
    opacity: 0.9,
  },
});

const sizeStyles: Record<RabAIButtonSize, ViewStyle> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const sizeTextStyles: Record<RabAIButtonSize, TextStyle> = {
  sm: styles.textSm,
  md: styles.textMd,
  lg: styles.textLg,
};

type NormalizedVariant = Exclude<RabAIButtonVariant, "danger">;

const variantStyles: Record<NormalizedVariant, ViewStyle> = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  ghost: styles.ghost,
  destructive: styles.destructive,
  success: styles.success,
};

const hoverStyles: Record<NormalizedVariant, ViewStyle> = {
  primary: styles.primaryHover,
  secondary: styles.secondaryHover,
  outline: styles.outlineHover,
  ghost: styles.ghostHover,
  destructive: styles.destructiveHover,
  success: styles.successHover,
};

const foregroundColors: Record<NormalizedVariant, string> = {
  primary: Colors.onPrimary,
  secondary: Colors.primaryPressed,
  outline: Colors.textPrimary,
  ghost: Colors.primaryPressed,
  destructive: Colors.onDanger,
  success: Colors.onSuccess,
};

export type RabAIButtonRef = Ref<View>;
