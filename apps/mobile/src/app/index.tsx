import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { Button, Card, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { languages } from "../i18n/translations";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  ink: "#111827",
  muted: "#5B6472",
  blue: "#2563EB",
  violet: "#6D28D9",
  violetDark: "#35116D",
  red: "#E11D48",
  redSoft: "#FFE8EE",
  blueSoft: "#EAF1FF",
  violetSoft: "#F2EAFE",
  surface: "#FFFFFF",
  page: "#F6F8FC",
  line: "#DCE4F2",
  shadow: "#172033",
} as const;

const navItems = [
  "home.nav.home",
  "home.nav.jobs",
  "home.nav.companies",
  "home.nav.freelancers",
  "home.nav.courses",
  "home.nav.services",
  "home.nav.rabai",
] as const;

const searchTabs = [
  "home.search.jobs",
  "home.search.companies",
  "home.search.freelancers",
  "home.search.courses",
  "home.search.services",
] as const;

const searchFields = [
  {
    label: "home.search.what",
    placeholder: "home.search.whatPlaceholder",
  },
  {
    label: "home.search.location",
    placeholder: "home.search.locationPlaceholder",
  },
  {
    label: "home.search.category",
    placeholder: "home.search.categoryPlaceholder",
  },
] as const;

const rabaiRoles = [
  "home.rabai.roleCareer",
  "home.rabai.roleBusiness",
  "home.rabai.roleFreelancer",
] as const;

const stats = [
  {
    label: "home.stats.jobs",
    value: "12.458",
  },
  {
    label: "home.stats.companies",
    value: "3.287",
  },
  {
    label: "home.stats.freelancers",
    value: "15.672",
  },
  {
    label: "home.stats.courses",
    value: "1.248",
  },
  {
    label: "home.stats.services",
    value: "856",
  },
] as const;

const jobs = [
  {
    title: "home.jobs.logistics.title",
    company: "home.jobs.logistics.company",
    location: "home.jobs.logistics.location",
    salary: "home.jobs.logistics.salary",
    type: "home.jobs.logistics.type",
    match: "92%",
  },
  {
    title: "home.jobs.cleaning.title",
    company: "home.jobs.cleaning.company",
    location: "home.jobs.cleaning.location",
    salary: "home.jobs.cleaning.salary",
    type: "home.jobs.cleaning.type",
    match: "86%",
  },
  {
    title: "home.jobs.warehouse.title",
    company: "home.jobs.warehouse.company",
    location: "home.jobs.warehouse.location",
    salary: "home.jobs.warehouse.salary",
    type: "home.jobs.warehouse.type",
    match: "81%",
  },
] as const;

const coachSteps = [
  "home.coach.stepProgress",
  "home.coach.stepSkills",
  "home.coach.stepApply",
  "home.coach.stepTrack",
] as const;

const courses = [
  "home.courses.logistics",
  "home.courses.german",
  "home.courses.leadership",
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] =
    useState<(typeof searchTabs)[number]>(searchTabs[0]);

  return (
    <Screen centered={false} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              router.push("/" as any);
            }}
          >
            <Text style={styles.logo}>{t("home.logo")}</Text>
          </Pressable>

          <View style={styles.nav}>
            {navItems.map((item) => (
              <Text
                key={item}
                style={[
                  styles.navItem,
                  item === "home.nav.rabai" && styles.navItemAccent,
                ]}
              >
                {t(item)}
              </Text>
            ))}
          </View>

          <View style={styles.headerActions}>
            <Button
              title={t("home.auth.login")}
              variant="ghost"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
              onPress={() => {
                router.push("/login" as any);
              }}
            />
            <Button
              title={t("home.auth.signup")}
              style={styles.signupButton}
              textStyle={styles.signupButtonText}
              onPress={() => {
                router.push("/role" as any);
              }}
            />
          </View>
        </View>

        <View style={styles.languageRow}>
          {languages.map((item) => (
            <Pressable
              key={item.code}
              style={[
                styles.languageButton,
                language === item.code && styles.activeLanguageButton,
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

        <View style={styles.heroGrid}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>{t("home.heroEyebrow")}</Text>
            <Text style={styles.heroTitle}>{t("home.heroTitle")}</Text>
            <Text style={styles.heroSubtitle}>{t("home.heroSubtitle")}</Text>

            <Card style={styles.searchCard}>
              <View style={styles.tabs}>
                {searchTabs.map((tab) => (
                  <Pressable
                    key={tab}
                    style={[
                      styles.tab,
                      activeTab === tab && styles.activeTab,
                    ]}
                    onPress={() => {
                      setActiveTab(tab);
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab && styles.activeTabText,
                      ]}
                    >
                      {t(tab)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.searchFields}>
                {searchFields.map((field) => (
                  <View key={field.label} style={styles.searchField}>
                    <Text style={styles.inputLabel}>{t(field.label)}</Text>
                    <TextInput
                      editable={false}
                      placeholder={t(field.placeholder)}
                      placeholderTextColor={palette.muted}
                      style={styles.input}
                    />
                  </View>
                ))}
                <Button
                  title={t("home.search.button")}
                  style={styles.searchButton}
                  textStyle={styles.searchButtonText}
                />
              </View>
            </Card>
          </View>

          <Card style={styles.rabaiHeroCard}>
            <View style={styles.rabaiHeader}>
              <View>
                <Text style={styles.rabaiLabel}>{t("home.rabai.title")}</Text>
                <Text style={styles.rabaiText}>{t("home.rabai.text")}</Text>
              </View>
              <View style={styles.rabaiSignal} />
            </View>

            <View style={styles.mascotPlaceholder}>
              <Text style={styles.mascotText}>{t("home.rabai.mascot")}</Text>
            </View>

            <View style={styles.rabaiRoles}>
              {rabaiRoles.map((item) => (
                <View key={item} style={styles.rabaiRole}>
                  <Text style={styles.rabaiRoleText}>{t(item)}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <Card key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{t(item.label)}</Text>
            </Card>
          ))}
        </View>
        <Text style={styles.mockNote}>{t("home.stats.note")}</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.jobs.title")}</Text>
          <Text style={styles.sectionKicker}>{t("home.jobs.kicker")}</Text>
        </View>

        <View style={styles.jobsGrid}>
          {jobs.map((job) => (
            <Card key={job.title} style={styles.jobCard}>
              <View style={styles.jobTopRow}>
                <Text style={styles.jobTitle}>{t(job.title)}</Text>
                <Text style={styles.jobMatch}>{job.match}</Text>
              </View>
              <Text style={styles.jobCompany}>{t(job.company)}</Text>
              <View style={styles.jobMetaGrid}>
                <Text style={styles.jobMeta}>{t(job.location)}</Text>
                <Text style={styles.jobMeta}>{t(job.salary)}</Text>
                <Text style={styles.jobMeta}>{t(job.type)}</Text>
              </View>
              <Text style={styles.matchLabel}>
                {t("home.jobs.match")} {job.match}
              </Text>
              <View style={styles.matchTrack}>
                <View style={[styles.matchFill, { width: job.match }]} />
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.coachGrid}>
          <Card style={styles.coachCard}>
            <Text style={styles.rabaiBadge}>{t("home.coach.badge")}</Text>
            <Text style={styles.sectionTitle}>{t("home.coach.title")}</Text>
            <Text style={styles.coachText}>{t("home.coach.text")}</Text>
            <View style={styles.stepsGrid}>
              {coachSteps.map((item, index) => (
                <View key={item} style={styles.step}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                  <Text style={styles.stepText}>{t(item)}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card style={styles.progressCard}>
            <Text style={styles.sectionTitle}>{t("home.progress.title")}</Text>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {t("home.progress.completed")}
              </Text>
              <Text style={styles.metricValue}>
                {t("home.progress.completedValue")}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.progressDetails}>
              <View style={styles.progressPill}>
                <Text style={styles.progressLabel}>
                  {t("home.progress.documents")}
                </Text>
                <Text style={styles.progressValue}>
                  {t("home.progress.documentsValue")}
                </Text>
              </View>
              <View style={styles.progressPill}>
                <Text style={styles.progressLabel}>
                  {t("home.progress.skills")}
                </Text>
                <Text style={styles.progressValue}>
                  {t("home.progress.skillsValue")}
                </Text>
              </View>
              <View style={styles.nextStepPill}>
                <Text style={styles.progressLabel}>
                  {t("home.progress.nextStep")}
                </Text>
                <Text style={styles.progressValue}>
                  {t("home.progress.nextStepValue")}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.courses.title")}</Text>
          <Text style={styles.sectionKicker}>{t("home.courses.kicker")}</Text>
        </View>

        <View style={styles.coursesGrid}>
          {courses.map((course) => (
            <Card key={course} style={styles.courseCard}>
              <Text style={styles.courseTitle}>{t(course)}</Text>
              <Text style={styles.courseMeta}>{t("home.courses.meta")}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1180,
    paddingBottom: 48,
    width: "100%",
  },
  header: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.three,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  logo: {
    color: palette.ink,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
  },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    justifyContent: "center",
  },
  navItem: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  navItemAccent: {
    color: palette.red,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
  },
  loginButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  loginButtonText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
  },
  signupButton: {
    backgroundColor: palette.ink,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  signupButtonText: {
    fontSize: Typography.bodySmall,
  },
  languageRow: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
    marginBottom: Spacing.three,
  },
  languageButton: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  activeLanguageButton: {
    backgroundColor: palette.violet,
    borderColor: palette.violet,
  },
  languageText: {
    color: palette.violet,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  activeLanguageText: {
    color: Colors.white,
  },
  heroGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.five,
    marginBottom: Spacing.five,
  },
  heroCopy: {
    flex: 1.4,
    minWidth: 300,
  },
  heroEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.round,
    color: palette.blue,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  heroTitle: {
    color: palette.ink,
    fontSize: Typography.display,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.display,
    marginBottom: Spacing.three,
  },
  heroSubtitle: {
    color: palette.muted,
    fontSize: Typography.total,
    lineHeight: 28,
    marginBottom: Spacing.five,
    maxWidth: 740,
  },
  searchCard: {
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.none,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.three,
  },
  tab: {
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  activeTab: {
    backgroundColor: palette.violet,
  },
  tabText: {
    color: palette.blue,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  activeTabText: {
    color: Colors.white,
  },
  searchFields: {
    alignItems: "flex-end",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  searchField: {
    flex: 1,
    minWidth: 170,
  },
  inputLabel: {
    color: palette.ink,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: "#F8FAFF",
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.body,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },
  searchButton: {
    backgroundColor: palette.red,
    minWidth: 130,
    paddingHorizontal: Spacing.five,
  },
  searchButtonText: {
    fontSize: Typography.body,
  },
  rabaiHeroCard: {
    backgroundColor: palette.violetDark,
    borderColor: palette.violetDark,
    borderRadius: Radius.xxl,
    flex: 0.8,
    justifyContent: "space-between",
    marginBottom: Spacing.none,
    minHeight: 420,
    minWidth: 290,
    overflow: "hidden",
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 34,
    elevation: 5,
  },
  rabaiHeader: {
    flexDirection: "row",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  rabaiLabel: {
    color: Colors.white,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },
  rabaiText: {
    color: "#E9DFFF",
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    maxWidth: 340,
  },
  rabaiSignal: {
    backgroundColor: palette.red,
    borderRadius: Radius.round,
    height: 18,
    width: 18,
  },
  mascotPlaceholder: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    height: 150,
    justifyContent: "center",
    marginVertical: Spacing.five,
    width: "100%",
  },
  mascotText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  rabaiRoles: {
    gap: Spacing.md,
  },
  rabaiRole: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  rabaiRoleText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginBottom: Spacing.md,
  },
  statCard: {
    borderColor: palette.line,
    flex: 1,
    marginBottom: Spacing.none,
    minWidth: 160,
  },
  statValue: {
    color: palette.ink,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  mockNote: {
    color: palette.muted,
    fontSize: Typography.small,
    marginBottom: Spacing.seven,
  },
  sectionHeader: {
    marginBottom: Spacing.three,
    marginTop: Spacing.five,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },
  sectionKicker: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  jobsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  jobCard: {
    borderColor: palette.line,
    flex: 1,
    marginBottom: Spacing.none,
    minWidth: 280,
  },
  jobTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  jobTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
  },
  jobMatch: {
    backgroundColor: palette.violetSoft,
    borderRadius: Radius.round,
    color: palette.violet,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  jobCompany: {
    color: palette.muted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.three,
    marginTop: Spacing.md,
  },
  jobMetaGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.three,
  },
  jobMeta: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  matchLabel: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  matchTrack: {
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.round,
    height: Spacing.lg,
    overflow: "hidden",
  },
  matchFill: {
    backgroundColor: palette.violet,
    borderRadius: Radius.round,
    height: "100%",
  },
  coachGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
  coachCard: {
    borderColor: palette.line,
    flex: 1.2,
    marginBottom: Spacing.none,
    minWidth: 300,
  },
  rabaiBadge: {
    alignSelf: "flex-start",
    backgroundColor: palette.redSoft,
    borderRadius: Radius.round,
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  coachText: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.three,
  },
  stepsGrid: {
    gap: Spacing.md,
  },
  step: {
    alignItems: "center",
    backgroundColor: "#F8FAFF",
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    padding: Spacing.three,
  },
  stepNumber: {
    backgroundColor: palette.violet,
    borderRadius: Radius.round,
    color: Colors.white,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    height: 26,
    lineHeight: 26,
    textAlign: "center",
    width: 26,
  },
  stepText: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  progressCard: {
    borderColor: palette.line,
    flex: 0.8,
    marginBottom: Spacing.none,
    minWidth: 290,
  },
  metricRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  metricLabel: {
    color: palette.muted,
    fontSize: Typography.body,
  },
  metricValue: {
    color: palette.violet,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
  },
  progressTrack: {
    backgroundColor: palette.violetSoft,
    borderRadius: Radius.round,
    height: Spacing.xl,
    marginBottom: Spacing.three,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: palette.violet,
    borderRadius: Radius.round,
    height: "100%",
    width: "72%",
  },
  progressDetails: {
    gap: Spacing.xl,
  },
  progressPill: {
    backgroundColor: "#F8FAFF",
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  nextStepPill: {
    backgroundColor: palette.redSoft,
    borderColor: "#FFC4D0",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  progressLabel: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  progressValue: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.default,
  },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  courseCard: {
    borderColor: palette.line,
    flex: 1,
    marginBottom: Spacing.none,
    minHeight: 120,
    minWidth: 230,
  },
  courseTitle: {
    color: palette.ink,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xl,
  },
  courseMeta: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
});
