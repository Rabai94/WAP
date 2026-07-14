import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import JobSummaryCard from "@/components/jobs/JobSummaryCard";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { Screen } from "@/components/ui";
import type { AuthRole } from "@/domain/auth/auth.types";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { useLanguage } from "@/i18n/LanguageProvider";
import { LanguageCode, languages } from "@/i18n/translations";
import {
  fetchLatestPublishedCourses,
  type SearchCourseResult,
} from "@/services/courses/courseService";
import {
  fetchLatestPublishedJobs,
  type SearchJobResult,
} from "@/services/jobs/jobFlowService";
import {
  searchLocationSuggestions,
  searchOccupationSuggestions,
  type LocationSuggestion,
  type OccupationSuggestion,
} from "@/services/search/heroAutocomplete";
import { Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
    AccessibilityInfo,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type ViewStyle,
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
type AutocompleteTarget = "occupation" | "location" | null;
type OccupationAutocompleteOption = HeroAutocompleteOption & {
  suggestion: OccupationSuggestion;
};
type LocationAutocompleteOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

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
  { key: "courses", enabled: true, route: "/courses" },
  { key: "freelancers", enabled: false },
];

const searchTabs: { key: SearchTabKey }[] = [
  { key: "jobs" },
  { key: "companies" },
  { key: "courses" },
  { key: "freelancers" },
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

const searchRoutes: Record<SearchTabKey, string> = {
  jobs: "/jobs",
  companies: "/companies",
  courses: "/courses",
  freelancers: "/freelancers",
};

const searchModeCopy = {
  ro: {
    jobs: {
      whatPlaceholder: "ex: lucrător depozit",
      locationPlaceholder: "ex: München",
      button: "Caută joburi",
    },
    companies: {
      whatPlaceholder: "ex: Amazon",
      locationPlaceholder: "ex: Augsburg",
      button: "Caută firme",
    },
    courses: {
      whatPlaceholder: "ex: limba germană",
      locationPlaceholder: "ex: online sau München",
      button: "Caută cursuri",
    },
    freelancers: {
      whatPlaceholder: "ex: electrician",
      locationPlaceholder: "ex: Augsburg",
      button: "Caută freelanceri",
    },
  },
  en: {
    jobs: {
      whatPlaceholder: "ex: warehouse worker",
      locationPlaceholder: "ex: Munich",
      button: "Search jobs",
    },
    companies: {
      whatPlaceholder: "ex: Amazon",
      locationPlaceholder: "ex: Augsburg",
      button: "Search companies",
    },
    courses: {
      whatPlaceholder: "ex: German language",
      locationPlaceholder: "ex: online or Munich",
      button: "Search courses",
    },
    freelancers: {
      whatPlaceholder: "ex: electrician",
      locationPlaceholder: "ex: Augsburg",
      button: "Search freelancers",
    },
  },
  de: {
    jobs: {
      whatPlaceholder: "z. B. Lagerarbeiter",
      locationPlaceholder: "z. B. München",
      button: "Jobs suchen",
    },
    companies: {
      whatPlaceholder: "z. B. Amazon",
      locationPlaceholder: "z. B. Augsburg",
      button: "Firmen suchen",
    },
    courses: {
      whatPlaceholder: "z. B. Deutschkurs",
      locationPlaceholder: "z. B. online oder München",
      button: "Kurse suchen",
    },
    freelancers: {
      whatPlaceholder: "z. B. Elektriker",
      locationPlaceholder: "z. B. Augsburg",
      button: "Freelancer suchen",
    },
  },
} satisfies Record<
  LanguageCode,
  Record<
    SearchTabKey,
    {
      whatPlaceholder: string;
      locationPlaceholder: string;
      button: string;
    }
  >
>;

const heroCoverImage = require("../../assets/hero/rabai-home-hero-background-v001.png");
const heroBackgroundWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundImage:
          "radial-gradient(circle at 45% 46%, rgba(6,10,25,0.84) 0%, rgba(6,10,25,0.70) 32%, rgba(6,10,25,0.38) 66%, rgba(6,10,25,0.20) 100%), linear-gradient(90deg, rgba(6,10,25,0.82) 0%, rgba(6,10,25,0.66) 42%, rgba(6,10,25,0.34) 78%, rgba(6,10,25,0.24) 100%), url('/images/rabai-home-hero-background-v001.png')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      } as unknown as ViewStyle)
    : null;
const pageBackgroundWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundColor: palette.page,
        backgroundImage:
          "radial-gradient(circle at 12% 18%, rgba(20,92,255,0.075) 0%, rgba(20,92,255,0.035) 18%, rgba(20,92,255,0) 34%), radial-gradient(circle at 86% 30%, rgba(110,29,255,0.068) 0%, rgba(110,29,255,0.032) 16%, rgba(110,29,255,0) 32%), radial-gradient(circle at 52% 92%, rgba(24,199,223,0.055) 0%, rgba(24,199,223,0.026) 18%, rgba(24,199,223,0) 38%)",
        backgroundRepeat: "no-repeat",
      } as unknown as ViewStyle)
    : null;
const glassPanelWebStyle =
  Platform.OS === "web"
    ? ({
        WebkitBackdropFilter: "blur(14px)",
        backdropFilter: "blur(14px)",
        boxShadow:
          "0 26px 70px rgba(25, 35, 95, 0.16), 0 0 42px rgba(110, 29, 255, 0.10)",
      } as unknown as ViewStyle)
    : null;
const searchButtonWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundImage: "linear-gradient(135deg, #145CFF 0%, #5D37EA 100%)",
        boxShadow:
          "0 16px 30px rgba(20, 92, 255, 0.24), 0 0 26px rgba(110, 29, 255, 0.16)",
      } as unknown as ViewStyle)
    : null;
const searchButtonHoverWebStyle =
  Platform.OS === "web"
    ? ({
        boxShadow:
          "0 18px 34px rgba(20, 92, 255, 0.28), 0 0 30px rgba(110, 29, 255, 0.18)",
      } as unknown as ViewStyle)
    : null;
const focusRingWebStyle =
  Platform.OS === "web"
    ? ({
        outlineColor: "rgba(24, 199, 223, 0.82)",
        outlineOffset: 3,
        outlineStyle: "solid",
        outlineWidth: 2,
      } as unknown as ViewStyle)
    : null;
const categoryGlassWebStyle =
  Platform.OS === "web"
    ? ({
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
      } as unknown as ViewStyle)
    : null;

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

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
  const [activeCategory, setActiveCategory] = useState<SearchTabKey>("jobs");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedOccupation, setSelectedOccupation] =
    useState<OccupationSuggestion | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [occupationSuggestions, setOccupationSuggestions] = useState<
    OccupationSuggestion[]
  >([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [occupationLoading, setOccupationLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [occupationError, setOccupationError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [openAutocomplete, setOpenAutocomplete] =
    useState<AutocompleteTarget>(null);
  const [occupationActiveIndex, setOccupationActiveIndex] = useState(-1);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const [previewRole, setPreviewRole] = useState<PreviewRole>("worker");
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [latestJobs, setLatestJobs] = useState<SearchJobResult[]>([]);
  const [latestJobsLoading, setLatestJobsLoading] = useState(true);
  const [latestJobsError, setLatestJobsError] = useState("");
  const [latestCourses, setLatestCourses] = useState<SearchCourseResult[]>([]);
  const [latestCoursesLoading, setLatestCoursesLoading] = useState(true);
  const [latestCoursesError, setLatestCoursesError] = useState("");
  const occupationRequestId = useRef(0);
  const locationRequestId = useRef(0);

  const isCompact = width < 860;
  const isPhone = width < 620;
  const copy = copyByLanguage[language];
  const activeSearchModeCopy = searchModeCopy[language][activeCategory];
  const isAuthenticated = authState === "authenticated";
  const isAdmin = user?.isAdmin === true;
  const effectivePreviewRole: PreviewRole =
    isAdmin ? previewRole : user?.role && user.role !== "admin" ? user.role : "worker";

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotionEnabled(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      setLatestCoursesLoading(true);
      setLatestCoursesError("");

      fetchLatestPublishedCourses(4)
        .then((courses) => {
          if (mounted) {
            setLatestCourses(courses);
          }
        })
        .catch((error) => {
          if (mounted) {
            setLatestCourses([]);
            setLatestCoursesError(readLatestCoursesError(error));
          }
        })
        .finally(() => {
          if (mounted) {
            setLatestCoursesLoading(false);
          }
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    occupationRequestId.current += 1;
    const requestId = occupationRequestId.current;

    if (activeCategory !== "jobs" || trimmedQuery.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setOccupationLoading(true);
      setOccupationError(null);

      searchOccupationSuggestions(trimmedQuery, language, 8)
        .then((suggestions) => {
          if (occupationRequestId.current !== requestId) {
            return;
          }

          setOccupationSuggestions(suggestions);
          setOccupationActiveIndex(suggestions.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (occupationRequestId.current !== requestId) {
            return;
          }

          setOccupationSuggestions([]);
          setOccupationActiveIndex(-1);
          setOccupationError("Nu am putut incarca ocupatiile.");
        })
        .finally(() => {
          if (occupationRequestId.current === requestId) {
            setOccupationLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeCategory, language, query]);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      setLatestJobsLoading(true);
      setLatestJobsError("");

      fetchLatestPublishedJobs(4)
        .then((jobs) => {
          if (mounted) {
            setLatestJobs(jobs);
          }
        })
        .catch((error) => {
          if (mounted) {
            setLatestJobs([]);
            setLatestJobsError(readLatestJobsError(error));
          }
        })
        .finally(() => {
          if (mounted) {
            setLatestJobsLoading(false);
          }
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const trimmedLocation = location.trim();
    locationRequestId.current += 1;
    const requestId = locationRequestId.current;

    if (trimmedLocation.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLocationLoading(true);
      setLocationError(null);

      searchLocationSuggestions(trimmedLocation, 10)
        .then((suggestions) => {
          if (locationRequestId.current !== requestId) {
            return;
          }

          setLocationSuggestions(suggestions);
          setLocationActiveIndex(suggestions.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (locationRequestId.current !== requestId) {
            return;
          }

          setLocationSuggestions([]);
          setLocationActiveIndex(-1);
          setLocationError("Nu am putut incarca locatiile.");
        })
        .finally(() => {
          if (locationRequestId.current === requestId) {
            setLocationLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location]);

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

  const occupationOptions = useMemo<OccupationAutocompleteOption[]>(
    () =>
      occupationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        subtitle: suggestion.categoryLabel,
        title: suggestion.label,
      })),
    [occupationSuggestions]
  );

  const locationOptions = useMemo<LocationAutocompleteOption[]>(
    () =>
      locationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        title: suggestion.label,
      })),
    [locationSuggestions]
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

  function handleQueryChange(text: string) {
    setQuery(text);

    if (selectedOccupation && text !== selectedOccupation.label) {
      setSelectedOccupation(null);
    }

    if (activeCategory !== "jobs" || text.trim().length < 2) {
      occupationRequestId.current += 1;
      setOccupationSuggestions([]);
      setOccupationLoading(false);
      setOccupationError(null);
      setOccupationActiveIndex(-1);
    } else {
      setOccupationError(null);
      setOpenAutocomplete("occupation");
    }
  }

  function handleLocationChange(text: string) {
    setLocation(text);

    if (selectedLocation && text !== selectedLocation.label) {
      setSelectedLocation(null);
    }

    if (text.trim().length < 2) {
      locationRequestId.current += 1;
      setLocationSuggestions([]);
      setLocationLoading(false);
      setLocationError(null);
      setLocationActiveIndex(-1);
    } else {
      setLocationError(null);
      setOpenAutocomplete("location");
    }
  }

  function selectOccupationSuggestion(suggestion: OccupationSuggestion) {
    setSelectedOccupation(suggestion);
    setQuery(suggestion.label);
    setOpenAutocomplete(null);
    setOccupationActiveIndex(-1);
  }

  function selectLocationSuggestion(suggestion: LocationSuggestion) {
    setSelectedLocation(suggestion);
    setLocation(suggestion.label);
    setOpenAutocomplete(null);
    setLocationActiveIndex(-1);
  }

  function closeAutocomplete() {
    setOpenAutocomplete(null);
  }

  function submitSearch() {
    const params: [string, string][] = [];
    const trimmedQuery = query.trim();
    const trimmedLocation = location.trim();

    function addParam(key: string, value?: string | number | null) {
      if (value === null || value === undefined) {
        return;
      }

      const normalizedValue = String(value).trim();

      if (normalizedValue.length > 0) {
        params.push([key, normalizedValue]);
      }
    }

    if (activeCategory === "jobs") {
      if (selectedOccupation) {
        addParam("occupation", selectedOccupation.slug);
        addParam("occupationId", selectedOccupation.id);
      } else {
        addParam("occupation", trimmedQuery);
      }

      if (selectedLocation) {
        addParam("location", selectedLocation.label);
        addParam("locationId", selectedLocation.id);
        addParam("lat", selectedLocation.latitude);
        addParam("lng", selectedLocation.longitude);
      } else {
        addParam("location", trimmedLocation);
      }
    } else {
      addParam("search", trimmedQuery);
      if (selectedLocation) {
        addParam("location", selectedLocation.label);
        addParam("locationId", selectedLocation.id);
      } else {
        addParam("location", trimmedLocation);
      }
    }

    const queryString = params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const searchRoute = `${searchRoutes[activeCategory]}${
      queryString ? `?${queryString}` : ""
    }`;

    router.push(searchRoute as never);
  }

  function selectSearchCategory(categoryKey: SearchTabKey) {
    if (categoryKey !== activeCategory) {
      setActiveCategory(categoryKey);
      setOpenAutocomplete(null);

      if (categoryKey !== "jobs") {
        setSelectedOccupation(null);
        setOccupationSuggestions([]);
        setOccupationActiveIndex(-1);
      }
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
    <Screen centered={false} style={[styles.screen, pageBackgroundWebStyle]}>
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

        <View
          style={[
            styles.hero,
            isCompact && styles.heroCompact,
            isPhone && styles.heroPhone,
            heroBackgroundWebStyle,
          ]}
        >
          {Platform.OS !== "web" ? (
            <View style={styles.heroBackgroundClip}>
              <Image
                resizeMode="cover"
                source={heroCoverImage}
                style={styles.heroCoverImage}
              />
              <View style={styles.heroCoverOverlay} />
              <View style={styles.heroLeftOverlay} />
              <View style={styles.heroCenterOverlay} />
            </View>
          ) : null}

          <View
            style={[
              styles.heroContent,
              isCompact && styles.heroContentCompact,
              isPhone && styles.heroContentPhone,
            ]}
          >
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroEyebrow}>{copy.hero.ecosystem}</Text>
              <Text
                style={[
                  styles.heroTitle,
                  isCompact && styles.heroTitleCompact,
                  isPhone && styles.heroTitlePhone,
                ]}
              >
                {heroTitle}
              </Text>
              <Text style={[styles.heroSubtitle, isPhone && styles.heroSubtitlePhone]}>
                {copy.hero.subtitle}
              </Text>
            </View>

            <HeroSearchControls
              activeCategory={activeCategory}
              copy={copy}
              isCompact={isCompact}
              isPhone={isPhone}
              location={location}
              locationActiveIndex={locationActiveIndex}
              locationError={locationError}
              locationLoading={locationLoading}
              locationOptions={locationOptions}
              onAutocompleteClose={closeAutocomplete}
              onLocationActiveIndexChange={setLocationActiveIndex}
              onLocationChange={handleLocationChange}
              onLocationFocus={() => {
                setOpenAutocomplete("location");
              }}
              onLocationSelect={(option) => {
                selectLocationSuggestion(option.suggestion);
              }}
              onOccupationActiveIndexChange={setOccupationActiveIndex}
              onOccupationFocus={() => {
                if (activeCategory === "jobs") {
                  setOpenAutocomplete("occupation");
                }
              }}
              onOccupationSelect={(option) => {
                selectOccupationSuggestion(option.suggestion);
              }}
              onQueryChange={handleQueryChange}
              onSubmit={submitSearch}
              onTabChange={selectSearchCategory}
              openAutocomplete={openAutocomplete}
              occupationActiveIndex={occupationActiveIndex}
              occupationError={occupationError}
              occupationLoading={occupationLoading}
              occupationOptions={occupationOptions}
              query={query}
              reduceMotionEnabled={reduceMotionEnabled}
              searchMode={activeSearchModeCopy}
            />
          </View>
        </View>

        <View style={[styles.sectionsGrid, isCompact && styles.sectionsGridCompact]}>
          <PublicSectionCard
            actionDisabled={false}
            actionLabel={copy.sections.viewJobs}
            emptyText={copy.sections.jobsEmpty}
            errorText={latestJobsError}
            loading={latestJobsLoading}
            onAction={() => {
              navigate("/jobs");
            }}
            title={copy.sections.jobsTitle}
          >
            {latestJobs.length > 0 ? (
              <View
                style={[
                  styles.latestJobsGrid,
                  latestJobs.length === 1 && styles.latestJobsGridSingle,
                ]}
              >
                {latestJobs.map((job) => (
                  <JobSummaryCard
                    job={job}
                    key={job.job_id}
                    language={language}
                    returnLabel="Înapoi la pagina principală"
                    returnTo="/engine"
                    variant="compact"
                  />
                ))}
              </View>
            ) : null}
          </PublicSectionCard>
          <PublicSectionCard
            actionDisabled={false}
            actionLabel={copy.sections.viewCourses}
            emptyText={copy.sections.coursesEmpty}
            errorText={latestCoursesError}
            loading={latestCoursesLoading}
            onAction={() => {
              navigate("/courses");
            }}
            title={copy.sections.coursesTitle}
          >
            {latestCourses.length > 0 ? (
              <View
                style={[
                  styles.latestJobsGrid,
                  latestCourses.length === 1 && styles.latestJobsGridSingle,
                ]}
              >
                {latestCourses.map((course) => (
                  <CourseSummaryCard
                    course={course}
                    key={course.course_id}
                    language={language}
                    returnLabel="Înapoi la pagina principală"
                    returnTo="/engine"
                    variant="compact"
                  />
                ))}
              </View>
            ) : null}
          </PublicSectionCard>
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

        <View style={styles.supportStrip}>
          {supportItems.map((item) => (
            <View
              key={item.key}
              style={[
                styles.supportItem,
                item.tone === "blue" && styles.supportItemBlue,
                item.tone === "violet" && styles.supportItemViolet,
                item.tone === "cyan" && styles.supportItemCyan,
                item.tone === "rose" && styles.supportItemRose,
              ]}
            >
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

function HeroSearchControls({
  activeCategory,
  copy,
  isCompact,
  isPhone,
  location,
  locationActiveIndex,
  locationError,
  locationLoading,
  locationOptions,
  occupationActiveIndex,
  occupationError,
  occupationLoading,
  occupationOptions,
  onAutocompleteClose,
  onLocationActiveIndexChange,
  onLocationChange,
  onLocationFocus,
  onLocationSelect,
  onOccupationActiveIndexChange,
  onOccupationFocus,
  onOccupationSelect,
  onQueryChange,
  onSubmit,
  onTabChange,
  openAutocomplete,
  query,
  reduceMotionEnabled,
  searchMode,
}: {
  activeCategory: SearchTabKey;
  copy: HomeCopy;
  isCompact: boolean;
  isPhone: boolean;
  location: string;
  locationActiveIndex: number;
  locationError: string | null;
  locationLoading: boolean;
  locationOptions: LocationAutocompleteOption[];
  occupationActiveIndex: number;
  occupationError: string | null;
  occupationLoading: boolean;
  occupationOptions: OccupationAutocompleteOption[];
  onAutocompleteClose: () => void;
  onLocationActiveIndexChange: (index: number) => void;
  onLocationChange: (text: string) => void;
  onLocationFocus: () => void;
  onLocationSelect: (option: LocationAutocompleteOption) => void;
  onOccupationActiveIndexChange: (index: number) => void;
  onOccupationFocus: () => void;
  onOccupationSelect: (option: OccupationAutocompleteOption) => void;
  onQueryChange: (text: string) => void;
  onSubmit: () => void;
  onTabChange: (tab: SearchTabKey) => void;
  openAutocomplete: AutocompleteTarget;
  query: string;
  reduceMotionEnabled: boolean;
  searchMode: {
    whatPlaceholder: string;
    locationPlaceholder: string;
    button: string;
  };
}) {
  return (
    <View style={[styles.heroSearchPanel, isPhone && styles.heroSearchPanelPhone]}>
      <View
        style={[
          styles.heroSearchFields,
          glassPanelWebStyle,
          isCompact && styles.heroSearchFieldsCompact,
          isPhone && styles.heroSearchFieldsPhone,
        ]}
      >
        <HeroAutocompleteField
          activeIndex={occupationActiveIndex}
          emptyMessage="Nu am gasit rezultate"
          errorMessage={occupationError}
          fieldId="hero-occupation-search"
          isOpen={
            activeCategory === "jobs" &&
            openAutocomplete === "occupation" &&
            query.trim().length >= 2
          }
          label={copy.search.what}
          loading={occupationLoading}
          onActiveIndexChange={onOccupationActiveIndexChange}
          onChangeText={onQueryChange}
          onFocus={onOccupationFocus}
          onRequestClose={onAutocompleteClose}
          onSelect={onOccupationSelect}
          placeholder={searchMode.whatPlaceholder}
          queryText={query}
          suggestions={activeCategory === "jobs" ? occupationOptions : []}
          value={query}
        />
        <HeroAutocompleteField
          activeIndex={locationActiveIndex}
          emptyMessage="Nu am gasit rezultate"
          errorMessage={locationError}
          fieldId="hero-location-search"
          isOpen={openAutocomplete === "location" && location.trim().length >= 2}
          label={copy.search.location}
          loading={locationLoading}
          onActiveIndexChange={onLocationActiveIndexChange}
          onChangeText={onLocationChange}
          onFocus={onLocationFocus}
          onRequestClose={onAutocompleteClose}
          onSelect={onLocationSelect}
          placeholder={searchMode.locationPlaceholder}
          queryText={location}
          suggestions={locationOptions}
          value={location}
        />
        <Pressable
          accessibilityRole="button"
          onPress={onSubmit}
          style={(state) => {
            const webState = state as WebPressableState;

            return [
              styles.searchButton,
              styles.heroSearchButton,
              searchButtonWebStyle,
              isPhone && styles.heroSearchButtonPhone,
              !reduceMotionEnabled &&
                webState.hovered &&
                styles.heroSearchButtonHover,
              webState.hovered && searchButtonHoverWebStyle,
              webState.focused && styles.heroSearchButtonFocus,
              webState.focused && focusRingWebStyle,
              webState.pressed && styles.heroSearchButtonPressed,
            ];
          }}
        >
          <Text style={styles.searchButtonText}>{searchMode.button}</Text>
        </Pressable>
      </View>

      <View style={[styles.heroCategories, isPhone && styles.heroCategoriesPhone]}>
        {searchTabs.map((tab) => {
          const active = activeCategory === tab.key;

          return (
            <Pressable
              aria-selected={active}
              accessibilityRole="tab"
              accessibilityState={{
                selected: active,
              }}
              focusable
              key={tab.key}
              onPress={() => {
                onTabChange(tab.key);
              }}
              style={(state) => {
                const webState = state as WebPressableState;

                return [
                  styles.heroCategory,
                  categoryGlassWebStyle,
                  isPhone && styles.heroCategoryPhone,
                  active && styles.heroCategoryActive,
                  webState.hovered && styles.heroCategoryHover,
                  !reduceMotionEnabled &&
                    webState.hovered &&
                    styles.heroCategoryHoverLift,
                  webState.focused && styles.heroCategoryFocus,
                  webState.focused && focusRingWebStyle,
                ];
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.heroCategoryText,
                  active && styles.heroCategoryTextActive,
                ]}
              >
                {copy.search.tabs[tab.key]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function PublicSectionCard({
  actionDisabled,
  actionLabel,
  children,
  disabledLabel,
  emptyText,
  errorText,
  loading,
  onAction,
  title,
}: {
  actionDisabled?: boolean;
  actionLabel: string;
  children?: ReactNode;
  disabledLabel?: string;
  emptyText: string;
  errorText?: string;
  loading?: boolean;
  onAction?: () => void;
  title: string;
}) {
  const hasContent = Boolean(children);

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

      {loading ? (
        <LatestJobsSkeleton />
      ) : errorText ? (
        <View style={styles.sectionStatusState}>
          <Text style={styles.sectionErrorText}>{errorText}</Text>
        </View>
      ) : hasContent ? (
        children
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateLine} />
          <Text style={styles.emptyStateText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );
}

function LatestJobsSkeleton() {
  return (
    <View style={styles.latestJobsGrid}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.jobSkeletonCard}>
          <View style={styles.jobSkeletonTitle} />
          <View style={styles.jobSkeletonLine} />
          <View style={styles.jobSkeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

function readLatestJobsError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca joburile publicate.";
}

function readLatestCoursesError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca cursurile active.";
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
    borderRadius: 28,
    marginTop: Spacing.four,
    maxWidth: layout.contentMaxWidth,
    minHeight: 680,
    overflow: "visible",
    position: "relative",
    width: "100%",
  },
  heroCompact: {
    minHeight: 620,
  },
  heroPhone: {
    minHeight: 690,
  },
  heroBackgroundClip: {
    bottom: 0,
    borderRadius: 28,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroCoverImage: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroCoverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 10, 25, 0.34)",
  },
  heroLeftOverlay: {
    backgroundColor: "rgba(6, 10, 25, 0.36)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "62%",
  },
  heroCenterOverlay: {
    backgroundColor: "rgba(6, 10, 25, 0.32)",
    borderRadius: 420,
    height: 760,
    left: "12%",
    position: "absolute",
    top: -34,
    width: 840,
  },
  heroContent: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    minHeight: 680,
    paddingHorizontal: Spacing.eight,
    paddingVertical: 72,
    zIndex: 1,
  },
  heroContentCompact: {
    minHeight: 620,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.eight,
  },
  heroContentPhone: {
    minHeight: 690,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  heroTextBlock: {
    alignItems: "center",
    maxWidth: 900,
    width: "100%",
  },
  heroEyebrow: {
    color: palette.surfaceSoft,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: palette.surface,
    fontSize: 64,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
    lineHeight: 72,
    maxWidth: 900,
    textAlign: "center",
  },
  heroTitleCompact: {
    fontSize: 52,
    lineHeight: 58,
  },
  heroTitlePhone: {
    fontSize: 36,
    lineHeight: 42,
  },
  heroTitleAccent: {
    color: palette.cyan,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.94)",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 28,
    marginTop: Spacing.three,
    maxWidth: 720,
    textAlign: "center",
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
  heroSearchPanel: {
    alignItems: "center",
    marginTop: 34,
    maxWidth: 1000,
    overflow: "visible",
    width: "100%",
    zIndex: 20,
  },
  heroSearchPanelPhone: {
    marginTop: Spacing.screen,
  },
  heroSearchFields: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.80)",
    borderColor: "rgba(118, 111, 255, 0.28)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    padding: Spacing.md,
    shadowColor: palette.violet,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 34,
    overflow: "visible",
    width: "100%",
    zIndex: 30,
    elevation: 6,
  },
  heroSearchFieldsCompact: {
    alignItems: "stretch",
  },
  heroSearchFieldsPhone: {
    flexDirection: "column",
  },
  heroSearchButton: {
    backgroundColor: palette.blue,
    borderColor: "rgba(255, 255, 255, 0.36)",
    borderWidth: 1,
    minHeight: 54,
    minWidth: 148,
    shadowColor: palette.blue,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },
  heroSearchButtonHover: {
    transform: [{ translateY: -2 }],
  },
  heroSearchButtonFocus: {
    borderColor: "rgba(24, 199, 223, 0.86)",
  },
  heroSearchButtonPressed: {
    transform: [{ translateY: 0 }],
  },
  heroSearchButtonPhone: {
    alignSelf: "stretch",
    width: "100%",
  },
  heroCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
    marginTop: Spacing.three,
    maxWidth: 720,
    width: "100%",
  },
  heroCategoriesPhone: {
    alignSelf: "stretch",
  },
  heroCategory: {
    alignItems: "center",
    backgroundColor: "rgba(8, 14, 34, 0.34)",
    borderColor: "rgba(255, 255, 255, 0.20)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 138,
    flexGrow: 1,
    justifyContent: "center",
    maxWidth: 170,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  heroCategoryPhone: {
    flexBasis: "47%",
    maxWidth: "100%",
    minWidth: 0,
  },
  heroCategoryActive: {
    backgroundColor: "rgba(20, 92, 255, 0.28)",
    borderColor: "rgba(170, 209, 255, 0.56)",
  },
  heroCategoryHover: {
    backgroundColor: "rgba(12, 24, 54, 0.42)",
    borderColor: "rgba(255, 255, 255, 0.34)",
  },
  heroCategoryHoverLift: {
    transform: [{ translateY: -1 }],
  },
  heroCategoryFocus: {
    borderColor: "rgba(24, 199, 223, 0.78)",
  },
  heroCategoryDisabled: {
    opacity: 0.76,
  },
  heroCategoryText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
    textAlign: "center",
  },
  heroCategoryTextActive: {
    color: palette.surface,
  },
  heroCategorySoon: {
    color: "rgba(255, 255, 255, 0.70)",
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0,
    marginTop: 2,
    textAlign: "center",
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
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 180,
  },
  fieldLabel: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderColor: "rgba(214, 224, 245, 0.86)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    minHeight: 54,
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
    marginTop: Spacing.xl,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
  },
  sectionsGridCompact: {
    flexDirection: "column",
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderColor: "rgba(218, 227, 245, 0.78)",
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
    padding: Spacing.four,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 2,
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
  latestJobsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  latestJobsGridSingle: {
    maxWidth: 420,
  },
  sectionStatusState: {
    backgroundColor: "rgba(243, 247, 255, 0.78)",
    borderColor: "rgba(218, 227, 245, 0.62)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionErrorText: {
    color: palette.rose,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  jobSkeletonCard: {
    backgroundColor: "rgba(243, 247, 255, 0.78)",
    borderColor: "rgba(218, 227, 245, 0.62)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    minHeight: 142,
    padding: Spacing.lg,
  },
  jobSkeletonTitle: {
    backgroundColor: palette.border,
    borderRadius: Radius.round,
    height: 12,
    marginBottom: Spacing.md,
    width: "78%",
  },
  jobSkeletonLine: {
    backgroundColor: palette.borderSoft,
    borderRadius: Radius.round,
    height: 10,
    marginBottom: Spacing.sm,
    width: "100%",
  },
  jobSkeletonLineShort: {
    backgroundColor: palette.borderSoft,
    borderRadius: Radius.round,
    height: 10,
    width: "54%",
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "rgba(243, 247, 255, 0.78)",
    borderColor: "rgba(218, 227, 245, 0.62)",
    borderRadius: Radius.xl,
    borderWidth: 1,
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
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "rgba(218, 227, 245, 0.76)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    minHeight: 132,
    minWidth: 240,
    padding: Spacing.lg,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.045,
    shadowRadius: 22,
    elevation: 1,
  },
  supportItemBlue: {
    borderColor: "rgba(20, 92, 255, 0.16)",
  },
  supportItemViolet: {
    borderColor: "rgba(110, 29, 255, 0.16)",
  },
  supportItemCyan: {
    borderColor: "rgba(24, 199, 223, 0.18)",
  },
  supportItemRose: {
    borderColor: "rgba(240, 19, 99, 0.14)",
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
