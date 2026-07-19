import AppIcon from "@/components/navigation/AppIcon";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
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

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

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
    <View style={[styles.searchField, isCompact && styles.searchFieldCompact]}>
      <AppIcon color={Colors.textMuted} name="search" size={19} />
      <Pressable
        accessibilityLabel={
          searchMode === "jobs"
            ? copy.searchJobsSwitchToCourses
            : copy.searchCoursesSwitchToJobs
        }
        accessibilityRole="button"
        onPress={() =>
          setSearchMode((current) => (current === "jobs" ? "courses" : "jobs"))
        }
        style={[styles.searchModeButton, pointerWebStyle]}
      >
        <Text style={styles.searchModeText}>
          {searchMode === "courses" ? copy.courses : copy.jobs}
        </Text>
        <AppIcon color={Colors.brandDeep} name="chevron-right" size={12} />
      </Pressable>
      <TextInput
        accessibilityLabel={
          searchMode === "courses"
            ? copy.globalCoursesSearch
            : copy.globalJobsSearch
        }
        onChangeText={setSearchText}
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
        <Pressable
          accessibilityLabel={copy.search}
          accessibilityRole="button"
          onPress={submitSearch}
          style={[styles.searchSubmit, pointerWebStyle]}
        >
          <Text style={styles.searchSubmitText}>{copy.search}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, Spacing.md) }]}>
      <View style={styles.primaryRow}>
        {showMenuButton ? (
          <Pressable
            accessibilityLabel={copy.openMenu}
            accessibilityRole="button"
            onPress={onMenuPress}
            style={[styles.iconButton, pointerWebStyle]}
          >
            <AppIcon color={Colors.text} name="menu" size={22} />
          </Pressable>
        ) : null}

        {showSearch && !isCompact ? search : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={copy.notificationsSoon}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.iconButton, styles.iconButtonDisabled]}
          >
            <AppIcon color={Colors.textSubtle} name="bell" size={21} />
          </Pressable>

          <Pressable
            accessibilityLabel={
              hasRealUnreadCount
                ? copy.unreadMessages(unreadMessageCount)
                : copy.messages
            }
            accessibilityRole="button"
            onPress={() => router.push("/messages" as never)}
            style={[styles.iconButton, pointerWebStyle]}
          >
            <AppIcon color={Colors.textSubtle} name="message" size={20} />
            {hasRealUnreadCount ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </Text>
              </View>
            ) : null}
          </Pressable>

          <View style={styles.accountMenuWrap}>
            <Pressable
              accessibilityLabel={copy.openAccount(displayName)}
              accessibilityRole="button"
              accessibilityState={{ expanded: accountMenuOpen }}
              onPress={() => setAccountMenuOpen((current) => !current)}
              style={[styles.userButton, pointerWebStyle]}
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
            </Pressable>

            {accountMenuOpen ? (
              <View accessibilityLabel={copy.accountMenu} style={styles.accountMenu}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setAccountMenuOpen(false);
                    router.push("/profile" as never);
                  }}
                  style={[styles.accountMenuItem, pointerWebStyle]}
                >
                  <AppIcon color={Colors.textSubtle} name="profile" size={18} />
                  <Text style={styles.accountMenuItemText}>{copy.profile}</Text>
                </Pressable>
                <View style={styles.accountMenuDivider} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSigningOut }}
                  disabled={isSigningOut}
                  onPress={() => {
                    void handleLogout();
                  }}
                  style={[
                    styles.accountMenuItem,
                    isSigningOut && styles.accountMenuItemDisabled,
                    pointerWebStyle,
                  ]}
                >
                  <AppIcon color={Colors.danger} name="logout" size={18} />
                  <Text style={styles.accountMenuLogoutText}>
                    {isSigningOut ? copy.loggingOut : copy.logout}
                  </Text>
                </Pressable>
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

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderBottomColor: Colors.borderNeutral,
    borderBottomWidth: 1,
    flexShrink: 0,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.screen,
    zIndex: 100,
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
    minHeight: 42,
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
    minHeight: 28,
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
    minHeight: 30,
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
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
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
    minHeight: 42,
    paddingHorizontal: Spacing.xs,
  },
  accountMenuWrap: {
    position: "relative",
    zIndex: 220,
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
    minHeight: 42,
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
    borderColor: "rgba(20, 92, 255, 0.18)",
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
    borderColor: "rgba(20, 92, 255, 0.18)",
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
});
