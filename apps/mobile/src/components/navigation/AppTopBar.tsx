import AppIcon from "@/components/navigation/AppIcon";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  Breakpoints,
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
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
  showUtilityActions?: boolean;
  unreadMessageCount?: number;
};

type SearchMode = "jobs" | "courses";

type AppTopBarCopy = {
  accountFallback: string;
  courses: string;
  globalCoursesSearch: string;
  globalJobsSearch: string;
  jobs: string;
  messages: string;
  openMenu: string;
  openProfile: (displayName: string) => string;
  search: string;
  searchCourse: string;
  searchCoursesSwitchToJobs: string;
  searchJob: string;
  searchJobsSwitchToCourses: string;
  unreadMessages: (count: number) => string;
};

const copyByLanguage = {
  ro: {
    accountFallback: "Cont RabAI",
    courses: "Cursuri",
    globalCoursesSearch: "Căutare globală în cursuri",
    globalJobsSearch: "Căutare globală în joburi",
    jobs: "Joburi",
    messages: "Mesaje",
    openMenu: "Deschide meniul",
    openProfile: (displayName) => `Deschide profilul ${displayName}`,
    search: "Caută",
    searchCourse: "Caută un curs",
    searchCoursesSwitchToJobs: "Caută în cursuri. Schimbă la joburi",
    searchJob: "Caută un job sau o ocupație",
    searchJobsSwitchToCourses: "Caută în joburi. Schimbă la cursuri",
    unreadMessages: (count) => `${count} mesaje necitite`,
  },
  en: {
    accountFallback: "RabAI account",
    courses: "Courses",
    globalCoursesSearch: "Global course search",
    globalJobsSearch: "Global job search",
    jobs: "Jobs",
    messages: "Messages",
    openMenu: "Open menu",
    openProfile: (displayName) => `Open profile for ${displayName}`,
    search: "Search",
    searchCourse: "Search for a course",
    searchCoursesSwitchToJobs: "Search courses. Switch to jobs",
    searchJob: "Search for a job or occupation",
    searchJobsSwitchToCourses: "Search jobs. Switch to courses",
    unreadMessages: (count) =>
      `${count} unread ${count === 1 ? "message" : "messages"}`,
  },
  de: {
    accountFallback: "RabAI-Konto",
    courses: "Kurse",
    globalCoursesSearch: "Globale Kurssuche",
    globalJobsSearch: "Globale Jobsuche",
    jobs: "Jobs",
    messages: "Nachrichten",
    openMenu: "Menü öffnen",
    openProfile: (displayName) => `Profil von ${displayName} öffnen`,
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
  showUtilityActions = true,
  unreadMessageCount,
}: AppTopBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("jobs");
  const [searchFocused, setSearchFocused] = useState(false);
  const effectiveWidth = availableWidth ?? width;
  const isCompact = effectiveWidth < Breakpoints.tablet;
  const showUserName = effectiveWidth >= Breakpoints.mobile;
  const copy = copyByLanguage[language];
  const displayName = user?.fullName?.trim() || copy.accountFallback;
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
          setSearchMode((current) =>
            current === "jobs" ? "courses" : "jobs"
          )
        }
        hoverStyle={styles.controlHover}
        pressedStyle={styles.controlPressed}
        style={styles.searchModeButton}
      >
        <Text style={styles.searchModeText}>
          {searchMode === "courses" ? copy.courses : copy.jobs}
        </Text>
        <AppIcon color={Colors.goldPressed} name="chevron-right" size={14} />
      </InteractivePressable>
      <TextInput
        accessibilityLabel={
          searchMode === "courses"
            ? copy.globalCoursesSearch
            : copy.globalJobsSearch
        }
        onBlur={() => setSearchFocused(false)}
        onChangeText={setSearchText}
        onFocus={() => setSearchFocused(true)}
        onSubmitEditing={submitSearch}
        placeholder={
          searchMode === "courses" ? copy.searchCourse : copy.searchJob
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
    <View
      style={[
        styles.topBar,
        { paddingTop: Math.max(insets.top, Spacing.control) },
      ]}
    >
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
            <AppIcon color={Colors.textPrimary} name="menu" size={22} />
          </InteractivePressable>
        ) : null}

        {showSearch && !isCompact ? search : null}

        {showUtilityActions ? (
          <View style={styles.actions}>
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
              <AppIcon color={Colors.textSecondary} name="message" size={20} />
              {hasRealUnreadCount ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                  </Text>
                </View>
              ) : null}
            </InteractivePressable>

            <InteractivePressable
              accessibilityLabel={copy.openProfile(displayName)}
              accessibilityRole="button"
              hoverStyle={styles.controlHover}
              onPress={() => router.push("/profile" as never)}
              pressedStyle={styles.controlPressed}
              style={styles.userButton}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
              </View>
              {showUserName ? (
                <Text numberOfLines={1} style={styles.userName}>
                  {displayName}
                </Text>
              ) : null}
            </InteractivePressable>
          </View>
        ) : null}
      </View>

      {showSearch && isCompact ? (
        <View style={styles.compactSearchRow}>{search}</View>
      ) : null}
    </View>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("") || "RA";
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
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexShrink: 0,
    paddingBottom: Spacing.control,
    paddingHorizontal: Spacing.component,
  },
  primaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.inline,
    justifyContent: "space-between",
    minHeight: ControlHeight.medium,
  },
  compactSearchRow: {
    marginTop: Spacing.control,
  },
  searchField: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.control,
    maxWidth: 620,
    minHeight: ControlHeight.medium,
    paddingHorizontal: Spacing.inline,
  },
  searchFieldCompact: {
    maxWidth: "100%",
    width: "100%",
  },
  searchInput: {
    color: Colors.textPrimary,
    flex: 1,
    fontSize: Typography.bodySmall,
    minHeight: ControlHeight.minimumTouch,
    minWidth: 0,
    paddingVertical: 0,
  },
  searchModeButton: {
    alignItems: "center",
    borderRadius: Radius.control,
    flexDirection: "row",
    gap: Spacing.compact,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.control,
  },
  searchModeText: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  searchSubmit: {
    alignItems: "center",
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.control,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
  },
  searchSubmitText: {
    color: Colors.onPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: Spacing.control,
    marginLeft: "auto",
  },
  iconButton: {
    alignItems: "center",
    borderColor: Colors.border,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    position: "relative",
    width: ControlHeight.minimumTouch,
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 20,
    minWidth: 20,
    paddingHorizontal: Spacing.compact,
    position: "absolute",
    right: -Spacing.compact,
    top: -Spacing.compact,
  },
  unreadBadgeText: {
    color: Colors.onDanger,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.bold,
  },
  userButton: {
    alignItems: "center",
    borderRadius: Radius.control,
    flexDirection: "row",
    gap: Spacing.control,
    maxWidth: 240,
    minHeight: ControlHeight.minimumTouch,
    minWidth: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.compact,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    color: Colors.goldPressed,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.bold,
  },
  userName: {
    color: Colors.textPrimary,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    maxWidth: 150,
  },
  controlHover: {
    backgroundColor: Colors.surfaceInteractive,
  },
  controlPressed: {
    backgroundColor: Colors.selection,
  },
  primaryControlHover: {
    backgroundColor: Colors.goldHover,
  },
  primaryControlPressed: {
    backgroundColor: Colors.goldPressed,
  },
});
