import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import RequireAuth from "@/components/RequireAuth";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import {
  getLanguageNationalIdentity,
  getNationalIdentityByCode,
} from "@/domain/nationality/nationalities";
import { mockStudentProfile } from "@/domain/profile";
import { useLanguage } from "@/i18n/LanguageProvider";
import { languages } from "@/i18n/translations";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F7F9FD",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F6FB",
  ink: "#111827",
  muted: "#5F6B7A",
  subtle: "#8894A6",
  line: "#DDE5F2",
  violet: "#6D28D9",
  violetDark: "#3B167A",
  violetSoft: "#F1EAFE",
  blue: "#2563EB",
  blueSoft: "#EAF1FF",
  red: "#E11D48",
  redSoft: "#FFE7EE",
  green: "#0F9F6E",
  greenSoft: "#E8F8F2",
  amber: "#B7791F",
  amberSoft: "#FFF5DC",
  shadow: "#172033",
} as const;

const sidebarItems = [
  "studentProfile.sidebar.profile",
  "studentProfile.sidebar.dashboard",
  "studentProfile.sidebar.opportunities",
  "studentProfile.sidebar.courses",
  "studentProfile.sidebar.applications",
  "studentProfile.sidebar.cv",
  "studentProfile.sidebar.portfolio",
  "studentProfile.sidebar.documents",
  "studentProfile.sidebar.calendar",
  "studentProfile.sidebar.messages",
  "studentProfile.sidebar.evaluations",
  "studentProfile.sidebar.settings",
] as const;

const profileTabs = [
  "studentProfile.tabs.about",
  "studentProfile.tabs.education",
  "studentProfile.tabs.skills",
  "studentProfile.tabs.experience",
  "studentProfile.tabs.projects",
  "studentProfile.tabs.achievements",
] as const;

const coachSuggestions = [
  "studentProfile.coach.suggestion.portfolio",
  "studentProfile.coach.suggestion.apply",
  "studentProfile.coach.suggestion.github",
  "studentProfile.coach.suggestion.documents",
] as const;

const quickStats = [
  {
    label: "studentProfile.stats.rating",
    value: "4.7",
    tone: "violet",
  },
  {
    label: "studentProfile.stats.applications",
    value: "12",
    tone: "blue",
  },
  {
    label: "studentProfile.stats.responseRate",
    value: "92%",
    tone: "green",
  },
] as const;

const activities = [
  {
    title: "studentProfile.data.activity.volunteer",
    detail: "studentProfile.data.activity.gdsc",
  },
] as const;

export default function StudentProfileScreen() {
  const { t, language, setLanguage } = useLanguage();
  const profile = mockStudentProfile;
  const profileName = `${profile.firstName} ${profile.lastName}`;
  const nationalityIdentity = getNationalIdentityByCode("RO");
  const badges = [
    "studentProfile.badge.student",
    profile.availability.seekingInternship
      ? "studentProfile.badge.seekingInternship"
      : null,
    profile.availability.partTime ? "studentProfile.badge.partTime" : null,
    profile.availability.openToRelocate
      ? "studentProfile.badge.openToRelocate"
      : null,
  ].filter(Boolean) as string[];

  return (
    <RequireAuth requiredRole="student">
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.shell}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarBrand}>
              <Text style={styles.logo}>{t("studentProfile.header.logo")}</Text>
              <Text style={styles.logoAccent}>
                {t("studentProfile.header.rabai")}
              </Text>
            </View>

            <View style={styles.mascotBox}>
              <Text style={styles.mascotText}>
                {t("studentProfile.mascot")}
              </Text>
            </View>

            <View style={styles.sidebarMenu}>
              {sidebarItems.map((item, index) => (
                <Pressable
                  key={item}
                  accessibilityState={{ disabled: true }}
                  style={[
                    styles.sidebarItem,
                    index === 0 && styles.sidebarItemActive,
                  ]}
                >
                  <View
                    style={[
                      styles.sidebarDot,
                      index === 0 && styles.sidebarDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.sidebarItemText,
                      index === 0 && styles.sidebarItemTextActive,
                    ]}
                  >
                    {t(item)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.main}>
            <View style={styles.topBar}>
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>
                  {t("studentProfile.header.logo")}
                </Text>
                <TextInput
                  editable={false}
                  placeholder={t("studentProfile.header.search")}
                  placeholderTextColor={palette.subtle}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.topActions}>
                <View style={styles.languageRow}>
                  {languages.map((item) => (
                    <Pressable
                      key={item.code}
                      style={[
                        styles.languageButton,
                        language === item.code && styles.languageButtonActive,
                      ]}
                      onPress={() => {
                        setLanguage(item.code);
                      }}
                    >
                      <NationalInsigniaBadge
                        identity={getLanguageNationalIdentity(item.code)}
                        showCode
                        size="sm"
                      />
                    </Pressable>
                  ))}
                </View>

                <View style={styles.userPill}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarSmallText}>
                      {t("studentProfile.header.userInitials")}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{profile.firstName}</Text>
                    <Text style={styles.userStatus}>
                      {t("studentProfile.status.student")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroIdentity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {t("studentProfile.header.userInitials")}
                  </Text>
                </View>

                <View style={styles.heroCopy}>
                  <View style={styles.statusRow}>
                    <Text style={styles.rolePill}>
                      {t("studentProfile.status.student")}
                    </Text>
                    <Text style={styles.studentId}>
                      {t("studentProfile.hero.studentId")}: {profile.studentId}
                    </Text>
                  </View>
                  <Text style={styles.profileName}>{profileName}</Text>
                  <View style={styles.contactGrid}>
                    <InfoPill
                      label={t("studentProfile.hero.location")}
                      value={t(profile.location)}
                    />
                    <InfoPill
                      label={t("studentProfile.hero.email")}
                      value={profile.email}
                    />
                    <InfoPill
                      label={t("studentProfile.hero.phone")}
                      value={profile.phone}
                    />
                    {nationalityIdentity ? (
                      <View style={styles.nationalityPill}>
                        <Text style={styles.infoLabel}>Naționalitate</Text>
                        <NationalInsigniaBadge
                          identity={nationalityIdentity}
                          showCode={false}
                          showName
                          size="sm"
                        />
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.badgesRow}>
                    {badges.map((badge) => (
                      <Chip key={badge} label={t(badge)} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.progressPanel}>
                <Text style={styles.progressLabel}>
                  {t("studentProfile.hero.progress")}
                </Text>
                <Text style={styles.progressValue}>
                  {profile.profileCompletion}%
                </Text>
                <ProgressBar progress={profile.profileCompletion} />
                <Pressable
                  accessibilityState={{ disabled: true }}
                  style={styles.progressButton}
                >
                  <Text style={styles.progressButtonText}>
                    {t("studentProfile.hero.completeProgress")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tabs}>
              {profileTabs.map((tab, index) => (
                <View
                  key={tab}
                  style={[styles.tab, index === 0 && styles.tabActive]}
                >
                  <Text
                    style={[styles.tabText, index === 0 && styles.tabTextActive]}
                  >
                    {t(tab)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.dashboardGrid}>
              <View style={styles.leftColumn}>
                <DashboardCard title={t("studentProfile.about.title")}>
                  <Text style={styles.bodyText}>
                    {t(profile.careerIntent.summary)}
                  </Text>
                </DashboardCard>

                <DashboardCard title={t("studentProfile.education.title")}>
                  <View style={styles.educationHeader}>
                    <View>
                      <Text style={styles.cardHeadline}>
                        {t(profile.education.institution)}
                      </Text>
                      <Text style={styles.bodyTextStrong}>
                        {t(profile.education.faculty)}
                      </Text>
                    </View>
                    <Text style={styles.educationBadge}>
                      {t(profile.education.yearLevel)}
                    </Text>
                  </View>
                  <View style={styles.detailGrid}>
                    <DetailRow
                      label={t("studentProfile.education.period")}
                      value={t(profile.education.period)}
                    />
                    <DetailRow
                      label={t("studentProfile.education.grade")}
                      value={profile.education.gradeAverage}
                    />
                    <DetailRow
                      label={t("studentProfile.education.attendance")}
                      value={t(profile.education.attendanceType)}
                    />
                  </View>
                </DashboardCard>

                <DashboardCard title={t("studentProfile.skills.title")}>
                  <View style={styles.skillsGrid}>
                    {profile.skills.map((skill) => (
                      <Chip key={skill} label={t(skill)} tone="blue" />
                    ))}
                  </View>
                </DashboardCard>

                <View style={styles.twoColumnCards}>
                  <DashboardCard
                    style={styles.flexCard}
                    title={t("studentProfile.courses.title")}
                  >
                    {profile.courses.map((course) => (
                      <ProgressItem
                        key={course.title}
                        label={t(course.title)}
                        progress={course.progress}
                      />
                    ))}
                  </DashboardCard>

                  <DashboardCard
                    style={styles.flexCard}
                    title={t("studentProfile.projects.title")}
                  >
                    {profile.projects.map((project) => (
                      <View key={project.title} style={styles.projectBlock}>
                        <Text style={styles.cardHeadline}>
                          {t(project.title)}
                        </Text>
                        <Text style={styles.bodyText}>
                          {t(project.description)}
                        </Text>
                      </View>
                    ))}
                  </DashboardCard>
                </View>

                <DashboardCard title={t("studentProfile.activities.title")}>
                  {activities.map((activity) => (
                    <View key={activity.title} style={styles.activityRow}>
                      <View style={styles.activityMarker} />
                      <View style={styles.activityTextBlock}>
                        <Text style={styles.bodyTextStrong}>
                          {t(activity.title)}
                        </Text>
                        <Text style={styles.bodyText}>{t(activity.detail)}</Text>
                      </View>
                    </View>
                  ))}
                </DashboardCard>
              </View>

              <View style={styles.rightColumn}>
                <DashboardCard title={t("studentProfile.stats.title")}>
                  <View style={styles.statsGrid}>
                    {quickStats.map((stat) => (
                      <View key={stat.label} style={styles.statBox}>
                        <Text
                          style={[
                            styles.statValue,
                            stat.tone === "blue" && styles.statValueBlue,
                            stat.tone === "green" && styles.statValueGreen,
                          ]}
                        >
                          {stat.value}
                        </Text>
                        <Text style={styles.statLabel}>{t(stat.label)}</Text>
                      </View>
                    ))}
                  </View>
                </DashboardCard>

                <DashboardCard title={t("studentProfile.goals.title")}>
                  {profile.goals.map((goal) => (
                    <ProgressItem
                      key={goal.title}
                      label={t(goal.title)}
                      progress={goal.progress}
                      compact
                    />
                  ))}
                </DashboardCard>

                <DashboardCard title={t("studentProfile.documents.title")}>
                  <View style={styles.documentList}>
                    {profile.documentsStatus.map((document) => (
                      <View key={document.title} style={styles.documentRow}>
                        <View style={styles.documentIcon}>
                          <Text style={styles.documentIconText}>
                            {t("studentProfile.documents.icon")}
                          </Text>
                        </View>
                        <View style={styles.documentCopy}>
                          <Text style={styles.documentTitle}>
                            {t(document.title)}
                          </Text>
                          <Text style={styles.documentStatus}>
                            {t(document.status)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </DashboardCard>

                <View style={styles.coachCard}>
                  <Text style={styles.coachEyebrow}>
                    {t("studentProfile.coach.eyebrow")}
                  </Text>
                  <Text style={styles.coachTitle}>
                    {t("studentProfile.coach.title")}
                  </Text>
                  <Text style={styles.coachText}>
                    {t("studentProfile.coach.text")}
                  </Text>

                  <View style={styles.coachSuggestions}>
                    {coachSuggestions.map((suggestion) => (
                      <View key={suggestion} style={styles.coachSuggestion}>
                        <View style={styles.coachSuggestionDot} />
                        <Text style={styles.coachSuggestionText}>
                          {t(suggestion)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    accessibilityState={{ disabled: true }}
                    style={styles.coachButton}
                  >
                    <Text style={styles.coachButtonText}>
                      {t("studentProfile.coach.button")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
          </View>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

type DashboardCardProps = {
  children: ReactNode;
  title: string;
  style?: StyleProp<ViewStyle>;
};

function DashboardCard({ children, title, style }: DashboardCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

type ChipProps = {
  label: string;
  tone?: "violet" | "blue";
};

function Chip({ label, tone = "violet" }: ChipProps) {
  return (
    <View style={[styles.chip, tone === "blue" && styles.chipBlue]}>
      <Text style={[styles.chipText, tone === "blue" && styles.chipTextBlue]}>
        {label}
      </Text>
    </View>
  );
}

type InfoPillProps = {
  label: string;
  value: string;
};

function InfoPill({ label, value }: InfoPillProps) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

type ProgressItemProps = {
  compact?: boolean;
  label: string;
  progress: number;
};

function ProgressItem({ compact = false, label, progress }: ProgressItemProps) {
  return (
    <View style={[styles.progressItem, compact && styles.progressItemCompact]}>
      <View style={styles.progressItemHeader}>
        <Text style={styles.progressItemLabel}>{label}</Text>
        <Text style={styles.progressItemValue}>{progress}%</Text>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
}

type ProgressBarProps = {
  progress: number;
};

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: toProgressWidth(progress) }]} />
    </View>
  );
}

function toProgressWidth(progress: number): `${number}%` {
  return `${Math.min(Math.max(progress, 0), 100)}%` as `${number}%`;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
    flex: 1,
  },
  content: {
    alignSelf: "center",
    padding: Spacing.screen,
    width: "100%",
  },
  shell: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.five,
    maxWidth: 1360,
    width: "100%",
  },
  sidebar: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexBasis: 250,
    flexGrow: 0,
    minWidth: 230,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 3,
  },
  sidebarBrand: {
    borderBottomColor: palette.line,
    borderBottomWidth: 1,
    marginBottom: Spacing.three,
    paddingBottom: Spacing.three,
  },
  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  logoAccent: {
    color: palette.red,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.xs,
  },
  mascotBox: {
    alignItems: "center",
    backgroundColor: palette.violetSoft,
    borderColor: "#E1D2FF",
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: Spacing.three,
    minHeight: 92,
    padding: Spacing.three,
  },
  mascotText: {
    color: palette.violet,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    textAlign: "center",
  },
  sidebarMenu: {
    gap: Spacing.sm,
  },
  sidebarItem: {
    alignItems: "center",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.md,
    minHeight: 40,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  sidebarItemActive: {
    backgroundColor: palette.violetSoft,
  },
  sidebarDot: {
    backgroundColor: palette.line,
    borderRadius: Radius.round,
    height: 8,
    width: 8,
  },
  sidebarDotActive: {
    backgroundColor: palette.violet,
  },
  sidebarItemText: {
    color: palette.muted,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.compact,
  },
  sidebarItemTextActive: {
    color: palette.violet,
    fontWeight: Typography.fontWeight.black,
  },
  main: {
    flex: 1,
    minWidth: 320,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minWidth: 280,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.lg,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  searchIcon: {
    backgroundColor: palette.redSoft,
    borderRadius: Radius.round,
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    overflow: "hidden",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.body,
    minHeight: 30,
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    justifyContent: "flex-end",
  },
  languageRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  languageButton: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  languageButtonActive: {
    backgroundColor: palette.violet,
    borderColor: palette.violet,
  },
  languageText: {
    color: palette.violet,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
  },
  languageTextActive: {
    color: Colors.white,
  },
  userPill: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarSmall: {
    alignItems: "center",
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.round,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarSmallText: {
    color: palette.blue,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
  },
  userName: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  userStatus: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  heroCard: {
    alignItems: "stretch",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.five,
    justifyContent: "space-between",
    marginBottom: Spacing.three,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  heroIdentity: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    minWidth: 280,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: palette.violetDark,
    borderColor: palette.red,
    borderRadius: Radius.xxl,
    borderWidth: 3,
    height: 104,
    justifyContent: "center",
    width: 104,
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  heroCopy: {
    flex: 1,
    minWidth: 220,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  rolePill: {
    backgroundColor: palette.greenSoft,
    borderRadius: Radius.round,
    color: palette.green,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  studentId: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  profileName: {
    color: palette.ink,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 34,
    marginBottom: Spacing.three,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.three,
  },
  infoPill: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 160,
    padding: Spacing.xl,
  },
  nationalityPill: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 180,
    padding: Spacing.xl,
  },
  infoLabel: {
    color: palette.subtle,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  chip: {
    backgroundColor: palette.violetSoft,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  chipBlue: {
    backgroundColor: palette.blueSoft,
  },
  chipText: {
    color: palette.violet,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  chipTextBlue: {
    color: palette.blue,
  },
  progressPanel: {
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xl,
    flexBasis: 260,
    justifyContent: "center",
    minWidth: 240,
    padding: Spacing.three,
  },
  progressLabel: {
    color: "#E9DFFF",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  progressValue: {
    color: Colors.white,
    fontSize: Typography.display,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.display,
    marginBottom: Spacing.xl,
  },
  progressButton: {
    alignItems: "center",
    backgroundColor: palette.red,
    borderRadius: Radius.lg,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },
  progressButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.three,
  },
  tab: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  tabActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  tabText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  tabTextActive: {
    color: Colors.white,
  },
  dashboardGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  leftColumn: {
    flex: 1.35,
    gap: Spacing.three,
    minWidth: 320,
  },
  rightColumn: {
    flex: 0.75,
    gap: Spacing.three,
    minWidth: 300,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 26,
    marginBottom: Spacing.three,
  },
  bodyText: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  bodyTextStrong: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.default,
  },
  cardHeadline: {
    color: palette.ink,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 24,
    marginBottom: Spacing.xs,
  },
  educationHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  educationBadge: {
    backgroundColor: palette.amberSoft,
    borderRadius: Radius.round,
    color: palette.amber,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  detailRow: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: 160,
    padding: Spacing.xl,
  },
  detailLabel: {
    color: palette.subtle,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  twoColumnCards: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  flexCard: {
    flex: 1,
    minWidth: 260,
  },
  progressItem: {
    marginBottom: Spacing.three,
  },
  progressItemCompact: {
    marginBottom: Spacing.xl,
  },
  progressItemHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  progressItemLabel: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.compact,
  },
  progressItemValue: {
    color: palette.violet,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  progressTrack: {
    backgroundColor: "rgba(109, 40, 217, 0.16)",
    borderRadius: Radius.round,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: palette.violet,
    borderRadius: Radius.round,
    height: "100%",
  },
  projectBlock: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  activityRow: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    padding: Spacing.three,
  },
  activityMarker: {
    backgroundColor: palette.red,
    borderRadius: Radius.round,
    height: 12,
    width: 12,
  },
  activityTextBlock: {
    flex: 1,
  },
  statsGrid: {
    gap: Spacing.md,
  },
  statBox: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  statValue: {
    color: palette.violet,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  statValueBlue: {
    color: palette.blue,
  },
  statValueGreen: {
    color: palette.green,
  },
  statLabel: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  documentList: {
    gap: Spacing.md,
  },
  documentRow: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    padding: Spacing.xl,
  },
  documentIcon: {
    alignItems: "center",
    backgroundColor: palette.redSoft,
    borderRadius: Radius.lg,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  documentIconText: {
    color: palette.red,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  documentCopy: {
    flex: 1,
  },
  documentTitle: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.compact,
  },
  documentStatus: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  coachCard: {
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
  },
  coachEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.13)",
    borderRadius: Radius.round,
    color: "#F7ECFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  coachTitle: {
    color: Colors.white,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 30,
    marginBottom: Spacing.xl,
  },
  coachText: {
    color: "#E9DFFF",
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.three,
  },
  coachSuggestions: {
    gap: Spacing.md,
    marginBottom: Spacing.three,
  },
  coachSuggestion: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  coachSuggestionDot: {
    backgroundColor: palette.red,
    borderRadius: Radius.round,
    height: 8,
    width: 8,
  },
  coachSuggestionText: {
    color: Colors.white,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.compact,
  },
  coachButton: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },
  coachButtonText: {
    color: palette.violetDark,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
});
