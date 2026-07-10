import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { useAuth } from "@/providers/AuthProvider";
import { Radius, Spacing, Typography } from "@/theme";
import { Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { LanguageCode, languages } from "../i18n/translations";

type NavKey = "home" | "jobs" | "companies" | "courses" | "freelancers";
type SearchTabKey = "jobs" | "companies" | "courses" | "freelancers";
type EcosystemNodeKey =
  | "student"
  | "courses"
  | "workers"
  | "companies"
  | "freelancers";

type HomeCopy = {
  nav: Record<NavKey, string>;
  auth: {
    login: string;
    register: string;
    soon: string;
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
      soon: "Soon",
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
      jobsEmpty: "Momentan gibt es keine veröffentlichten Jobs.",
      coursesEmpty: "Momentan gibt es keine aktiven Kurse.",
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
  },
} satisfies Record<LanguageCode, HomeCopy>;

const navItems: {
  key: NavKey;
  enabled: boolean;
  route?: string;
}[] = [
  { key: "home", enabled: true, route: "/" },
  { key: "jobs", enabled: true, route: "/jobs" },
  { key: "companies", enabled: false },
  { key: "courses", enabled: false },
  { key: "freelancers", enabled: false },
];

const searchTabs: {
  key: SearchTabKey;
  enabled: boolean;
}[] = [
  { key: "jobs", enabled: true },
  { key: "companies", enabled: false },
  { key: "courses", enabled: false },
  { key: "freelancers", enabled: false },
];

const nodeOrder: EcosystemNodeKey[] = [
  "student",
  "workers",
  "courses",
  "companies",
  "freelancers",
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

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { loading: authLoading, session } = useAuth();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<SearchTabKey>("jobs");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const isCompact = width < 860;
  const isPhone = width < 620;
  const copy = copyByLanguage[language];
  const activeSearchEnabled = activeTab === "jobs";

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

  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/engine" as never);
    }
  }, [authLoading, router, session]);

  function navigate(route?: string) {
    if (!route) {
      return;
    }

    if (route === "/") {
      router.replace(route as never);
      return;
    }

    router.push(route as never);
  }

  function submitSearch() {
    if (activeSearchEnabled) {
      router.push("/jobs" as never);
    }
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
              navigate("/");
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
                    style={[
                      styles.navText,
                      active && styles.navTextActive,
                      !enabled && styles.disabledText,
                    ]}
                  >
                    {copy.nav[item.key]}
                  </Text>
                  {!enabled ? (
                    <Text style={styles.soonText}>{copy.auth.soon}</Text>
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
          </View>
        </View>

        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <View style={styles.heroRingOuter} />
          <View style={styles.heroRingInner} />
          <View style={styles.heroRailBlue} />
          <View style={styles.heroRailRose} />

          <View style={[styles.heroCenter, isCompact && styles.heroCenterCompact]}>
            <Text style={styles.heroEyebrow}>{copy.hero.ecosystem}</Text>
            <Text style={[styles.heroTitle, isPhone && styles.heroTitlePhone]}>
              {heroTitle}
            </Text>
            <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>
              {copy.hero.subtitle}
            </Text>

            <View style={styles.infinityWrap}>
              <View style={[styles.infinityLoop, styles.infinityLeft]} />
              <View style={[styles.infinityLoop, styles.infinityRight]} />
            </View>
          </View>

          <View style={isCompact ? styles.nodeGrid : styles.nodeLayer}>
            {nodeOrder.map((key) => (
              <EcosystemNode
                compact={isCompact}
                key={key}
                label={copy.nodes[key].label}
                nodeKey={key}
                style={!isCompact ? nodePositionStyles[key] : undefined}
                title={copy.nodes[key].title}
              />
            ))}
          </View>
        </View>

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
                  <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                    {getTabIcon(tab.key)}
                  </Text>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {copy.search.tabs[tab.key]}
                  </Text>
                  {!tab.enabled ? (
                    <Text style={styles.tabSoon}>{copy.auth.soon}</Text>
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
            icon="J"
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
            icon="C"
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
                <Text style={styles.supportText}>
                  {copy.support[`${item.key}Text`]}
                </Text>
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

function EcosystemNode({
  compact,
  label,
  nodeKey,
  style,
  title,
}: {
  compact: boolean;
  label: string;
  nodeKey: EcosystemNodeKey;
  style?: StyleProp<ViewStyle>;
  title: string;
}) {
  return (
    <View style={[styles.ecosystemNode, compact && styles.ecosystemNodeCompact, style]}>
      <View style={[styles.nodePlatform, nodeToneStyles[nodeKey]]}>
        <View style={styles.nodeIconBase}>
          <Text style={styles.nodeIcon}>{getNodeIcon(nodeKey)}</Text>
        </View>
      </View>
      <View style={styles.nodeTextWrap}>
        <Text style={styles.nodeTitle}>{title}</Text>
        <Text style={styles.nodeLabel}>{label}</Text>
      </View>
    </View>
  );
}

function PublicSectionCard({
  actionDisabled,
  actionLabel,
  disabledLabel,
  emptyText,
  icon,
  onAction,
  title,
}: {
  actionDisabled?: boolean;
  actionLabel: string;
  disabledLabel?: string;
  emptyText: string;
  icon: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionIconText}>{icon}</Text>
          </View>
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
            style={[
              styles.sectionActionText,
              actionDisabled && styles.disabledText,
            ]}
          >
            {actionLabel}
          </Text>
          {actionDisabled && disabledLabel ? (
            <Text style={styles.sectionSoon}>{disabledLabel}</Text>
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

function getNodeIcon(key: EcosystemNodeKey) {
  switch (key) {
    case "student":
      return "ST";
    case "courses":
      return "CR";
    case "workers":
      return "WK";
    case "companies":
      return "FM";
    case "freelancers":
      return "FR";
    default:
      return "RB";
  }
}

function getTabIcon(key: SearchTabKey) {
  switch (key) {
    case "jobs":
      return "J";
    case "companies":
      return "F";
    case "courses":
      return "C";
    case "freelancers":
      return "P";
    default:
      return "R";
  }
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
    minHeight: 38,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    borderColor: "transparent",
    borderRadius: Radius.round,
    borderWidth: 2,
    padding: 1,
  },
  languageButtonActive: {
    borderColor: palette.blue,
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
    shadowColor: palette.violet,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    justifyContent: "center",
    elevation: 4,
  },
  registerText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  hero: {
    alignSelf: "center",
    backgroundColor: "#EEF4FF",
    borderBottomColor: "#DEE8FF",
    borderBottomWidth: 1,
    minHeight: 590,
    overflow: "hidden",
    paddingHorizontal: Spacing.screen,
    paddingTop: 44,
    position: "relative",
    width: "100%",
  },
  heroCompact: {
    minHeight: 0,
    paddingBottom: Spacing.five,
  },
  heroGlowTop: {
    backgroundColor: "rgba(64, 107, 255, 0.26)",
    borderRadius: 300,
    height: 430,
    left: -110,
    position: "absolute",
    top: 10,
    width: 430,
  },
  heroGlowBottom: {
    backgroundColor: "rgba(136, 28, 255, 0.22)",
    borderRadius: 360,
    bottom: -180,
    height: 480,
    position: "absolute",
    right: -100,
    width: 500,
  },
  heroRingOuter: {
    alignSelf: "center",
    borderColor: "rgba(26, 111, 255, 0.42)",
    borderRadius: 620,
    borderWidth: 3,
    height: 390,
    position: "absolute",
    top: 134,
    transform: [{ rotate: "-7deg" }],
    width: 1220,
  },
  heroRingInner: {
    alignSelf: "center",
    borderColor: "rgba(239, 19, 99, 0.34)",
    borderRadius: 520,
    borderWidth: 3,
    height: 286,
    position: "absolute",
    top: 188,
    transform: [{ rotate: "7deg" }],
    width: 990,
  },
  heroRailBlue: {
    alignSelf: "center",
    backgroundColor: "rgba(24, 199, 223, 0.58)",
    borderRadius: Radius.round,
    height: 4,
    position: "absolute",
    top: 326,
    transform: [{ rotate: "-10deg" }],
    width: 920,
  },
  heroRailRose: {
    alignSelf: "center",
    backgroundColor: "rgba(239, 19, 99, 0.42)",
    borderRadius: Radius.round,
    height: 4,
    position: "absolute",
    top: 374,
    transform: [{ rotate: "8deg" }],
    width: 920,
  },
  heroCenter: {
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 760,
    paddingTop: Spacing.three,
    zIndex: 2,
  },
  heroCenterCompact: {
    paddingTop: Spacing.none,
  },
  heroEyebrow: {
    color: palette.blueDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
    marginBottom: Spacing.md,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: palette.ink,
    fontSize: 58,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
    lineHeight: 62,
    marginBottom: Spacing.three,
    textAlign: "center",
  },
  heroTitlePhone: {
    fontSize: Typography.h1,
    lineHeight: 38,
  },
  heroTitleAccent: {
    color: palette.blue,
  },
  heroSubtitle: {
    color: palette.muted,
    fontSize: 19,
    lineHeight: 29,
    maxWidth: 660,
    textAlign: "center",
  },
  heroSubtitlePhone: {
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  infinityWrap: {
    height: 88,
    marginTop: Spacing.five,
    position: "relative",
    width: 182,
  },
  infinityLoop: {
    borderRadius: 66,
    borderWidth: 11,
    height: 76,
    position: "absolute",
    top: 5,
    transform: [{ rotate: "32deg" }],
    width: 106,
  },
  infinityLeft: {
    borderColor: "rgba(20, 92, 255, 0.38)",
    left: 0,
  },
  infinityRight: {
    borderColor: "rgba(240, 19, 99, 0.32)",
    right: 0,
    transform: [{ rotate: "-32deg" }],
  },
  nodeLayer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 3,
  },
  nodeGrid: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "center",
    marginTop: Spacing.three,
    maxWidth: 760,
    zIndex: 3,
  },
  ecosystemNode: {
    alignItems: "center",
    gap: Spacing.md,
    position: "absolute",
    width: 176,
  },
  ecosystemNodeCompact: {
    position: "relative",
  },
  nodePlatform: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.78)",
    borderRadius: Radius.round,
    borderWidth: 2,
    height: 108,
    justifyContent: "center",
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    width: 154,
    elevation: 4,
  },
  nodeIconBase: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 74,
  },
  nodeIcon: {
    color: palette.ink,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  nodeTextWrap: {
    alignItems: "center",
  },
  nodeTitle: {
    color: palette.ink,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
    textAlign: "center",
  },
  nodeLabel: {
    color: palette.blueDeep,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
    marginTop: Spacing.xxs,
    textAlign: "center",
    textTransform: "uppercase",
  },
  searchCard: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: palette.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginTop: -112,
    maxWidth: layout.contentMaxWidth,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.13,
    shadowRadius: 38,
    width: "90%",
    zIndex: 5,
    elevation: 6,
  },
  searchCardCompact: {
    marginTop: Spacing.three,
    width: "92%",
  },
  tabs: {
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-around",
    marginBottom: Spacing.four,
    paddingBottom: Spacing.xl,
  },
  tab: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.xl,
  },
  tabActive: {
    borderBottomColor: palette.blue,
  },
  tabDisabled: {
    opacity: 0.68,
  },
  tabIcon: {
    color: palette.muted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  tabIconActive: {
    color: palette.blue,
  },
  tabText: {
    color: palette.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  tabTextActive: {
    color: palette.blue,
  },
  tabSoon: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
  },
  searchFields: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: Spacing.three,
  },
  searchFieldsCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  searchField: {
    flex: 1,
    minWidth: 210,
  },
  fieldLabel: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: "#FBFCFF",
    borderColor: palette.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.body,
    minHeight: 66,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  searchButton: {
    alignItems: "center",
    backgroundColor: palette.blue,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 66,
    minWidth: 150,
    paddingHorizontal: Spacing.five,
    shadowColor: palette.violet,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 4,
  },
  searchButtonDisabled: {
    backgroundColor: palette.disabled,
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: palette.surface,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  searchButtonTextDisabled: {
    color: palette.faint,
  },
  sectionsGrid: {
    alignSelf: "center",
    flexDirection: "row",
    gap: Spacing.five,
    marginTop: Spacing.xxl,
    maxWidth: layout.contentMaxWidth,
    width: "90%",
  },
  sectionsGridCompact: {
    flexDirection: "column",
    width: "92%",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    minHeight: 222,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 3,
  },
  sectionCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  sectionTitleWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: Spacing.md,
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: palette.blueSoft,
    borderRadius: Radius.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  sectionIconText: {
    color: palette.blue,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  sectionTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  sectionAction: {
    alignItems: "flex-end",
  },
  sectionActionText: {
    color: palette.blue,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  sectionSoon: {
    color: palette.faint,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    marginTop: Spacing.xxs,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.borderSoft,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    padding: Spacing.five,
  },
  emptyStateLine: {
    backgroundColor: palette.border,
    borderRadius: Radius.round,
    height: 6,
    marginBottom: Spacing.three,
    width: 92,
  },
  emptyStateText: {
    color: palette.muted,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: Typography.lineHeight.default,
    textAlign: "center",
  },
  supportStrip: {
    alignSelf: "center",
    backgroundColor: palette.surface,
    borderColor: palette.borderSoft,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    marginTop: Spacing.xxl,
    maxWidth: layout.contentMaxWidth,
    padding: Spacing.xxl,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    width: "90%",
    elevation: 3,
  },
  supportItem: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 230,
  },
  supportIcon: {
    alignItems: "center",
    borderRadius: Radius.round,
    height: 40,
    justifyContent: "center",
    width: 40,
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
    color: palette.blue,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  supportCopy: {
    flex: 1,
  },
  supportTitle: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
    marginBottom: Spacing.xxs,
  },
  supportText: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    lineHeight: 16,
  },
});

const nodePositionStyles: Record<EcosystemNodeKey, ViewStyle> = {
  student: {
    left: "16%",
    top: 78,
  },
  workers: {
    right: "15%",
    top: 84,
  },
  courses: {
    left: "10%",
    top: 265,
  },
  companies: {
    right: "10%",
    top: 270,
  },
  freelancers: {
    bottom: 78,
    left: "50%",
    marginLeft: -88,
  },
};

const nodeToneStyles: Record<EcosystemNodeKey, ViewStyle> = {
  student: {
    backgroundColor: "rgba(20, 92, 255, 0.16)",
    borderColor: "rgba(24, 199, 223, 0.58)",
  },
  courses: {
    backgroundColor: "rgba(24, 199, 223, 0.16)",
    borderColor: "rgba(20, 92, 255, 0.45)",
  },
  workers: {
    backgroundColor: "rgba(110, 29, 255, 0.15)",
    borderColor: "rgba(110, 29, 255, 0.44)",
  },
  companies: {
    backgroundColor: "rgba(240, 19, 99, 0.14)",
    borderColor: "rgba(240, 19, 99, 0.42)",
  },
  freelancers: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderColor: "rgba(110, 29, 255, 0.36)",
  },
};
