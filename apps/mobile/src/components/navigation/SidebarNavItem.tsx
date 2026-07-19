import AppIcon, { type AppIconName } from "@/components/navigation/AppIcon";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

type SidebarNavItemProps = {
  active?: boolean;
  collapsed: boolean;
  disabled?: boolean;
  icon: AppIconName;
  label: string;
  onPress?: () => void;
  soonLabel?: string;
};

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

const disabledWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "not-allowed" } as unknown as ViewStyle)
    : null;

const focusRingWebStyle =
  Platform.OS === "web"
    ? ({
        outlineColor: "rgba(20, 92, 255, 0.55)",
        outlineOffset: 2,
        outlineStyle: "solid",
        outlineWidth: 2,
      } as unknown as ViewStyle)
    : null;

export default function SidebarNavItem({
  active = false,
  collapsed,
  disabled = false,
  icon,
  label,
  onPress,
  soonLabel,
}: SidebarNavItemProps) {
  const color = disabled
    ? Colors.placeholder
    : active
      ? Colors.brandDeep
      : Colors.textSubtle;

  return (
    <Pressable
      accessibilityLabel={`${label}${soonLabel ? `. ${soonLabel}` : ""}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={(state) => {
        const webState = state as WebPressableState;

        return [
          styles.item,
          collapsed && styles.itemCollapsed,
          active && styles.itemActive,
          disabled && styles.itemDisabled,
          disabled ? disabledWebStyle : pointerWebStyle,
          webState.hovered && !disabled && !active && styles.itemHovered,
          webState.pressed && !disabled && styles.itemPressed,
          webState.focused && focusRingWebStyle,
        ];
      }}
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
    minHeight: 44,
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
    borderColor: "rgba(20, 92, 255, 0.13)",
  },
  itemDisabled: {
    opacity: 0.72,
  },
  itemHovered: {
    backgroundColor: "rgba(234, 241, 255, 0.58)",
  },
  itemPressed: {
    opacity: 0.78,
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
