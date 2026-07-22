import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type AccessibilityRole,
  type AccessibilityState,
  type ViewStyle,
} from "react-native";
import {
  Colors,
  InteractionStyles,
  Opacity,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";

export type RabAICardVariant =
  | "outlined"
  | "filled"
  | "elevated"
  | "default"
  | "muted"
  | "warning";

export type RabAICardPadding = "none" | "sm" | "md" | "lg";

export type RabAICardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: RabAICardVariant;
  padding?: RabAICardPadding;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function RabAICard({
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  action,
  children,
  description,
  disabled = false,
  interactive = false,
  onPress,
  padding = "md",
  selected = false,
  style,
  testID,
  title,
  variant = "outlined",
}: RabAICardProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const normalizedVariant = normalizeVariant(variant);
  const isInteractive = interactive || Boolean(onPress);
  const isDisabled = disabled || (isInteractive && !onPress);
  const content = (
    <>
      {title || description || action ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          {action ? <View style={styles.action}>{action}</View> : null}
        </View>
      ) : null}
      {children}
    </>
  );
  const cardStyles = [
    styles.base,
    paddingStyles[padding],
    variantStyles[normalizedVariant],
    selected && styles.selected,
    isDisabled && styles.disabled,
    style,
  ];

  if (!isInteractive) {
    return (
      <View style={cardStyles} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        selected: accessibilityState?.selected ?? selected,
      }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles,
        hovered && styles.hovered,
        pressed && styles.pressed,
        focused && InteractionStyles.focusRing,
        InteractionStyles.pointer,
      ]}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

export default function Card(props: RabAICardProps) {
  return (
    <RabAICard
      {...props}
      style={[styles.legacySpacing, props.style]}
      variant={props.variant ?? "outlined"}
    />
  );
}

export function FeatureCard(props: RabAICardProps) {
  return <RabAICard {...props} />;
}

export function SectionCard(props: RabAICardProps) {
  return <RabAICard {...props} />;
}

type NormalizedCardVariant = "outlined" | "filled" | "elevated" | "warning";

function normalizeVariant(variant: RabAICardVariant): NormalizedCardVariant {
  if (variant === "default") {
    return "outlined";
  }

  if (variant === "muted") {
    return "filled";
  }

  return variant;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.panel,
    borderWidth: 1,
    maxWidth: "100%",
    minWidth: 0,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.inline,
  },
  paddingMd: {
    padding: Spacing.component,
  },
  paddingLg: {
    padding: Spacing.section,
  },
  outlined: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  filled: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderMuted,
    ...Shadows.card,
  },
  warning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  selected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  disabled: {
    opacity: Opacity.disabled,
  },
  hovered: {
    borderColor: Colors.borderStrong,
    ...Shadows.card,
  },
  pressed: {
    opacity: Opacity.pressed,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.inline,
    justifyContent: "space-between",
    marginBottom: Spacing.inline,
    minWidth: 0,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.default,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.compact,
  },
  action: {
    flexShrink: 0,
  },
  legacySpacing: {
    marginBottom: Spacing.component,
  },
});

const paddingStyles: Record<RabAICardPadding, ViewStyle> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

const variantStyles: Record<NormalizedCardVariant, ViewStyle> = {
  outlined: styles.outlined,
  filled: styles.filled,
  elevated: styles.elevated,
  warning: styles.warning,
};
