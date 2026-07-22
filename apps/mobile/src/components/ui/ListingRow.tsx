import { type ReactNode, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  Breakpoints,
  Colors,
  ControlHeight,
  InteractionStyles,
  Opacity,
  Radius,
  Spacing,
  Typography,
} from "@/theme";

export type ListingRowMetaItem = {
  value: string;
  label: string;
  icon?: ReactNode;
};

export type ListingRowProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  description?: string;
  leading?: ReactNode;
  meta?: readonly ListingRowMetaItem[];
  badges?: ReactNode;
  actions?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * A scan-friendly listing primitive. The optional main action is a sibling of
 * `actions`, so callers can pass buttons without creating nested Pressables.
 */
export default function ListingRow({
  accessibilityHint,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  actions,
  badges,
  compact = false,
  description,
  disabled = false,
  eyebrow,
  leading,
  meta = [],
  onPress,
  selected = false,
  style,
  subtitle,
  testID,
  title,
}: ListingRowProps) {
  const { width } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const stacked = width < Breakpoints.tablet;
  const resolvedAccessibilityState: AccessibilityState = {
    disabled,
    ...(accessibilityRole === "radio"
      ? { checked: selected }
      : { selected }),
    ...accessibilityState,
  };
  const mainContent = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        {description ? (
          <Text numberOfLines={compact ? 2 : 3} style={styles.description}>
            {description}
          </Text>
        ) : null}
        {meta.length > 0 ? (
          <View
            accessibilityLabel={formatMetaLabel(meta)}
            accessible
            style={styles.metaRow}
          >
            {meta.map((item, index) => (
              <View key={`${item.label}-${item.value}-${index}`} style={styles.metaItem}>
                {item.icon ? (
                  <View accessibilityElementsHidden style={styles.metaIcon}>
                    {item.icon}
                  </View>
                ) : null}
                <Text style={styles.metaText}>
                  {item.label ? (
                    <Text style={styles.metaLabel}>{item.label}: </Text>
                  ) : null}
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {badges ? <View style={styles.badges}>{badges}</View> : null}
      </View>
    </>
  );

  return (
    <View
      accessibilityState={resolvedAccessibilityState}
      style={[
        styles.row,
        compact && styles.rowCompact,
        stacked && styles.rowStacked,
        selected && styles.rowSelected,
        disabled && styles.rowDisabled,
        style,
      ]}
      testID={testID}
    >
      {onPress ? (
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel ?? title}
          accessibilityRole={accessibilityRole ?? "button"}
          accessibilityState={resolvedAccessibilityState}
          disabled={disabled}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onPress={onPress}
          style={({ pressed }) => [
            styles.main,
            hovered && styles.mainHovered,
            pressed && styles.mainPressed,
            focused && InteractionStyles.focusRing,
            InteractionStyles.pointer,
          ]}
        >
          {mainContent}
        </Pressable>
      ) : (
        <View style={styles.main}>{mainContent}</View>
      )}
      {actions ? (
        <View style={[styles.actions, stacked && styles.actionsStacked]}>
          {actions}
        </View>
      ) : null}
    </View>
  );
}

function formatMetaLabel(meta: readonly ListingRowMetaItem[]) {
  return meta
    .map((item) => (item.label ? `${item.label}: ${item.value}` : item.value))
    .join(", ");
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    alignSelf: "stretch",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    minWidth: 0,
    paddingVertical: Spacing.component,
  },
  rowCompact: {
    paddingVertical: Spacing.inline,
  },
  rowStacked: {
    alignItems: "stretch",
    flexDirection: "column",
    gap: Spacing.control,
  },
  rowSelected: {
    backgroundColor: Colors.goldMuted,
  },
  rowDisabled: {
    opacity: Opacity.disabled,
  },
  main: {
    alignItems: "flex-start",
    borderRadius: Radius.control,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    minHeight: ControlHeight.minimumTouch,
    minWidth: 0,
    padding: Spacing.control,
  },
  mainHovered: {
    backgroundColor: Colors.surfaceMuted,
  },
  mainPressed: {
    backgroundColor: Colors.goldMuted,
    opacity: Opacity.pressed,
  },
  leading: {
    alignItems: "center",
    flexShrink: 0,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: Colors.goldPressed,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.eyebrow,
    lineHeight: Typography.lineHeight.compact,
    marginBottom: Spacing.compact,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.heading,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.compact,
  },
  description: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.control,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
    marginTop: Spacing.control,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.compact,
    minHeight: 24,
  },
  metaIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  metaLabel: {
    color: Colors.textMuted,
    fontWeight: Typography.fontWeight.medium,
  },
  badges: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginTop: Spacing.control,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  actionsStacked: {
    alignSelf: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.control,
    width: "100%",
  },
});
