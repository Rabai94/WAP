import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { Screen } from "@/components/ui";
import type { AuthRole } from "@/domain/auth/auth.types";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageCode, languages } from "@/i18n/translations";
import { Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";

type NavKey = "home" | "jobs" | "companies" | "courses" | "freelancers";
type SearchTabKey = "jobs" | "companies" | "courses" | "freelancers";
type EcosystemNodeKey =
  | "student"
  | "courses"
  | "workers"
  | "companies"
  | "freelancers";
type PreviewRole = Exclude<AuthRole, "admin">;

type HomeCopy = {
  nav: Record<NavKey, string>;
  auth: {
    login: string;
    register: string;
    soon: string;
    logout: string;
  };
  hero: {
    title: string;
    titleAccent: string;
    titleEnd: string;
    subtitle: string;
    ecosystem: string;
  };
  nodes: Record<
    EcosystemNodeKey,
    {
      title: string;
      label: string;
    }
  >;
  search: {
    tabs: Record<SearchTabKey, string>;
    what: string;
    whatPlaceholder: string;
    location: string;
    locationPlaceholder: string;
    category: string;
    categoryPlaceholder: string;
    button: string;
  };
  sections: {
    jobsTitle: string;
    coursesTitle: string;
    viewJobs: string;
    viewCourses: string;
    jobsEmpty: string;
    coursesEmpty: string;
  };
  support: {
    unified: string;
    unifiedText: string;
    trusted: string;
    trustedText: string;
    fast: string;
    fastText: string;
    support: string;
    supportText: string;
  };
  preview: {
    adminBarTitle: string;
    adminBarSubtitle: string;
    roleButtonLabel: string;
    roleLabel: Record<PreviewRole, string>;
    roleDescription: Record<PreviewRole, string>;
    roleHighlightsTitle: string;
    roleHighlightsSubtitle: string;
  };
};

const copyByLanguage = {
  ro: {
    nav: {
      home: "Acasă",
      jobs: "Joburi",
      companies: "Firme",
      courses: "Cursuri",
      freelancers: "Freelanceri",
    },
    auth: {
      login: "Login",
      register: "Înregistrează-te",
      soon: "În curând",
      logout: "Logout",
    },
    hero: {
      title: "Motorul tău pentru",
      titleAccent: "viitorul",
      titleEnd: "profesional.",
      subtitle:
        "Caută locuri de muncă, firme, cursuri și freelanceri într-un singur ecosistem profesional.",
      ecosystem: "Ecosistem profesional conectat",
    },
    nodes: {
      student: {
        title: "Student",
        label: "Înveți",
      },
      courses: {
        title: "Cursuri",
        label: "Te dezvolți",
      },
      workers: {
        title: "Muncitori",
        label: "Îți construiești cariera",
      },
      companies: {
        title: "Firme",
        label: "Cresc și inovează",
      },
      freelancers: {
        title: "Freelanceri",
        label: "Lucrezi liber",
      },
    },
    search: {
      tabs: {
        jobs: "Joburi",
        companies: "Firme",
        courses: "Cursuri",
        freelancers: "Freelanceri",
      },
      what: "Ce cauți?",
      whatPlaceholder: "ex: lucrător depozit",
      location: "Locație",
      locationPlaceholder: "ex: München",
      category: "Categorie",
      categoryPlaceholder: "Toate categoriile",
      button: "Caută",
    },
    sections: {
      jobsTitle: "Joburi postate",
      coursesTitle: "Cursuri active",
      viewJobs: "Vezi joburile",
      viewCourses: "Vezi cursurile",
      jobsEmpty: "Momentan nu există joburi publicate.",
      coursesEmpty: "Momentan nu există cursuri active.",
    },
    support: {
      unified: "Totul într-un singur loc",
      unifiedText: "Joburi, firme, cursuri și freelanceri.",
      trusted: "De încredere",
      trustedText: "Profil verificat, anunțuri reale.",
      fast: "Găsește mai rapid",
      fastText: "Caută, filtrează și aplică simplu.",
      support: "Sprijin pentru reușita ta",
      supportText: "Resurse și oportunități utile.",
    },
    preview: {
      adminBarTitle: "Admin activ",
      adminBarSubtitle: "Vezi platforma ca:",
      roleButtonLabel: "Vezi experiența",
      roleLabel: {
        worker: "Muncitor",
        student: "Student",
        business: "Firmă",
        freelancer: "Freelancer",
      },
      roleDescription: {
        worker: "Joburi, carieră și aplicații",
        student: "Profil studențesc, cursuri și oportunități",
        business: "Joburi, candidați și panou companie",
        freelancer: "Servicii independente și proiecte",
      },
      roleHighlightsTitle: "Experiență de previzualizare",
      roleHighlightsSubtitle: "Explorează cum arată platforma pentru fiecare rol.",
    },
  },
  en: {
    nav: {
      home: "Home",
      jobs: "Jobs",
      companies: "Companies",
      courses: "Courses",
      freelancers: "Freelancers",
    },
    auth: {
      login: "Login",
      register: "Register",
      soon: "Coming soon",
      logout: "Logout",
    },
    hero: {
      title: "Your engine for the",
      titleAccent: "professional",
      titleEnd: "future.",
      subtitle:
        "Search jobs, companies, courses and freelancers in one professional ecosystem.",
      ecosystem: "Connected professional ecosystem",
    },
    nodes: {
      student: {
        title: "Student",
        label: "Learn",
      },
      courses: {
        title: "Courses",
        label: "Grow",
      },
      workers: {
        title: "Workers",
        label: "Build your career",
      },
      companies: {
        title: "Companies",
        label: "Grow and innovate",
      },
      freelancers: {
        title: "Freelancers",
        label: "Work freely",
      },
    },
    search: {
      tabs: {
        jobs: "Jobs",
        companies: "Companies",
        courses: "Courses",
        freelancers: "Freelancers",
      },
      what: "What are you looking for?",
      whatPlaceholder: "ex: warehouse worker",
      location: "Location",
      locationPlaceholder: "ex: Munich",
      category: "Category",
      categoryPlaceholder: "All categories",
      button: "Search",
    },
    sections: {
      jobsTitle: "Posted jobs",
      coursesTitle: "Active courses",
      viewJobs: "View jobs",
      viewCourses: "View courses",
      jobsEmpty: "There are no published jobs yet.",
      coursesEmpty: "There are no active courses yet.",
    },
    support: {
      unified: "Everything in one place",
      unifiedText: "Jobs, companies, courses and freelancers.",
      trusted: "Trusted",
      trustedText: "Verified profile, real listings.",
      fast: "Find faster",
      fastText: "Search, filter and apply simply.",
      support: "Support for your success",
      supportText: "Useful resources and opportunities.",
    },
    preview: {
      adminBarTitle: "Admin active",
      adminBarSubtitle: "Preview the platform as:",
      roleButtonLabel: "See experience",
      roleLabel: {
        worker: "Worker",
        student: "Student",
        business: "Company",
        freelancer: "Freelancer",
      },
      roleDescription: {
        worker: "Jobs, career and applications",
        student: "Student profile, courses and opportunities",
        business: "Jobs, candidates and company dashboard",
        freelancer: "Independent services and projects",
      },
      roleHighlightsTitle: "Preview experience",
      roleHighlightsSubtitle: "Explore how the homepage looks for each role.",
    },
  },
  de: {
    nav: {
      home: "Start",
      jobs: "Jobs",
      companies: "Firmen",
      courses: "Kurse",
      freelancers: "Freelancer",
    },
    auth: {
      login: "Login",
      register: "Registrieren",
      soon: "Bald",
      logout: "Logout",
    },
    hero: {
      title: "Dein Motor für die",
      titleAccent: "berufliche",
      titleEnd: "Zukunft.",
      subtitle:
        "Suche Jobs, Firmen, Kurse und Freelancer in einem professionellen Ökosystem.",
      ecosystem: "Verbundenes professionelles Ökosystem",
    },
    nodes: {
      student: {
        title: "Student",
        label: "Lernen",
      },
      courses: {
        title: "Kurse",
        label: "Entwickeln",
      },
      workers: {
        title: "Arbeiter",
        label: "Karriere aufbauen",
      },
      companies: {
        title: "Firmen",
        label: "Wachsen und innovieren",
      },
      freelancers: {
        title: "Freelancer",
        label: "Frei arbeiten",
      },
    },
    search: {
      tabs: {
        jobs: "Jobs",
        companies: "Firmen",
        courses: "Kurse",
        freelancers: "Freelancer",
      },
      what: "Was suchst du?",
      whatPlaceholder: "z. B. Lagerarbeiter",
      location: "Standort",
      locationPlaceholder: "z. B. München",
      category: "Kategorie",
      categoryPlaceholder: "Alle Kategorien",
      button: "Suchen",
    },
    sections: {
      jobsTitle: "Veröffentlichte Jobs",
      coursesTitle: "Aktive Kurse",
      viewJobs: "Jobs ansehen",
      viewCourses: "Kurse ansehen",
      jobsEmpty: "Derzeit sind keine Jobs veröffentlicht.",
      coursesEmpty: "Derzeit sind keine Kurse aktiv.",
    },
    support: {
      unified: "Alles an einem Ort",
      unifiedText: "Jobs, Firmen, Kurse und Freelancer.",
      trusted: "Vertrauen",
      trustedText: "Verifiziertes Profil, echte Anzeigen.",
      fast: "Schneller finden",
      fastText: "Suchen, filtern und einfach bewerben.",
      support: "Unterstützung für deinen Erfolg",
      supportText: "Nützliche Ressourcen und Chancen.",
    },
    preview: {
      adminBarTitle: "Admin aktiv",
      adminBarSubtitle: "Sieh die Plattform als:",
      roleButtonLabel: "Erlebnis ansehen",
      roleLabel: {
        worker: "Arbeiter",
        student: "Student",
        business: "Firma",
        freelancer: "Freelancer",
      },
      roleDescription: {
        worker: "Jobs, Karriere und Bewerbungen",
        student: "Studentenprofil, Kurse und Chancen",
        business: "Jobs, Kandidaten und Firmen-Dashboard",
        freelancer: "Unabhängige Dienste und Projekte",
      },
      roleHighlightsTitle: "Vorschau-Erlebnis",
      roleHighlightsSubtitle: "Erkunde, wie die Startseite für jede Rolle aussieht.",
    },
  },
} satisfies Record<LanguageCode, HomeCopy>;

const navItems: { key: NavKey; enabled: boolean; route?: string }[] = [
  { key: "home", enabled: true, route: "/engine" },
  { key: "jobs", enabled: true, route: "/jobs" },
  { key: "companies", enabled: false },
  { key: "courses", enabled: false },
  { key: "freelancers", enabled: false },
];

const searchTabs: { key: SearchTabKey; enabled: boolean }[] = [
  { key: "jobs", enabled: true },
  { key: "companies", enabled: false },
  { key: "courses", enabled: false },
  { key: "freelancers", enabled: false },
];

const supportItems = [
  { key: "unified", tone: "blue", icon: "01" },
  { key: "trusted", tone: "violet", icon: "02" },
  { key: "fast", tone: "cyan", icon: "03" },
  { key: "support", tone: "rose", icon: "04" },
] as const;

const palette = {
  page: "#F7FAFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F7FF",
  ink: "#0A1028",
  text: "#17213F",
  muted: "#66708A",
  faint: "#8B96B3",
  border: "#DAE3F5",
  borderSoft: "#EEF2FB",
  blue: "#145CFF",
  blueDeep: "#0C2FC7",
  blueSoft: "#E9F0FF",
  violet: "#6E1DFF",
  violetSoft: "#F1E9FF",
  rose: "#F01363",
  roseSoft: "#FFF0F6",
  cyan: "#18C7DF",
  cyanSoft: "#EAFBFF",
  shadow: "#153058",
  disabled: "#EEF2F7",
} as const;

const layout = {
  headerMaxWidth: 1280,
  contentMaxWidth: 1200,
} as const;

const heroCoverImage = require("../../assets/hero/rabai-hero-cover-it.png.png");

type RabaiHomePageProps = {
  authState: "public" | "authenticated";
  user?: {
    email?: string | null;
    fullName?: string | null;
    role?: AuthRole;
    isAdmin?: boolean;
  } | null;
  onLogout?: () => void;
};

export default function RabaiHomePage({
  authState,
  user,
  onLogout,
}: RabaiHomePageProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<SearchTabKey>("jobs");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [previewRole, setPreviewRole] = useState<PreviewRole>("worker");

  const isCompact = width < 860;
  const isPhone = width < 620;
  const copy = copyByLanguage[language];
  const activeSearchEnabled = activeTab === "jobs";
  const isAuthenticated = authState === "authenticated";
  const isAdmin = user?.isAdmin === true;
  const effectivePreviewRole: PreviewRole =
    isAdmin ? previewRole : user?.role && user.role !== "admin" ? user.role : "worker";

  const heroTitle = useMemo(
    () => (
      <>
        {copy.hero.title}{" "}
        <Text style={styles.heroTitleAccent}>{copy.hero.titleAccent}</Text>{" "}
        {copy.hero.titleEnd}
      </>
    ),
    [copy.hero.title, copy.hero.titleAccent, copy.hero.titleEnd]
  );

  const roleHighlights = useMemo(() => {
    switch (effectivePreviewRole) {
      case "worker":
        return [
          {
            title: t("home.preview.worker.jobs.title"),
            text: t("home.preview.worker.jobs.text"),
            route: "/jobs",
            actionLabel: copy.sections.viewJobs,
            accent: palette.blue,
            soft: palette.blueSoft,
          },
          {
            title: t("home.preview.worker.profile.title"),
            text: t("home.preview.worker.profile.text"),
            route: "/worker-dashboard",
            actionLabel: t("home.preview.worker.profile.action"),
            accent: palette.violet,
            soft: palette.violetSoft,
          },
          {
            title: t("home.preview.worker.applications.title"),
            text: t("home.preview.worker.applications.text"),
            route: null,
            actionLabel: copy.auth.soon,
            accent: palette.rose,
            soft: palette.roseSoft,
          },
        ];
      case "student":
        return [
          {
            title: t("home.preview.student.profile.title"),
            text: t("home.preview.student.profile.text"),
            route: "/student-profile",
            actionLabel: t("home.preview.student.profile.action"),
            accent: palette.violet,
            soft: palette.violetSoft,
          },
          {
            title: t("home.preview.student.jobs.title"),
            text: t("home.preview.student.jobs.text"),
            route: "/jobs",
            actionLabel: copy.sections.viewJobs,
            accent: palette.blue,
            soft: palette.blueSoft,
          },
          {
            title: t("home.preview.student.courses.title"),
            text: t("home.preview.student.courses.text"),
            route: null,
            actionLabel: copy.auth.soon,
            accent: palette.cyan,
            soft: palette.cyanSoft,
          },
        ];
      case "business":
        return [
          {
            title: t("home.preview.business.dashboard.title"),
            text: t("home.preview.business.dashboard.text"),
            route: "/business-dashboard",
            actionLabel: t("home.preview.business.dashboard.action"),
            accent: palette.rose,
            soft: palette.roseSoft,
          },
          {
            title: t("home.preview.business.createJob.title"),
            text: t("home.preview.business.createJob.text"),
            route: "/create-job",
            actionLabel: t("home.preview.business.createJob.action"),
            accent: palette.blue,
            soft: palette.blueSoft,
          },
          {
            title: t("home.preview.business.candidates.title"),
            text: t("home.preview.business.candidates.text"),
            route: "/applications",
            actionLabel: t("home.preview.business.candidates.action"),
            accent: palette.violet,
            soft: palette.violetSoft,
          },
        ];
      case "freelancer":
      default:
        return [
          {
            title: t("home.preview.freelancer.services.title"),
            text: t("home.preview.freelancer.services.text"),
            route: null,
            actionLabel: copy.auth.soon,
            accent: palette.violet,
            soft: palette.violetSoft,
          },
          {
            title: t("home.preview.freelancer.contracts.title"),
            text: t("home.preview.freelancer.contracts.text"),
            route: null,
            actionLabel: copy.auth.soon,
            accent: palette.cyan,
            soft: palette.cyanSoft,
          },
          {
            title: t("home.preview.freelancer.jobs.title"),
            text: t("home.preview.freelancer.jobs.text"),
            route: "/jobs",
            actionLabel: copy.sections.viewJobs,
            accent: palette.blue,
            soft: palette.blueSoft,
          },
        ];
    }
  }, [copy.auth.soon, copy.sections.viewJobs, effectivePreviewRole, t]);

  function navigate(route?: string) {
    if (!route) {
      return;
    }

    if (route === "/") {
      router.replace(isAuthenticated ? "/engine" as never : "/" as never);
      return;
    }

    router.push(route as never);
  }

  function submitSearch() {
    if (activeSearchEnabled) {
      router.push("/jobs" as never);
    }
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    router.replace("/login" as never);
  }

  return (
    <Screen centered={false} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isCompact && styles.headerCompact]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              navigate("/engine");
            }}
            style={styles.brand}
          >
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>R</Text>
            </View>
            <Text style={styles.logo}>RabAI</Text>
          </Pressable>

          <View style={[styles.nav, isPhone && styles.navPhone]}>
            {navItems.map((item) => {
              const enabled = item.enabled;
              const active = item.key === "home";

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !enabled, selected: active }}
                  disabled={!enabled}
                  key={item.key}
                  onPress={() => {
                    navigate(item.route);
                  }}
                  style={[
                    styles.navButton,
                    active && styles.navButtonActive,
                    !enabled && styles.navButtonDisabled,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.navText,
                      active && styles.navTextActive,
                      !enabled && styles.disabledText,
                    ]}
                  >
                    {copy.nav[item.key]}
                  </Text>
                  {!enabled ? (
                    <Text numberOfLines={1} style={styles.soonText}>
                      {copy.auth.soon}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.headerActions, isPhone && styles.headerActionsPhone]}>
            <View style={styles.languageSelector}>
              {languages.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: language === item.code }}
                  key={item.code}
                  onPress={() => {
                    setLanguage(item.code);
                  }}
                  style={[
                    styles.languageButton,
                    language === item.code && styles.languageButtonActive,
                  ]}
                >
                  <NationalInsigniaBadge
                    identity={getLanguageNationalIdentity(item.code)}
                    showCode
                    size="sm"
                  />
                </Pressable>
              ))}
            </View>

            {isAuthenticated ? (
              <View style={styles.authSummary}>
                <View style={styles.authSummaryTextWrap}>
                  <Text style={styles.authSummaryName}>
                    {user?.fullName || user?.email || "RabAI account"}
                  </Text>
                  {user?.email ? (
                    <Text style={styles.authSummaryEmail}>{user.email}</Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleLogout}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginText}>{copy.auth.logout}</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    navigate("/login");
                  }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginText}>{copy.auth.login}</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    navigate("/role");
                  }}
                  style={styles.registerButton}
                >
                  <Text style={styles.registerText}>{copy.auth.register}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {isAuthenticated && isAdmin ? (
          <View style={styles.adminBar}>
            <View style={styles.adminBarTextWrap}>
              <Text style={styles.adminBarTitle}>{copy.preview.adminBarTitle}</Text>
              <Text style={styles.adminBarSubtitle}>
                {copy.preview.adminBarSubtitle}
              </Text>
            </View>
            <View style={styles.adminButtonRow}>
              {(["worker", "student", "business", "freelancer"] as PreviewRole[]).map((role) => {
                const active = effectivePreviewRole === role;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    key={role}
                    onPress={() => {
                      setPreviewRole(role);
                    }}
                    style={[styles.adminButton, active && styles.adminButtonActive]}
                  >
                    <Text
                      style={[styles.adminButtonText, active && styles.adminButtonTextActive]}
                      numberOfLines={1}
                    >
                      {copy.preview.roleLabel[role]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <Image
            resizeMode="cover"
            source={heroCoverImage}
            style={styles.heroCoverImage}
          />
          <View style={styles.heroCoverOverlay} />

          <View style={[styles.heroCenter, isCompact && styles.heroCenterCompact]}>
            <Text style={styles.heroEyebrow}>{copy.hero.ecosystem}</Text>
            <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>
              {heroTitle}
            </Text>
            <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>
              {copy.hero.subtitle}
            </Text>
          </View>
        </View>

        {isAuthenticated ? (
          <View style={styles.previewCard}>
            <View style={styles.previewCardHeader}>
              <View>
                <Text style={styles.previewCardTitle}>{copy.preview.roleHighlightsTitle}</Text>
                <Text style={styles.previewCardSubtitle}>
                  {copy.preview.roleHighlightsSubtitle}
                </Text>
              </View>
              <View style={styles.previewBadge}>
                <Text style={styles.previewBadgeText}>{copy.preview.roleLabel[effectivePreviewRole]}</Text>
              </View>
            </View>
            <View style={styles.previewGrid}>
              {roleHighlights.map((item) => (
                <View key={item.title} style={styles.roleCard}>
                  <View style={[styles.roleCardSignal, { backgroundColor: item.soft }]}> 
                    <View style={[styles.roleSignalDot, { backgroundColor: item.accent }]} />
                    <Text numberOfLines={1} style={[styles.roleCardLabel, { color: item.accent }]}>
                      {item.title}
                    </Text>
                  </View>
                  <Text style={styles.roleCardText}>{item.text}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !item.route }}
                    disabled={!item.route}
                    onPress={() => {
                      if (item.route) {
                        navigate(item.route);
                      }
                    }}
                    style={[
                      styles.roleCardButton,
                      { backgroundColor: item.route ? item.accent : palette.disabled },
                    ]}
                  >
                    <Text
                      style={[
                        styles.roleCardButtonText,
                        !item.route && styles.roleCardButtonTextDisabled,
                      ]}
                      numberOfLines={1}
                    >
                      {item.actionLabel}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={[styles.searchCard, isCompact && styles.searchCardCompact]}>
          <View style={styles.tabs}>
            {searchTabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: active,
                    disabled: !tab.enabled,
                  }}
                  disabled={!tab.enabled}
                  key={tab.key}
                  onPress={() => {
                    setActiveTab(tab.key);
                  }}
                  style={[
                    styles.tab,
                    active && styles.tabActive,
                    !tab.enabled && styles.tabDisabled,
                  ]}
                >
                  <Text numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>
                    {copy.search.tabs[tab.key]}
                  </Text>
                  {!tab.enabled ? (
                    <Text numberOfLines={1} style={styles.tabSoon}>
                      {copy.auth.soon}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.searchFields, isCompact && styles.searchFieldsCompact]}>
            <SearchField
              label={copy.search.what}
              onChangeText={setQuery}
              placeholder={copy.search.whatPlaceholder}
              value={query}
            />
            <SearchField
              label={copy.search.location}
              onChangeText={setLocation}
              placeholder={copy.search.locationPlaceholder}
              value={location}
            />
            <SearchField
              label={copy.search.category}
              onChangeText={setCategory}
              placeholder={copy.search.categoryPlaceholder}
              value={category}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !activeSearchEnabled }}
              disabled={!activeSearchEnabled}
              onPress={submitSearch}
              style={[
                styles.searchButton,
                !activeSearchEnabled && styles.searchButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.searchButtonText,
                  !activeSearchEnabled && styles.searchButtonTextDisabled,
                ]}
              >
                {copy.search.button}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.sectionsGrid, isCompact && styles.sectionsGridCompact]}>
          <PublicSectionCard
            actionDisabled={false}
            actionLabel={copy.sections.viewJobs}
            emptyText={copy.sections.jobsEmpty}
            onAction={() => {
              navigate("/jobs");
            }}
            title={copy.sections.jobsTitle}
          />
          <PublicSectionCard
            actionDisabled
            actionLabel={copy.sections.viewCourses}
            disabledLabel={copy.auth.soon}
            emptyText={copy.sections.coursesEmpty}
            title={copy.sections.coursesTitle}
          />
        </View>

        <View style={styles.supportStrip}>
          {supportItems.map((item) => (
            <View key={item.key} style={styles.supportItem}>
              <View
                style={[
                  styles.supportIcon,
                  item.tone === "blue" && styles.supportIconBlue,
                  item.tone === "violet" && styles.supportIconViolet,
                  item.tone === "cyan" && styles.supportIconCyan,
                  item.tone === "rose" && styles.supportIconRose,
                ]}
              >
                <Text style={styles.supportIconText}>{item.icon}</Text>
              </View>
              <View style={styles.supportCopy}>
                <Text style={styles.supportTitle}>{copy.support[item.key]}</Text>
                <Text style={styles.supportText}>{copy.support[`${item.key}Text`]}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function SearchField({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.searchField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function PublicSectionCard({
  actionDisabled,
  actionLabel,
  disabledLabel,
  emptyText,
  onAction,
  title,
}: {
  actionDisabled?: boolean;
  actionLabel: string;
  disabledLabel?: string;
  emptyText: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(actionDisabled) }}
          disabled={actionDisabled}
          onPress={onAction}
          style={styles.sectionAction}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.sectionActionText,
              actionDisabled && styles.disabledText,
            ]}
          >
            {actionLabel}
          </Text>
          {actionDisabled && disabledLabel ? (
            <Text numberOfLines={1} style={styles.sectionSoon}>{disabledLabel}</Text>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.emptyStateLine} />
        <Text style={styles.emptyStateText}>{emptyText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
    padding: 0,
  },
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.five,
    width: "100%",
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    borderColor: palette.borderSoft,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.three,
    justifyContent: "space-between",
    maxWidth: layout.headerMaxWidth,
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.xxl,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    width: "100%",
    elevation: 4,
  },
  headerCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    paddingHorizontal: Spacing.three,
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: palette.blue,
    borderRadius: Radius.md,
    height: 34,
    justifyContent: "center",
    shadowColor: palette.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    width: 34,
    elevation: 3,
  },
  brandMarkText: {
    color: palette.surface,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "center",
  },
  navPhone: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  navButton: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    height: 52,
    justifyContent: "center",
    minWidth: 124,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  navButtonActive: {
    borderBottomColor: palette.blue,
  },
  navButtonDisabled: {
    opacity: 0.74,
  },
  navText: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    textAlign: "center",
  },
  navTextActive: {
    color: palette.ink,
  },
  soonText: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    marginTop: Spacing.xxs,
    textAlign: "center",
  },
  disabledText: {
    color: palette.faint,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  headerActionsPhone: {
    justifyContent: "flex-start",
  },
  languageSelector: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  languageButton: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: Radius.round,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    padding: 0,
    width: 76,
  },
  languageButtonActive: {
    borderColor: palette.blue,
  },
  authSummary: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.borderSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  authSummaryTextWrap: {
    alignItems: "flex-start",
  },
  authSummaryName: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  authSummaryEmail: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  loginText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  registerButton: {
    alignItems: "center",
    backgroundColor: palette.rose,
    borderRadius: Radius.lg,
    minHeight: 42,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  registerText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  hero: {
    alignSelf: "center",
    borderRadius: Radius.xxl,
    height: 360,
    marginTop: Spacing.four,
    maxWidth: layout.contentMaxWidth,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  heroCompact: {
    height: 310,
  },
  heroCoverImage: {
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  heroCoverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4, 12, 34, 0.52)",
  },
  heroCenter: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.eight,
    paddingVertical: Spacing.four,
    zIndex: 1,
  },
  heroCenterCompact: {
    paddingHorizontal: Spacing.three,
  },
  heroEyebrow: {
    color: palette.surfaceSoft,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: palette.surface,
    fontSize: 44,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.6,
    lineHeight: 48,
    maxWidth: 760,
  },
  heroTitlePhone: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroTitleAccent: {
    color: palette.cyan,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.94)",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 28,
    marginTop: Spacing.lg,
    maxWidth: 680,
  },
  heroSubtitlePhone: {
    fontSize: Typography.body,
    lineHeight: 24,
  },
  adminBar: {
    alignSelf: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.lg,
    justifyContent: "space-between",
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.lg,
    width: "100%",
  },
  adminBarTextWrap: {
    flex: 1,
  },
  adminBarTitle: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  adminBarSubtitle: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    marginTop: 4,
  },
  adminButtonRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  adminButton: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.borderSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 132,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  adminButtonActive: {
    backgroundColor: palette.blueSoft,
    borderColor: palette.blue,
  },
  adminButtonText: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  adminButtonTextActive: {
    color: palette.blueDeep,
  },
  previewCard: {
    alignSelf: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    padding: Spacing.four,
    width: "100%",
  },
  previewCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  previewCardTitle: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  previewCardSubtitle: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    marginTop: 4,
  },
  previewBadge: {
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  previewBadgeText: {
    color: palette.blueDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  roleCard: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    flexDirection: "column",
    minHeight: 184,
    padding: Spacing.lg,
  },
  roleCardSignal: {
    alignItems: "center",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.sm,
    minHeight: 38,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  roleSignalDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  roleCardLabel: {
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "left",
  },
  roleCardText: {
    color: palette.text,
    flexGrow: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  roleCardButton: {
    alignItems: "center",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  roleCardButtonText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  roleCardButtonTextDisabled: {
    color: palette.text,
  },
  searchCard: {
    alignSelf: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    padding: Spacing.four,
    width: "100%",
  },
  searchCardCompact: {
    padding: Spacing.three,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tab: {
    alignItems: "center",
    borderColor: palette.borderSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 0,
    flexDirection: "column",
    flexGrow: 1,
    gap: Spacing.xs,
    justifyContent: "center",
    minHeight: 52,
    minWidth: 132,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
  },
  tabActive: {
    backgroundColor: palette.blueSoft,
    borderColor: palette.blue,
  },
  tabDisabled: {
    opacity: 0.64,
  },
  tabText: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  tabTextActive: {
    color: palette.blueDeep,
  },
  tabSoon: {
    color: palette.faint,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  searchFields: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  searchFieldsCompact: {
    flexDirection: "column",
  },
  searchField: {
    flex: 1,
    minWidth: 180,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.borderSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: palette.blue,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 46,
    minWidth: 128,
    paddingHorizontal: Spacing.lg,
  },
  searchButtonDisabled: {
    backgroundColor: palette.disabled,
  },
  searchButtonText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  searchButtonTextDisabled: {
    color: palette.text,
  },
  sectionsGrid: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
  },
  sectionsGridCompact: {
    flexDirection: "column",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
    padding: Spacing.four,
  },
  sectionCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  sectionAction: {
    alignItems: "center",
    borderColor: palette.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 132,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  sectionActionText: {
    color: palette.blue,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  sectionSoon: {
    color: palette.faint,
    fontSize: 10,
    marginTop: 2,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderRadius: Radius.xl,
    marginTop: Spacing.lg,
    minHeight: 124,
    padding: Spacing.lg,
  },
  emptyStateLine: {
    backgroundColor: palette.border,
    borderRadius: 999,
    height: 10,
    marginBottom: Spacing.md,
    width: "100%",
  },
  emptyStateText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
  },
  supportStrip: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
  },
  supportItem: {
    alignItems: "flex-start",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 240,
    padding: Spacing.lg,
  },
  supportIcon: {
    alignItems: "center",
    borderRadius: Radius.round,
    height: 42,
    justifyContent: "center",
    minWidth: 42,
  },
  supportIconBlue: {
    backgroundColor: palette.blueSoft,
  },
  supportIconViolet: {
    backgroundColor: palette.violetSoft,
  },
  supportIconCyan: {
    backgroundColor: palette.cyanSoft,
  },
  supportIconRose: {
    backgroundColor: palette.roseSoft,
  },
  supportIconText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  supportCopy: {
    flex: 1,
  },
  supportTitle: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  supportText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: 4,
  },
});
