import AppIcon from "@/components/navigation/AppIcon";
import SidebarNavItem from "@/components/navigation/SidebarNavItem";
import {
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

// Stable shell constraints; content breakpoints remain token-driven.
export const COLLAPSED_SIDEBAR_WIDTH = 72;
export const EXPANDED_SIDEBAR_WIDTH = 240;

type CollapsibleSidebarProps = {
  collapsed: boolean;
  drawer?: boolean;
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
  onCollapseToggle,
  onNavigate,
}: CollapsibleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language, setLanguage } = useLanguage();
  const { isSigningOut, signOut } = useAuth();
  const utilityCopy = getSidebarUtilityCopy(language);
  const shellCopy = copyByLanguage[language];
  const isCollapsed = drawer ? false : collapsed;
  const mainItems = getMainNavigation(language);

  function navigate(route: string) {
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
          paddingBottom: Math.max(insets.bottom, Spacing.component),
          paddingTop: Math.max(insets.top, Spacing.component),
          width: drawer
            ? Math.min(
                EXPANDED_SIDEBAR_WIDTH,
                Math.max(width - Spacing.page, 0)
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
          hoverStyle={styles.inverseControlHover}
          onPress={() => navigate("/engine")}
          pressedStyle={styles.inverseControlPressed}
          style={[
            styles.brandButton,
            isCollapsed && styles.brandButtonCollapsed,
          ]}
        >
          {isCollapsed ? (
            <AppIcon color={Colors.goldPrimary} name="home" size={22} />
          ) : (
            <>
              <View style={styles.brandAccent} />
              <View style={styles.brandCopy}>
                <Text style={styles.brandName}>{BRAND_NAME}</Text>
                <Text numberOfLines={1} style={styles.brandSubtitle}>
                  {shellCopy.workspaceSubtitle}
                </Text>
              </View>
            </>
          )}
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
          hoverStyle={styles.inverseControlHover}
          onPress={drawer ? onNavigate ?? onCollapseToggle : onCollapseToggle}
          pressedStyle={styles.inverseControlPressed}
          style={styles.collapseButton}
        >
          <AppIcon
            color={Colors.textOnDark}
            name={
              drawer
                ? "close"
                : isCollapsed
                  ? "chevron-right"
                  : "chevron-left"
            }
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
              icon={item.icon}
              key={item.key}
              label={item.label}
              onPress={() => navigate(item.route)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.sidebarFooter}>
        {!isCollapsed ? (
          <View
            accessibilityLabel={shellCopy.language}
            style={styles.languageSelector}
          >
            {languages.map((item) => {
              const selected = language === item.code;

              return (
                <InteractivePressable
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  hoverStyle={styles.inverseControlHover}
                  key={item.code}
                  onPress={() => setLanguage(item.code)}
                  pressedStyle={styles.inverseControlPressed}
                  style={[
                    styles.languageButton,
                    selected && styles.languageButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.languageText,
                      selected && styles.languageTextActive,
                    ]}
                  >
                    {item.code.toUpperCase()}
                  </Text>
                </InteractivePressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.footerDivider} />
        <SidebarNavItem
          active={
            pathname === "/settings" || pathname.startsWith("/settings/")
          }
          collapsed={isCollapsed}
          icon="settings"
          label={utilityCopy.settings}
          onPress={() => navigate("/settings")}
        />
        <SidebarNavItem
          collapsed={isCollapsed}
          disabled={isSigningOut}
          icon="logout"
          label={utilityCopy.logout}
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
    backgroundColor: Colors.shellBackground,
    borderColor: Colors.borderStrong,
    borderRightWidth: 1,
    flexShrink: 0,
    height: "100%",
    paddingHorizontal: Spacing.control,
  },
  sidebarDrawer: {
    ...Shadows.elevated,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.control,
    justifyContent: "space-between",
    minHeight: ControlHeight.large,
  },
  brandRowCollapsed: {
    flexDirection: "column",
    gap: Spacing.control,
  },
  brandButton: {
    alignItems: "center",
    borderRadius: Radius.control,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    minHeight: ControlHeight.minimumTouch,
    minWidth: 0,
    paddingHorizontal: Spacing.control,
  },
  brandButtonCollapsed: {
    flex: 0,
    justifyContent: "center",
    paddingHorizontal: 0,
    width: ControlHeight.minimumTouch,
  },
  brandAccent: {
    alignSelf: "stretch",
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    marginVertical: Spacing.control,
    width: Spacing.compact,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    color: Colors.textOnDark,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  brandSubtitle: {
    color: Colors.textOnDark,
    fontSize: Typography.caption,
    marginTop: Spacing.micro,
  },
  collapseButton: {
    alignItems: "center",
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexShrink: 0,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    width: ControlHeight.minimumTouch,
  },
  navigationScroll: {
    flex: 1,
    marginTop: Spacing.section,
  },
  navigationContent: {
    paddingBottom: Spacing.section,
  },
  navigationGroup: {
    gap: Spacing.compact,
  },
  sidebarFooter: {
    gap: Spacing.compact,
    paddingTop: Spacing.control,
  },
  footerDivider: {
    backgroundColor: Colors.borderStrong,
    height: 1,
    marginBottom: Spacing.control,
    marginHorizontal: Spacing.control,
  },
  languageSelector: {
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.compact,
    marginBottom: Spacing.control,
    padding: Spacing.compact,
  },
  languageButton: {
    alignItems: "center",
    borderRadius: Radius.control,
    flex: 1,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
  },
  languageButtonActive: {
    backgroundColor: Colors.shellElevated,
    borderColor: Colors.goldPrimary,
    borderWidth: 1,
  },
  languageText: {
    color: Colors.textOnDark,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  languageTextActive: {
    color: Colors.goldPrimary,
  },
  inverseControlHover: {
    backgroundColor: Colors.shellSurface,
  },
  inverseControlPressed: {
    backgroundColor: Colors.shellElevated,
  },
});
