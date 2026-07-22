import AppIcon from "@/components/navigation/AppIcon";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { getProviderInitials } from "./CourseProviderPublicSummary";

export type CourseQuickViewHeaderMetaItem = {
  label: string;
  value: string;
};

export type CourseQuickViewHeaderProps = {
  metaItems: readonly CourseQuickViewHeaderMetaItem[];
  onClose: () => void;
  providerName: string;
  title: string;
};

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

type FocusTarget = {
  focus: () => void;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function CourseQuickViewHeader({
  metaItems,
  onClose,
  providerName,
  title,
}: CourseQuickViewHeaderProps) {
  const { width } = useWindowDimensions();
  const closeButtonRef = useRef<View | null>(null);
  const isPhone = width < 640;
  const heroHeight = isPhone ? 132 : 164;
  const initialsSize = isPhone ? 48 : 60;
  const visibleMetaItems = metaItems
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.label && item.value);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const focusTimer = setTimeout(() => {
      focusIfAvailable(closeButtonRef.current);
    }, 0);

    return () => clearTimeout(focusTimer);
  }, []);

  return (
    <View style={styles.header}>
      <View style={[styles.hero, { height: heroHeight }]}>
        <View style={styles.neutralCanvas}>
          <View style={styles.neutralAccentLarge} />
          <View style={styles.neutralAccentSmall} />
        </View>

        <Pressable
          accessibilityLabel="Închide vizualizarea rapidă a cursului"
          accessibilityRole="button"
          hitSlop={4}
          onPress={onClose}
          ref={closeButtonRef}
          style={(state) => {
            const webState = state as WebPressableState;

            return [
              styles.closeButton,
              pointerWebStyle,
              webState.hovered && styles.closeButtonHover,
              webState.focused && styles.closeButtonFocus,
              webState.pressed && styles.closeButtonPressed,
            ];
          }}
          testID="course-quick-view-close"
        >
          <AppIcon color={Colors.white} name="close" size={20} />
        </Pressable>

        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.initialsBadge,
            {
              borderRadius: isPhone ? Radius.lg : Radius.card,
              height: initialsSize,
              width: initialsSize,
            },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              isPhone && styles.initialsTextPhone,
            ]}
          >
            {getProviderInitials(providerName)}
          </Text>
        </View>

        <View
          style={[
            styles.heroCopy,
            {
              paddingLeft:
                initialsSize + (isPhone ? Spacing.four : Spacing.screen),
            },
          ]}
        >
          <Text
            numberOfLines={isPhone ? 3 : 2}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.providerName}>
            {providerName}
          </Text>
        </View>
      </View>

      {visibleMetaItems.length > 0 ? (
        <View style={[styles.metaRow, isPhone && styles.metaRowPhone]}>
          {visibleMetaItems.map((item, index) => (
            <View key={`${item.label}:${index}`} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{item.label}</Text>
              <Text numberOfLines={2} style={styles.metaValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function focusIfAvailable(value: unknown) {
  if (!isFocusTarget(value)) {
    return;
  }

  try {
    value.focus();
  } catch {
    // The modal can close before the deferred focus runs.
  }
}

function isFocusTarget(value: unknown): value is FocusTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof value.focus === "function"
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    maxWidth: "100%",
    minWidth: 0,
  },
  hero: {
    backgroundColor: Colors.shellSurface,
    maxWidth: "100%",
    overflow: "hidden",
    position: "relative",
  },
  neutralCanvas: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    pointerEvents: "none",
  },
  neutralAccentLarge: {
    backgroundColor: Colors.surfaceInverseSubtle,
    borderRadius: Radius.round,
    height: 224,
    position: "absolute",
    right: -72,
    top: -112,
    transform: [{ rotate: "14deg" }],
    width: 296,
  },
  neutralAccentSmall: {
    backgroundColor: Colors.surfaceInverseMuted,
    borderRadius: Radius.round,
    bottom: -64,
    height: 152,
    position: "absolute",
    right: 84,
    width: 152,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: Colors.overlayStrong,
    borderColor: Colors.borderInverseStrong,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: Spacing.three,
    top: Spacing.three,
    width: 44,
    zIndex: 3,
  },
  closeButtonHover: {
    backgroundColor: Colors.shellBackground,
  },
  closeButtonFocus: {
    borderColor: Colors.white,
    borderWidth: 2,
  },
  closeButtonPressed: {
    opacity: 0.82,
  },
  initialsBadge: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.textOnDark,
    borderWidth: 2,
    bottom: Spacing.three,
    justifyContent: "center",
    left: Spacing.three,
    position: "absolute",
    zIndex: 2,
  },
  initialsText: {
    color: Colors.brandDeep,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
  },
  initialsTextPhone: {
    fontSize: Typography.bodySmall,
  },
  heroCopy: {
    bottom: Spacing.three,
    gap: Spacing.sm,
    left: Spacing.three,
    minWidth: 0,
    paddingRight: 72,
    position: "absolute",
    right: 0,
    zIndex: 1,
  },
  title: {
    color: Colors.white,
    flexShrink: 1,
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 34,
  },
  titlePhone: {
    fontSize: Typography.h4,
    lineHeight: 24,
  },
  providerName: {
    color: Colors.textOnDark,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.three,
  },
  metaRowPhone: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  metaItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 1,
    gap: Spacing.xs,
    maxWidth: "100%",
    minWidth: 0,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  metaLabel: {
    color: Colors.textMuted,
    flexShrink: 0,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  metaValue: {
    color: Colors.textBody,
    flexShrink: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
