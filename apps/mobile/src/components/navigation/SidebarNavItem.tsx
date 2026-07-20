import AppIcon, { type AppIconName } from "@/components/navigation/AppIcon";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SidebarNavItemProps = {
  active?: boolean;
  collapsed: boolean;
  disabled?: boolean;
  icon: AppIconName;
  label: string;
  onPress?: () => void;
  soonLabel?: string;
};

export default function SidebarNavItem({
  active = false,
  collapsed,
  disabled = false,
  icon,
  label,
  onPress,
  soonLabel,
}: SidebarNavItemProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || !onPress;
  const color = isDisabled
    ? Colors.placeholder
    : active
      ? Colors.brandDeep
      : Colors.textSubtle;

  return (
    <Pressable
      accessibilityLabel={`${label}${soonLabel ? `. ${soonLabel}` : ""}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, selected: active }}
      disabled={isDisabled}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        collapsed && styles.itemCollapsed,
        active && styles.itemActive,
        isDisabled && styles.itemDisabled,
        !isDisabled && InteractionStyles.pointer,
        hovered && !isDisabled && !active && styles.itemHovered,
        pressed && !isDisabled && styles.itemPressed,
        focused && InteractionStyles.focusRing,
      ]}
    >
      {active ? <View style={styles.activeMarker} /> : null}

      <View style={styles.iconWrap}>
        <AppIcon color={color} name={icon} size={20} />
      </View>

      {!collapsed ? (
        <>
          <Text numberOfLines={1} style={[styles.label, { color }]}>
            {label}
          </Text>
          {soonLabel ? (
            <View style={styles.soonBadge}>
              <Text numberOfLines={1} style={styles.soonText}>
                {soonLabel}
              </Text>
            </View>
          ) : null}
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.xl,
    position: "relative",
    width: "100%",
  },
  itemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  itemActive: {
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.informationBorder,
  },
  itemDisabled: {
    opacity: 0.72,
  },
  itemHovered: {
    backgroundColor: Colors.surfaceInteractive,
  },
  itemPressed: {
    backgroundColor: Colors.selection,
  },
  activeMarker: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.round,
    height: 22,
    left: -1,
    position: "absolute",
    width: 3,
  },
  iconWrap: {
    alignItems: "center",
    flexShrink: 0,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  label: {
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  soonBadge: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  soonText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: Typography.fontWeight.extraBold,
    textTransform: "uppercase",
  },
});
