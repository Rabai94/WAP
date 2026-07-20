import AppIcon from "@/components/navigation/AppIcon";
import SidebarNavItem from "@/components/navigation/SidebarNavItem";
import {
  getAdminNavigation,
  getMainNavigation,
  getSidebarUtilityCopy,
  isSidebarRouteActive,
} from "@/components/navigation/appNavigation";
import { BRAND_NAME } from "@/domain/brand/brand";
import { useLanguage } from "@/i18n/LanguageProvider";
import { languages, type LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const COLLAPSED_SIDEBAR_WIDTH = 72;
export const EXPANDED_SIDEBAR_WIDTH = 256;

type CollapsibleSidebarProps = {
  collapsed: boolean;
  drawer?: boolean;
  isAdmin: boolean;
  onCollapseToggle: () => void;
  onNavigate?: () => void;
};

type CollapsibleSidebarCopy = {
  brandHome: string;
  closeMenu: string;
  collapseSidebar: string;
  expandSidebar: string;
  language: string;
  navigation: string;
  workspaceSubtitle: string;
};

const copyByLanguage = {
  ro: {
    brandHome: "RabAI — Acasă",
    closeMenu: "Închide meniul",
    collapseSidebar: "Restrânge bara laterală",
    expandSidebar: "Extinde bara laterală",
    language: "Limbă",
    navigation: "Navigație RabAI",
    workspaceSubtitle: "Spațiul tău de lucru",
  },
  en: {
    brandHome: "RabAI — Home",
    closeMenu: "Close menu",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    language: "Language",
    navigation: "RabAI navigation",
    workspaceSubtitle: "Your workspace",
  },
  de: {
    brandHome: "RabAI — Start",
    closeMenu: "Menü schließen",
    collapseSidebar: "Seitenleiste einklappen",
    expandSidebar: "Seitenleiste erweitern",
    language: "Sprache",
    navigation: "RabAI-Navigation",
    workspaceSubtitle: "Dein Arbeitsbereich",
  },
} satisfies Record<LanguageCode, CollapsibleSidebarCopy>;

export default function CollapsibleSidebar({
  collapsed,
  drawer = false,
  isAdmin,
  onCollapseToggle,
  onNavigate,
}: CollapsibleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language, setLanguage } = useLanguage();
  const { isSigningOut, signOut } = useAuth();
  const copy = getSidebarUtilityCopy(language);
  const shellCopy = copyByLanguage[language];
  const isCollapsed = drawer ? false : collapsed;
  const mainItems = getMainNavigation(language);
  const adminItems = getAdminNavigation(language);

  function navigate(route?: string) {
    if (!route) {
      return;
    }

    onNavigate?.();
    router.push(route as never);
  }

  async function handleLogout() {
    onNavigate?.();

    try {
      await signOut();
    } catch (error) {
      console.error("RabAI sign out failed", error);
    }
  }

  return (
    <View
      accessibilityLabel={shellCopy.navigation}
      style={[
        styles.sidebar,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.three),
          paddingTop: Math.max(insets.top, Spacing.three),
          width: drawer
            ? Math.min(
                EXPANDED_SIDEBAR_WIDTH + Spacing.three,
                Math.max(width - Spacing.eight, 0)
              )
            : isCollapsed
              ? COLLAPSED_SIDEBAR_WIDTH
              : EXPANDED_SIDEBAR_WIDTH,
        },
        drawer && styles.sidebarDrawer,
      ]}
    >
      <View style={[styles.brandRow, isCollapsed && styles.brandRowCollapsed]}>
        <InteractivePressable
          accessibilityLabel={shellCopy.brandHome}
          accessibilityRole="button"
          hoverStyle={styles.controlHover}
          onPress={() => navigate("/engine")}
          pressedStyle={styles.controlPressed}
          style={[styles.brandButton, isCollapsed && styles.brandButtonCollapsed]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>R</Text>
          </View>
          {!isCollapsed ? (
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>{BRAND_NAME}</Text>
              <Text numberOfLines={1} style={styles.brandSubtitle}>
                {shellCopy.workspaceSubtitle}
              </Text>
            </View>
          ) : null}
        </InteractivePressable>

        <InteractivePressable
          accessibilityLabel={
            drawer
              ? shellCopy.closeMenu
              : isCollapsed
                ? shellCopy.expandSidebar
                : shellCopy.collapseSidebar
          }
          accessibilityRole="button"
          hoverStyle={styles.controlHover}
          onPress={drawer ? onNavigate ?? onCollapseToggle : onCollapseToggle}
          pressedStyle={styles.controlPressed}
          style={styles.collapseButton}
        >
          <AppIcon
            color={Colors.textSubtle}
            name={drawer ? "close" : isCollapsed ? "chevron-right" : "chevron-left"}
            size={18}
          />
        </InteractivePressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.navigationContent}
        showsVerticalScrollIndicator={false}
        style={styles.navigationScroll}
      >
        <View accessibilityRole="menu" style={styles.navigationGroup}>
          {mainItems.map((item) => (
            <SidebarNavItem
              active={isSidebarRouteActive(pathname, item)}
              collapsed={isCollapsed}
              disabled={item.disabled}
              icon={item.icon}
              key={item.key}
              label={item.label}
              onPress={() => navigate(item.route)}
              soonLabel={item.soon ? copy.soon : undefined}
            />
          ))}
        </View>

        {isAdmin ? (
          <View style={styles.adminSection}>
            {!isCollapsed ? (
              <View style={styles.sectionTitleRow}>
                <AppIcon color={Colors.brandDeep} name="admin" size={16} />
                <Text style={styles.sectionTitle}>{copy.adminSection}</Text>
              </View>
            ) : (
              <View style={styles.collapsedDivider} />
            )}
            <View accessibilityRole="menu" style={styles.navigationGroup}>
              {adminItems.map((item) => (
                <SidebarNavItem
                  collapsed={isCollapsed}
                  disabled
                  icon={item.icon}
                  key={item.key}
                  label={item.label}
                  soonLabel={copy.soon}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.sidebarFooter}>
        {!isCollapsed ? (
          <View accessibilityLabel={shellCopy.language} style={styles.languageSelector}>
            {languages.map((item) => {
              const selected = language === item.code;

              return (
                <InteractivePressable
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hoverStyle={styles.controlHover}
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  pressedStyle={styles.controlPressed}
                  style={[
                    styles.languageButton,
                    selected && styles.languageButtonActive,
                  ]}
                >
                  <Text style={[styles.languageText, selected && styles.languageTextActive]}>
                    {item.code.toUpperCase()}
                  </Text>
                </InteractivePressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.footerDivider} />
        <SidebarNavItem
          active={pathname === "/settings" || pathname.startsWith("/settings/")}
          collapsed={isCollapsed}
          icon="settings"
          label={copy.settings}
          onPress={() => navigate("/settings")}
        />
        <SidebarNavItem
          collapsed={isCollapsed}
          disabled={isSigningOut}
          icon="logout"
          label={copy.logout}
          onPress={() => {
            void handleLogout();
          }}
        />
      </View>
    </View>
  );
}

type InteractivePressableProps = Omit<PressableProps, "style"> & {
  hoverStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

function InteractivePressable({
  disabled,
  hoverStyle,
  onBlur,
  onFocus,
  onHoverIn,
  onHoverOut,
  pressedStyle,
  style,
  ...props
}: InteractivePressableProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={({ pressed }) => [
        style,
        !disabled && InteractionStyles.pointer,
        !disabled && hovered && hoverStyle,
        !disabled && pressed && pressedStyle,
        !disabled && focused && InteractionStyles.focusRing,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRightWidth: 1,
    flexShrink: 0,
    height: "100%",
    paddingHorizontal: Spacing.md,
  },
  sidebarDrawer: {
    borderRadius: 0,
    borderRightWidth: 1,
    ...Shadows.card,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: Spacing.xs,
  },
  brandRowCollapsed: {
    flexDirection: "column",
    gap: Spacing.sm,
    paddingHorizontal: 0,
  },
  brandButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: ControlHeight.minimumTouch,
    minWidth: 0,
  },
  brandButtonCollapsed: {
    flex: 0,
    justifyContent: "center",
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    height: 38,
    justifyContent: "center",
    width: 38,
    ...Shadows.button,
  },
  logoMarkText: {
    color: Colors.brandOn,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  collapseButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexShrink: 0,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    width: ControlHeight.minimumTouch,
  },
  navigationScroll: {
    flex: 1,
    marginTop: Spacing.three,
  },
  navigationContent: {
    paddingBottom: Spacing.three,
  },
  navigationGroup: {
    gap: Spacing.xs,
  },
  adminSection: {
    marginTop: Spacing.screen,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.textSubtle,
    flex: 1,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  collapsedDivider: {
    backgroundColor: Colors.borderNeutral,
    height: 1,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  sidebarFooter: {
    gap: Spacing.xs,
    paddingTop: Spacing.md,
  },
  footerDivider: {
    backgroundColor: Colors.borderNeutral,
    height: 1,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  languageSelector: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    padding: Spacing.xs,
  },
  languageButton: {
    alignItems: "center",
    borderRadius: Radius.md,
    flex: 1,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
  },
  languageButtonActive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  languageText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
  },
  languageTextActive: {
    color: Colors.brandDeep,
  },
  controlHover: {
    backgroundColor: Colors.surfaceInteractive,
    borderColor: Colors.borderStrong,
  },
  controlPressed: {
    backgroundColor: Colors.selection,
  },
});
