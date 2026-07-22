import AppIcon from "@/components/navigation/AppIcon";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Layers,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppTopBarProps = {
  availableWidth?: number;
  onMenuPress?: () => void;
  showSearch?: boolean;
  showMenuButton?: boolean;
  unreadMessageCount?: number;
};

type SearchMode = "jobs" | "courses";

type AppTopBarCopy = {
  accountMenu: string;
  accountFallback: string;
  admin: string;
  administrator: string;
  courses: string;
  globalCoursesSearch: string;
  globalJobsSearch: string;
  jobs: string;
  loggingOut: string;
  logout: string;
  messages: string;
  notificationsSoon: string;
  openAccount: (displayName: string) => string;
  openMenu: string;
  profile: string;
  search: string;
  searchCourse: string;
  searchCoursesSwitchToJobs: string;
  searchJob: string;
  searchJobsSwitchToCourses: string;
  unreadMessages: (count: number) => string;
};

const copyByLanguage = {
  ro: {
    accountMenu: "Meniul contului",
    accountFallback: "Cont RabAI",
    admin: "Admin",
    administrator: "Administrator",
    courses: "Cursuri",
    globalCoursesSearch: "Căutare globală în cursuri",
    globalJobsSearch: "Căutare globală în joburi",
    jobs: "Joburi",
    loggingOut: "Se închide sesiunea…",
    logout: "Logout",
    messages: "Mesaje",
    notificationsSoon: "Notificări — în curând",
    openAccount: (displayName) => `Deschide meniul contului ${displayName}`,
    openMenu: "Deschide meniul",
    profile: "Contul meu",
    search: "Caută",
    searchCourse: "Caută un curs",
    searchCoursesSwitchToJobs: "Caută în cursuri. Schimbă la joburi",
    searchJob: "Caută un job sau o ocupație",
    searchJobsSwitchToCourses: "Caută în joburi. Schimbă la cursuri",
    unreadMessages: (count) => `${count} mesaje necitite`,
  },
  en: {
    accountMenu: "Account menu",
    accountFallback: "RabAI account",
    admin: "Admin",
    administrator: "Administrator",
    courses: "Courses",
    globalCoursesSearch: "Global course search",
    globalJobsSearch: "Global job search",
    jobs: "Jobs",
    loggingOut: "Signing out…",
    logout: "Logout",
    messages: "Messages",
    notificationsSoon: "Notifications — coming soon",
    openAccount: (displayName) => `Open account menu for ${displayName}`,
    openMenu: "Open menu",
    profile: "My account",
    search: "Search",
    searchCourse: "Search for a course",
    searchCoursesSwitchToJobs: "Search courses. Switch to jobs",
    searchJob: "Search for a job or occupation",
    searchJobsSwitchToCourses: "Search jobs. Switch to courses",
    unreadMessages: (count) =>
      `${count} unread ${count === 1 ? "message" : "messages"}`,
  },
  de: {
    accountMenu: "Kontomenü",
    accountFallback: "RabAI-Konto",
    admin: "Admin",
    administrator: "Administrator",
    courses: "Kurse",
    globalCoursesSearch: "Globale Kurssuche",
    globalJobsSearch: "Globale Jobsuche",
    jobs: "Jobs",
    loggingOut: "Abmeldung läuft…",
    logout: "Abmelden",
    messages: "Nachrichten",
    notificationsSoon: "Benachrichtigungen — demnächst",
    openAccount: (displayName) => `Kontomenü von ${displayName} öffnen`,
    openMenu: "Menü öffnen",
    profile: "Mein Konto",
    search: "Suchen",
    searchCourse: "Nach einem Kurs suchen",
    searchCoursesSwitchToJobs: "Kurse durchsuchen. Zu Jobs wechseln",
    searchJob: "Nach einem Job oder Beruf suchen",
    searchJobsSwitchToCourses: "Jobs durchsuchen. Zu Kursen wechseln",
    unreadMessages: (count) =>
      `${count} ungelesene ${count === 1 ? "Nachricht" : "Nachrichten"}`,
  },
} satisfies Record<LanguageCode, AppTopBarCopy>;

export default function AppTopBar({
  availableWidth,
  onMenuPress,
  showSearch = true,
  showMenuButton = false,
  unreadMessageCount,
}: AppTopBarProps) {
  const router = useRouter();
  const { isSigningOut, signOut, user } = useAuth();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("jobs");
  const [searchFocused, setSearchFocused] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const effectiveWidth = availableWidth ?? width;
  const isCompact = effectiveWidth < 720;
  const showUserName = effectiveWidth >= 760;
  const compactAdminBadge = effectiveWidth < 480;
  const copy = copyByLanguage[language];
  const displayName = user?.fullName?.trim() || user?.email || copy.accountFallback;
  const hasRealUnreadCount =
    typeof unreadMessageCount === "number" && unreadMessageCount > 0;

  function submitSearch() {
    const query = searchText.trim();
    const baseRoute = searchMode === "courses" ? "/courses" : "/jobs";
    const route = query
      ? `${baseRoute}?search=${encodeURIComponent(query)}`
      : baseRoute;

    router.push(route as never);
  }

  async function handleLogout() {
    setAccountMenuOpen(false);

    try {
      await signOut();
    } catch (error) {
      console.error("RabAI sign out failed", error);
    }
  }

  const search = (
    <View
      style={[
        styles.searchField,
        isCompact && styles.searchFieldCompact,
        searchFocused && InteractionStyles.focusRing,
      ]}
    >
      <AppIcon color={Colors.textMuted} name="search" size={19} />
      <InteractivePressable
        accessibilityLabel={
          searchMode === "jobs"
            ? copy.searchJobsSwitchToCourses
            : copy.searchCoursesSwitchToJobs
        }
        accessibilityRole="button"
        onPress={() =>
          setSearchMode((current) => (current === "jobs" ? "courses" : "jobs"))
        }
        hoverStyle={styles.controlHover}
        pressedStyle={styles.controlPressed}
        style={styles.searchModeButton}
      >
        <Text style={styles.searchModeText}>
          {searchMode === "courses" ? copy.courses : copy.jobs}
        </Text>
        <AppIcon color={Colors.brandDeep} name="chevron-right" size={12} />
      </InteractivePressable>
      <TextInput
        accessibilityLabel={
          searchMode === "courses"
            ? copy.globalCoursesSearch
            : copy.globalJobsSearch
        }
        onChangeText={setSearchText}
        onBlur={() => setSearchFocused(false)}
        onFocus={() => setSearchFocused(true)}
        onSubmitEditing={submitSearch}
        placeholder={
          searchMode === "courses"
            ? copy.searchCourse
            : copy.searchJob
        }
        placeholderTextColor={Colors.placeholder}
        returnKeyType="search"
        style={styles.searchInput}
        value={searchText}
      />
      {searchText.trim() ? (
        <InteractivePressable
          accessibilityLabel={copy.search}
          accessibilityRole="button"
          hoverStyle={styles.primaryControlHover}
          onPress={submitSearch}
          pressedStyle={styles.primaryControlPressed}
          style={styles.searchSubmit}
        >
          <Text style={styles.searchSubmitText}>{copy.search}</Text>
        </InteractivePressable>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, Spacing.md) }]}>
      <View style={styles.primaryRow}>
        {showMenuButton && onMenuPress ? (
          <InteractivePressable
            accessibilityLabel={copy.openMenu}
            accessibilityRole="button"
            hoverStyle={styles.controlHover}
            onPress={onMenuPress}
            pressedStyle={styles.controlPressed}
            style={styles.iconButton}
          >
            <AppIcon color={Colors.text} name="menu" size={22} />
          </InteractivePressable>
        ) : null}

        {showSearch && !isCompact ? search : null}

        <View style={styles.actions}>
          <InteractivePressable
            accessibilityLabel={copy.notificationsSoon}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.iconButton, styles.iconButtonDisabled]}
          >
            <AppIcon color={Colors.textSubtle} name="bell" size={21} />
          </InteractivePressable>

          <InteractivePressable
            accessibilityLabel={
              hasRealUnreadCount
                ? copy.unreadMessages(unreadMessageCount)
                : copy.messages
            }
            accessibilityRole="button"
            hoverStyle={styles.controlHover}
            onPress={() => router.push("/messages" as never)}
            pressedStyle={styles.controlPressed}
            style={styles.iconButton}
          >
            <AppIcon color={Colors.textSubtle} name="message" size={20} />
            {hasRealUnreadCount ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </Text>
              </View>
            ) : null}
          </InteractivePressable>

          <View style={styles.accountMenuWrap}>
            <InteractivePressable
              accessibilityLabel={copy.openAccount(displayName)}
              accessibilityRole="button"
              accessibilityState={{ expanded: accountMenuOpen }}
              hoverStyle={styles.controlHover}
              onPress={() => setAccountMenuOpen((current) => !current)}
              pressedStyle={styles.controlPressed}
              style={styles.userButton}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
              </View>
              {showUserName ? (
                <View style={styles.userCopy}>
                  <Text numberOfLines={1} style={styles.userName}>
                    {displayName}
                  </Text>
                  {user?.email && user.email !== displayName ? (
                    <Text numberOfLines={1} style={styles.userEmail}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {user?.isAdmin === true ? (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>
                    {compactAdminBadge ? copy.admin : copy.administrator}
                  </Text>
                </View>
              ) : null}
            </InteractivePressable>

            {accountMenuOpen ? (
              <View accessibilityLabel={copy.accountMenu} style={styles.accountMenu}>
                <InteractivePressable
                  accessibilityRole="button"
                  hoverStyle={styles.accountMenuItemHover}
                  onPress={() => {
                    setAccountMenuOpen(false);
                    router.push("/profile" as never);
                  }}
                  pressedStyle={styles.accountMenuItemPressed}
                  style={styles.accountMenuItem}
                >
                  <AppIcon color={Colors.textSubtle} name="profile" size={18} />
                  <Text style={styles.accountMenuItemText}>{copy.profile}</Text>
                </InteractivePressable>
                <View style={styles.accountMenuDivider} />
                <InteractivePressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSigningOut }}
                  disabled={isSigningOut}
                  hoverStyle={styles.accountMenuItemHover}
                  onPress={() => {
                    void handleLogout();
                  }}
                  pressedStyle={styles.accountMenuItemPressed}
                  style={[
                    styles.accountMenuItem,
                    isSigningOut && styles.accountMenuItemDisabled,
                  ]}
                >
                  <AppIcon color={Colors.danger} name="logout" size={18} />
                  <Text style={styles.accountMenuLogoutText}>
                    {isSigningOut ? copy.loggingOut : copy.logout}
                  </Text>
                </InteractivePressable>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {showSearch && isCompact ? (
        <View style={styles.compactSearchRow}>{search}</View>
      ) : null}
    </View>
  );
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "R";
  }

  if (parts.length === 1 && parts[0]?.includes("@")) {
    return parts[0][0]?.toUpperCase() || "R";
  }

  return parts.map((part) => part[0]?.toUpperCase()).join("");
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
  topBar: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomColor: Colors.borderNeutral,
    borderBottomWidth: 1,
    flexShrink: 0,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.screen,
    zIndex: Layers.sticky,
    ...Shadows.card,
  },
  primaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.xl,
    justifyContent: "space-between",
    minHeight: 48,
  },
  compactSearchRow: {
    marginTop: Spacing.md,
  },
  searchField: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    maxWidth: 580,
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.xl,
  },
  searchFieldCompact: {
    maxWidth: "100%",
    width: "100%",
  },
  searchInput: {
    color: Colors.text,
    flex: 1,
    fontSize: Typography.bodySmall,
    minHeight: 40,
    paddingVertical: 0,
  },
  searchModeButton: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.md,
    flexDirection: "row",
    gap: Spacing.xs,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.md,
  },
  searchModeText: {
    color: Colors.brandDeep,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
  },
  searchSubmit: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.md,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.xl,
  },
  searchSubmitText: {
    color: Colors.brandOn,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: Spacing.md,
    marginLeft: "auto",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    position: "relative",
    width: ControlHeight.minimumTouch,
  },
  iconButtonDisabled: {
    opacity: 0.72,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.surface,
    borderRadius: Radius.round,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 18,
    minWidth: 18,
    paddingHorizontal: 3,
    position: "absolute",
    right: -5,
    top: -5,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: Typography.fontWeight.black,
  },
  userButton: {
    alignItems: "center",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.md,
    maxWidth: 340,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.xs,
  },
  accountMenuWrap: {
    position: "relative",
    zIndex: Layers.dropdown,
  },
  accountMenu: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 210,
    padding: Spacing.sm,
    position: "absolute",
    right: 0,
    top: 48,
    ...Shadows.card,
  },
  accountMenuItem: {
    alignItems: "center",
    borderRadius: Radius.md,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.xl,
  },
  accountMenuItemDisabled: {
    opacity: 0.58,
  },
  accountMenuItemText: {
    color: Colors.text,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  accountMenuLogoutText: {
    color: Colors.danger,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  accountMenuDivider: {
    backgroundColor: Colors.borderNeutral,
    height: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.informationBorder,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    color: Colors.brandDeep,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
  },
  userCopy: {
    maxWidth: 142,
    minWidth: 0,
  },
  userName: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  userEmail: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  adminBadge: {
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.informationBorder,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  adminBadgeText: {
    color: Colors.brandDeep,
    fontSize: 9,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  controlHover: {
    backgroundColor: Colors.surfaceInteractive,
    borderColor: Colors.borderStrong,
  },
  controlPressed: {
    backgroundColor: Colors.selection,
  },
  primaryControlHover: {
    backgroundColor: Colors.primaryHover,
  },
  primaryControlPressed: {
    backgroundColor: Colors.primaryPressed,
  },
  accountMenuItemHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  accountMenuItemPressed: {
    backgroundColor: Colors.selection,
  },
});
