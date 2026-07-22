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
};

export default function SidebarNavItem({
  active = false,
  collapsed,
  disabled = false,
  icon,
  label,
  onPress,
}: SidebarNavItemProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || !onPress;
  const color = isDisabled
    ? Colors.textOnDark
    : active
      ? Colors.goldPrimary
      : Colors.textOnDark;

  return (
    <Pressable
      accessibilityLabel={label}
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
        <Text numberOfLines={1} style={[styles.label, { color }]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: "center",
    borderRadius: Radius.control,
    flexDirection: "row",
    gap: Spacing.inline,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
    position: "relative",
    width: "100%",
  },
  itemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  itemActive: {
    backgroundColor: Colors.shellElevated,
  },
  itemHovered: {
    backgroundColor: Colors.shellSurface,
  },
  itemPressed: {
    backgroundColor: Colors.shellElevated,
  },
  activeMarker: {
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    bottom: Spacing.control,
    left: 0,
    position: "absolute",
    top: Spacing.control,
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
    fontWeight: Typography.fontWeight.semibold,
  },
});
