import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { Screen } from "@/components/ui";
import type { AuthRole } from "@/domain/auth/auth.types";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
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
import { buildCourseDetailsPath } from "@/services/courses/courseNavigation";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
import {
  searchLocationSuggestions,
  searchOccupationSuggestions,
  type LocationSuggestion,
  type OccupationSuggestion,
} from "@/services/search/heroAutocomplete";
import {
  Colors,
  InteractionStyles,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
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
    View,
    type ViewStyle,
} from "react-native";

type NavKey =
  | "home"
  | "jobs"
  | "tasks"
  | "services"
  | "courses"
  | "messages"
  | "profile";
type SearchTabKey = "jobs" | "tasks" | "services" | "courses";
type EcosystemNodeKey =
  | "student"
  | "courses"
  | "workers"
  | "companies"
  | "freelancers";
type AdminPreviewKey =
  | "personal"
  | "organization"
  | "jobs"
  | "tasks"
  | "services"
  | "courses"
  | "messages";
type AdminGroupKey = "platform" | "accounts" | "communication";
type QuickActionKey = "profile" | "organization" | "jobs" | "task";
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
    applications: string;
    login: string;
    organizations: string;
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
    activityTitle: string;
    activityEmpty: string;
    jobsTitle: string;
    coursesTitle: string;
    viewJobs: string;
    viewCourses: string;
    jobsEmpty: string;
    coursesEmpty: string;
    quickTitle: string;
    quickActions: Record<QuickActionKey, string>;
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
    groupLabel: Record<AdminGroupKey, string>;
    previewLabel: Record<AdminPreviewKey, string>;
  };
};

const copyByLanguage = {
  ro: {
    nav: {
      home: "Acasă",
      jobs: "Locuri de muncă",
      tasks: "Lucrări punctuale",
      services: "Servicii",
      courses: "Cursuri",
      messages: "Mesaje",
      profile: "Profil",
    },
    auth: {
      applications: "Aplicările mele",
      login: "Login",
      organizations: "Organizațiile mele",
      register: "Înregistrează-te",
      soon: "În curând",
      logout: "Logout",
    },
    hero: {
      title: "Motorul tau pentru",
      titleAccent: "viitorul",
      titleEnd: "profesional.",
      subtitle:
        "Cauta locuri de munca, lucrari punctuale, servicii si cursuri intr-un singur ecosistem profesional.",
      ecosystem: "Ecosistem profesional conectat",
    },
    nodes: {
      student: {
        title: "Cont personal",
        label: "Explorezi",
      },
      courses: {
        title: "Cursuri",
        label: "Te dezvolti",
      },
      workers: {
        title: "Joburi",
        label: "Iti construiesti cariera",
      },
      companies: {
        title: "Organizatii",
        label: "Publica oportunitati",
      },
      freelancers: {
        title: "Servicii",
        label: "Oferi sau soliciti",
      },
    },
    search: {
      tabs: {
        jobs: "Locuri de munca",
        tasks: "Lucrari punctuale",
        services: "Servicii",
        courses: "Cursuri",
      },
      what: "Ce cauti?",
      whatPlaceholder: "ex: logistica depozit",
      location: "Locatie",
      locationPlaceholder: "ex: Munchen",
      category: "Categorie",
      categoryPlaceholder: "Toate categoriile",
      button: "Cauta",
    },
    sections: {
      activityTitle: "Activitate recenta",
      activityEmpty: "Nu exista activitate recenta disponibila.",
      jobsTitle: "Joburi postate",
      coursesTitle: "Cursuri active",
      viewJobs: "Vezi joburile",
      viewCourses: "Vezi cursurile",
      jobsEmpty: "Momentan nu exista joburi publicate.",
      coursesEmpty: "Momentan nu exista cursuri active.",
      quickTitle: "Continua rapid",
      quickActions: {
        profile: "Completeaza profilul",
        organization: "Creeaza organizatie",
        jobs: "Vezi joburi",
        task: "Publica lucrare",
      },
    },
    support: {
      unified: "Totul intr-un singur loc",
      unifiedText: "Locuri de munca, lucrari punctuale, servicii si cursuri.",
      trusted: "De incredere",
      trustedText: "Profil verificat, anunturi reale.",
      fast: "Gaseste mai rapid",
      fastText: "Cauta, filtreaza si aplica simplu.",
      support: "Sprijin pentru reusita ta",
      supportText: "Resurse si oportunitati utile.",
    },
    preview: {
      adminBarTitle: "Admin activ",
      adminBarSubtitle: "Ai acces rapid la zonele principale RabAI.",
      groupLabel: {
        platform: "Platforma",
        accounts: "Conturi",
        communication: "Comunicare",
      },
      previewLabel: {
        personal: "Profil personal",
        organization: "Organizațiile mele",
        jobs: "Joburi",
        tasks: "Lucrări punctuale",
        services: "Servicii",
        courses: "Cursuri",
        messages: "Mesaje",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      jobs: "Jobs",
      tasks: "Tasks",
      services: "Services",
      courses: "Courses",
      messages: "Messages",
      profile: "Profile",
    },
    auth: {
      applications: "My applications",
      login: "Login",
      organizations: "My organizations",
      register: "Register",
      soon: "Coming soon",
      logout: "Logout",
    },
    hero: {
      title: "Your engine for the",
      titleAccent: "professional",
      titleEnd: "future.",
      subtitle:
        "Search jobs, one-time tasks, services and courses in one professional ecosystem.",
      ecosystem: "Connected professional ecosystem",
    },
    nodes: {
      student: {
        title: "Personal Account",
        label: "Explore",
      },
      courses: {
        title: "Courses",
        label: "Grow",
      },
      workers: {
        title: "Jobs",
        label: "Build your career",
      },
      companies: {
        title: "Organizations",
        label: "Publish opportunities",
      },
      freelancers: {
        title: "Services",
        label: "Offer or request",
      },
    },
    search: {
      tabs: {
        jobs: "Jobs",
        tasks: "Tasks",
        services: "Services",
        courses: "Courses",
      },
      what: "What are you looking for?",
      whatPlaceholder: "ex: warehouse logistics",
      location: "Location",
      locationPlaceholder: "ex: Munich",
      category: "Category",
      categoryPlaceholder: "All categories",
      button: "Search",
    },
    sections: {
      activityTitle: "Recent activity",
      activityEmpty: "There is no recent activity available yet.",
      jobsTitle: "Posted jobs",
      coursesTitle: "Active courses",
      viewJobs: "View jobs",
      viewCourses: "View courses",
      jobsEmpty: "There are no published jobs yet.",
      coursesEmpty: "There are no active courses yet.",
      quickTitle: "Continue quickly",
      quickActions: {
        profile: "Complete profile",
        organization: "Create organization",
        jobs: "View jobs",
        task: "Publish task",
      },
    },
    support: {
      unified: "Everything in one place",
      unifiedText: "Jobs, tasks, services and courses.",
      trusted: "Trusted",
      trustedText: "Verified profile, real listings.",
      fast: "Find faster",
      fastText: "Search, filter and apply simply.",
      support: "Support for your success",
      supportText: "Useful resources and opportunities.",
    },
    preview: {
      adminBarTitle: "Admin active",
      adminBarSubtitle: "Quickly access the main RabAI areas.",
      groupLabel: {
        platform: "Platform",
        accounts: "Accounts",
        communication: "Communication",
      },
      previewLabel: {
        personal: "Personal profile",
        organization: "My organizations",
        jobs: "Jobs",
        tasks: "Tasks",
        services: "Services",
        courses: "Courses",
        messages: "Messages",
      },
    },
  },
  de: {
    nav: {
      home: "Start",
      jobs: "Jobs",
      tasks: "Aufträge",
      services: "Dienstleistungen",
      courses: "Kurse",
      messages: "Nachrichten",
      profile: "Profil",
    },
    auth: {
      applications: "Meine Bewerbungen",
      login: "Login",
      organizations: "Meine Organisationen",
      register: "Registrieren",
      soon: "Bald",
      logout: "Logout",
    },
    hero: {
      title: "Dein Motor fuer die",
      titleAccent: "berufliche",
      titleEnd: "Zukunft.",
      subtitle:
        "Suche Jobs, Auftraege, Dienstleistungen und Kurse in einem professionellen Oekosystem.",
      ecosystem: "Verbundenes professionelles Oekosystem",
    },
    nodes: {
      student: {
        title: "Persoenliches Konto",
        label: "Entdecken",
      },
      courses: {
        title: "Kurse",
        label: "Entwickeln",
      },
      workers: {
        title: "Jobs",
        label: "Karriere aufbauen",
      },
      companies: {
        title: "Organisationen",
        label: "Chancen veroeffentlichen",
      },
      freelancers: {
        title: "Dienstleistungen",
        label: "Anbieten oder suchen",
      },
    },
    search: {
      tabs: {
        jobs: "Jobs",
        tasks: "Auftraege",
        services: "Dienstleistungen",
        courses: "Kurse",
      },
      what: "Was suchst du?",
      whatPlaceholder: "z. B. Lagerlogistik",
      location: "Standort",
      locationPlaceholder: "z. B. Muenchen",
      category: "Kategorie",
      categoryPlaceholder: "Alle Kategorien",
      button: "Suchen",
    },
    sections: {
      activityTitle: "Aktuelle Aktivitaet",
      activityEmpty: "Es gibt noch keine aktuelle Aktivitaet.",
      jobsTitle: "Veroeffentlichte Jobs",
      coursesTitle: "Aktive Kurse",
      viewJobs: "Jobs ansehen",
      viewCourses: "Kurse ansehen",
      jobsEmpty: "Derzeit sind keine Jobs veroeffentlicht.",
      coursesEmpty: "Derzeit sind keine Kurse aktiv.",
      quickTitle: "Schnell fortfahren",
      quickActions: {
        profile: "Profil vervollstaendigen",
        organization: "Organisation erstellen",
        jobs: "Jobs ansehen",
        task: "Auftrag veroeffentlichen",
      },
    },
    support: {
      unified: "Alles an einem Ort",
      unifiedText: "Jobs, Auftraege, Dienstleistungen und Kurse.",
      trusted: "Vertrauen",
      trustedText: "Verifiziertes Profil, echte Anzeigen.",
      fast: "Schneller finden",
      fastText: "Suchen, filtern und einfach bewerben.",
      support: "Unterstuetzung fuer deinen Erfolg",
      supportText: "Nuetzliche Ressourcen und Chancen.",
    },
    preview: {
      adminBarTitle: "Admin aktiv",
      adminBarSubtitle: "Greife schnell auf die wichtigsten RabAI-Bereiche zu.",
      groupLabel: {
        platform: "Plattform",
        accounts: "Konten",
        communication: "Kommunikation",
      },
      previewLabel: {
        personal: "Persönliches Profil",
        organization: "Meine Organisationen",
        jobs: "Jobs",
        tasks: "Aufträge",
        services: "Dienstleistungen",
        courses: "Kurse",
        messages: "Nachrichten",
      },
    },
  },
} satisfies Record<LanguageCode, HomeCopy>;

const navItems: { key: NavKey; enabled: boolean; route?: string }[] = [
  { key: "home", enabled: true, route: "/" },
  { key: "jobs", enabled: true, route: "/jobs" },
  { key: "tasks", enabled: true, route: "/tasks" },
  { key: "services", enabled: true, route: "/services" },
  { key: "courses", enabled: true, route: "/courses" },
  { key: "messages", enabled: true, route: "/messages" },
  { key: "profile", enabled: true, route: "/profile" },
];

const publicNavKeys: NavKey[] = ["home", "jobs", "tasks", "services", "courses"];

const adminPreviewGroups: {
  key: AdminGroupKey;
  items: { key: AdminPreviewKey; route: string }[];
}[] = [
  {
    key: "platform",
    items: [
      { key: "jobs", route: "/jobs" },
      { key: "tasks", route: "/tasks" },
      { key: "services", route: "/services" },
      { key: "courses", route: "/courses" },
    ],
  },
  {
    key: "accounts",
    items: [
      { key: "personal", route: "/profile" },
      { key: "organization", route: "/organizations" },
    ],
  },
  {
    key: "communication",
    items: [{ key: "messages", route: "/messages" }],
  },
];

const quickActionItems: { key: QuickActionKey; route: string }[] = [
  { key: "profile", route: "/profile" },
  { key: "organization", route: "/organizations/create" },
  { key: "jobs", route: "/jobs" },
  { key: "task", route: "/tasks/create" },
];

const legacyListingLabels = new Set([
  "worker",
  "worker profile",
  "worker dashboard",
  "student",
  "student profile",
  "freelancer",
  "freelancer mode",
  "business",
  "business account",
  "business dashboard",
  "muncitor",
  "muncitor dashboard",
  "profil muncitor",
]);

const palette = {
  page: Colors.background,
  surface: Colors.surface,
  surfaceSoft: Colors.surfaceMuted,
  ink: Colors.textPrimary,
  text: Colors.textBody,
  muted: Colors.textMuted,
  faint: Colors.textDisabled,
  border: Colors.border,
  borderSoft: Colors.borderMuted,
  blue: Colors.primary,
  blueDeep: Colors.primaryPressed,
  blueSoft: Colors.primarySoft,
  violet: Colors.accent,
  violetSoft: Colors.accentSoft,
  rose: Colors.danger,
  roseSoft: Colors.dangerSurface,
  cyan: Colors.information,
  cyanSoft: Colors.informationSurface,
  disabled: Colors.surfaceDisabled,
} as const;

const layout = {
  headerMaxWidth: 1240,
  contentMaxWidth: 1240,
} as const;

const searchModeCopy = {
  ro: {
    jobs: {
      whatPlaceholder: "ex: logistica depozit",
      locationPlaceholder: "ex: Munchen",
      button: "Cauta joburi",
    },
    tasks: {
      whatPlaceholder: "ex: ajutor la mutare",
      locationPlaceholder: "ex: Augsburg",
      button: "Cauta lucrari",
    },
    courses: {
      whatPlaceholder: "ex: limba germana",
      locationPlaceholder: "ex: online sau Munchen",
      button: "Cauta cursuri",
    },
    services: {
      whatPlaceholder: "ex: electrician",
      locationPlaceholder: "ex: Augsburg",
      button: "Cauta servicii",
    },
  },
  en: {
    jobs: {
      whatPlaceholder: "ex: warehouse logistics",
      locationPlaceholder: "ex: Munich",
      button: "Search jobs",
    },
    tasks: {
      whatPlaceholder: "ex: moving help",
      locationPlaceholder: "ex: Augsburg",
      button: "Search tasks",
    },
    courses: {
      whatPlaceholder: "ex: German language",
      locationPlaceholder: "ex: online or Munich",
      button: "Search courses",
    },
    services: {
      whatPlaceholder: "ex: electrician",
      locationPlaceholder: "ex: Augsburg",
      button: "Search services",
    },
  },
  de: {
    jobs: {
      whatPlaceholder: "z. B. Lagerlogistik",
      locationPlaceholder: "z. B. Muenchen",
      button: "Jobs suchen",
    },
    tasks: {
      whatPlaceholder: "z. B. Umzugshilfe",
      locationPlaceholder: "z. B. Augsburg",
      button: "Auftraege suchen",
    },
    courses: {
      whatPlaceholder: "z. B. Deutschkurs",
      locationPlaceholder: "z. B. online oder Muenchen",
      button: "Kurse suchen",
    },
    services: {
      whatPlaceholder: "z. B. Elektriker",
      locationPlaceholder: "z. B. Augsburg",
      button: "Dienstleistungen suchen",
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
          "linear-gradient(180deg, rgba(5,9,24,0.34) 0%, rgba(5,9,24,0.72) 100%), linear-gradient(90deg, rgba(5,9,24,0.84) 0%, rgba(9,20,48,0.70) 45%, rgba(9,20,48,0.34) 100%), url('/images/rabai-home-hero-background-v001.png')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      } as unknown as ViewStyle)
    : null;
const pageBackgroundWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundColor: palette.page,
      } as unknown as ViewStyle)
    : null;
const glassPanelWebStyle =
  Platform.OS === "web"
    ? Shadows.elevated
    : null;
const searchButtonWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundColor: Colors.primary,
        ...Shadows.button,
      } as unknown as ViewStyle)
    : null;
const searchButtonHoverWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundColor: Colors.primaryHover,
      } as unknown as ViewStyle)
    : null;
const adminBarWebStyle =
  Platform.OS === "web"
    ? ({
        backgroundColor: Colors.textPrimary,
        ...Shadows.elevated,
      } as unknown as ViewStyle)
    : null;
const adminButtonWebStyle =
  Platform.OS === "web"
    ? ({
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
      } as unknown as ViewStyle)
    : null;
const focusRingWebStyle = InteractionStyles.focusRing;
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
  const responsive = useResponsiveLayout();
  const { language, setLanguage } = useLanguage();
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
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [latestJobs, setLatestJobs] = useState<SearchJobResult[]>([]);
  const [latestJobsLoading, setLatestJobsLoading] = useState(true);
  const [latestJobsError, setLatestJobsError] = useState("");
  const [latestCourses, setLatestCourses] = useState<SearchCourseResult[]>([]);
  const [latestCoursesLoading, setLatestCoursesLoading] = useState(true);
  const [latestCoursesError, setLatestCoursesError] = useState("");
  const occupationRequestId = useRef(0);
  const locationRequestId = useRef(0);

  const isCompact = responsive.isMobile || responsive.isTablet;
  const isPhone = responsive.isMobile;
  const contentMaxWidth = Math.min(
    responsive.isLaptop
      ? Math.max(responsive.contentMaxWidth, 1180)
      : responsive.contentMaxWidth,
    layout.contentMaxWidth
  );
  const copy = copyByLanguage[language];
  const activeSearchModeCopy = searchModeCopy[language].jobs;
  const isAuthenticated = authState === "authenticated";
  const listingReturnPath = isAuthenticated ? "/engine" : "/";
  const isAdminUser = Boolean(user?.isAdmin);
  const visibleNavItems = navItems.filter(
    (item) => isAuthenticated || publicNavKeys.includes(item.key)
  );
  const recentJobs = latestJobs.slice(0, 2);
  const recentCourses = latestCourses.slice(0, 2);
  const hasRecentActivity = recentJobs.length > 0 || recentCourses.length > 0;
  const recentActivityLoading =
    !hasRecentActivity && (latestJobsLoading || latestCoursesLoading);
  const recentActivityError = hasRecentActivity
    ? ""
    : latestJobsError || latestCoursesError;

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

    if (trimmedQuery.length < 2) {
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
  }, [language, query]);

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

    if (text.trim().length < 2) {
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

    const queryString = params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
    const searchRoute = `/jobs${queryString ? `?${queryString}` : ""}`;

    router.push(searchRoute as never);
  }

  function handleLogout() {
    if (onLogout) {
      onLogout();
      return;
    }

    router.replace("/" as never);
  }

  return (
    <Screen centered={false} style={[styles.screen, pageBackgroundWebStyle]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: responsive.horizontalPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.header,
            { maxWidth: contentMaxWidth },
            isCompact && styles.headerCompact,
          ]}
        >
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

          <View style={[styles.nav, isCompact && styles.navCompact]}>
            {visibleNavItems.map((item) => {
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

          <View
            style={[
              styles.headerActions,
              isCompact && styles.headerActionsCompact,
            ]}
          >
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
                  <Text numberOfLines={1} style={styles.authSummaryName}>
                    {user?.fullName ||
                      user?.email ||
                      (isAdminUser ? "RabAI admin" : "RabAI account")}
                  </Text>
                  {user?.email ? (
                    <Text numberOfLines={1} style={styles.authSummaryEmail}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.authSummaryActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                  >
                    <Text numberOfLines={1} style={styles.logoutText}>
                      {copy.auth.logout}
                    </Text>
                  </Pressable>
                </View>
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
                    navigate("/login?mode=signup");
                  }}
                  style={styles.registerButton}
                >
                  <Text style={styles.registerText}>{copy.auth.register}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        <View
          style={[
            styles.hero,
            { maxWidth: contentMaxWidth },
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
                setOpenAutocomplete("occupation");
              }}
              onOccupationSelect={(option) => {
                selectOccupationSuggestion(option.suggestion);
              }}
              onQueryChange={handleQueryChange}
              onSubmit={submitSearch}
              openAutocomplete={openAutocomplete}
              occupationActiveIndex={occupationActiveIndex}
              occupationError={occupationError}
              occupationLoading={occupationLoading}
              occupationOptions={occupationOptions}
              query={query}
              reduceMotionEnabled={reduceMotionEnabled}
              searchMode={activeSearchModeCopy}
              searchMaxWidth={contentMaxWidth}
            />
          </View>
        </View>

        {isAdminUser ? (
          <AdminPreviewBar
            copy={copy}
            isCompact={isCompact}
            onNavigate={navigate}
          />
        ) : null}

        <View
          style={[
            styles.sectionsGrid,
            { maxWidth: contentMaxWidth },
            isCompact && styles.sectionsGridCompact,
          ]}
        >
          <PublicSectionCard
            emptyText={copy.sections.activityEmpty}
            errorText={recentActivityError}
            loading={recentActivityLoading}
            title={copy.sections.activityTitle}
          >
            {hasRecentActivity ? (
              <View style={styles.activityStack}>
                {recentJobs.map((job) => (
                  <HomepageJobCard
                    job={job}
                    key={job.job_id}
                    language={language}
                    onPress={() => {
                      router.push(
                        buildJobDetailsPath(job.job_id, listingReturnPath) as never
                      );
                    }}
                  />
                ))}
                {recentCourses.map((course) => (
                  <HomepageCourseCard
                    course={course}
                    key={course.course_id}
                    language={language}
                    onPress={() => {
                      router.push(
                        buildCourseDetailsPath(
                          course.course_id,
                          listingReturnPath
                        ) as never
                      );
                    }}
                  />
                ))}
              </View>
            ) : null}
          </PublicSectionCard>
          <QuickContinuePanel copy={copy} onNavigate={navigate} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function AdminPreviewBar({
  copy,
  isCompact,
  onNavigate,
}: {
  copy: HomeCopy;
  isCompact: boolean;
  onNavigate: (route: string) => void;
}) {
  return (
    <View
      style={[
        styles.adminBar,
        adminBarWebStyle,
        isCompact && styles.adminBarCompact,
      ]}
    >
      <View style={styles.adminBarTextWrap}>
        <View style={styles.adminBarTitleRow}>
          <Text style={styles.adminBarTitle}>{copy.preview.adminBarTitle}</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Administrator</Text>
          </View>
        </View>
        <Text style={styles.adminBarSubtitle}>
          {copy.preview.adminBarSubtitle}
        </Text>
      </View>

      <View style={styles.adminConsoleGroups}>
        {adminPreviewGroups.map((group) => (
          <View key={group.key} style={styles.adminConsoleGroup}>
            <Text numberOfLines={1} style={styles.adminConsoleGroupTitle}>
              {copy.preview.groupLabel[group.key]}
            </Text>
            <View style={styles.adminConsoleLinks}>
              {group.items.map((item) => (
                <Pressable
                  accessibilityRole="button"
                  key={item.key}
                  onPress={() => onNavigate(item.route)}
                  style={(state) => {
                    const webState = state as WebPressableState;

                    return [
                      styles.adminButton,
                      adminButtonWebStyle,
                      isCompact && styles.adminButtonCompact,
                      webState.hovered && styles.adminButtonHover,
                      webState.focused && styles.adminButtonFocus,
                      webState.focused && focusRingWebStyle,
                      webState.pressed && styles.adminButtonPressed,
                    ];
                  }}
                >
                  <Text numberOfLines={1} style={styles.adminButtonText}>
                    {copy.preview.previewLabel[item.key]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function HeroSearchControls({
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
  openAutocomplete,
  query,
  reduceMotionEnabled,
  searchMode,
  searchMaxWidth,
}: {
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
  openAutocomplete: AutocompleteTarget;
  query: string;
  reduceMotionEnabled: boolean;
  searchMode: {
    whatPlaceholder: string;
    locationPlaceholder: string;
    button: string;
  };
  searchMaxWidth: number;
}) {
  return (
    <View
      style={[
        styles.heroSearchPanel,
        { maxWidth: Math.min(searchMaxWidth, 1120) },
        isPhone && styles.heroSearchPanelPhone,
      ]}
    >
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
          suggestions={occupationOptions}
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
          <Text style={styles.searchButtonText}>{copy.search.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuickContinuePanel({
  copy,
  onNavigate,
}: {
  copy: HomeCopy;
  onNavigate: (route: string) => void;
}) {
  return (
    <View style={[styles.sectionCard, styles.quickPanel]}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{copy.sections.quickTitle}</Text>
        </View>
      </View>

      <View style={styles.quickActionGrid}>
        {quickActionItems.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.key}
            onPress={() => {
              onNavigate(item.route);
            }}
            style={(state) => {
              const webState = state as WebPressableState;

              return [
                styles.quickActionCard,
                webState.hovered && styles.quickActionCardHover,
                webState.focused && styles.quickActionCardFocus,
                webState.focused && focusRingWebStyle,
                webState.pressed && styles.quickActionCardPressed,
              ];
            }}
          >
            <Text numberOfLines={2} style={styles.quickActionText}>
              {copy.sections.quickActions[item.key]}
            </Text>
          </Pressable>
        ))}
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
  actionLabel?: string;
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

        {actionLabel ? (
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
              <Text numberOfLines={1} style={styles.sectionSoon}>
                {disabledLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
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

function HomepageJobCard({
  job,
  language,
  onPress,
}: {
  job: SearchJobResult;
  language: LanguageCode;
  onPress: () => void;
}) {
  const salary = formatJobSalary(job);
  const contract = formatEmploymentType(job.employment_type);
  const locationLabel =
    job.location_label || [job.postal_code, job.city, job.state].filter(Boolean).join(" ");
  const title = sanitizeLegacyWorkerLabel(job.title, "Rol profesional");
  const date = formatDateLabel(job.published_at, language);

  return (
    <Pressable
      accessibilityLabel={`Vezi jobul ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const webState = state as WebPressableState;

        return [
          styles.listingCard,
          webState.hovered && styles.listingCardHover,
          webState.focused && styles.listingCardFocus,
          webState.focused && focusRingWebStyle,
          webState.pressed && styles.listingCardPressed,
        ];
      }}
    >
      <View style={styles.listingCardBody}>
        <View style={styles.listingCardHeader}>
          <Text numberOfLines={2} style={styles.listingTitle}>
            {title}
          </Text>
          {date ? (
            <Text numberOfLines={1} style={styles.listingDate}>
              {date}
            </Text>
          ) : null}
        </View>

        <Text numberOfLines={1} style={styles.listingPrimaryMeta}>
          {job.company_name}
        </Text>
        {locationLabel ? (
          <Text numberOfLines={1} style={styles.listingSecondaryMeta}>
            {locationLabel}
          </Text>
        ) : null}

        <View style={styles.listingMetaRow}>
          {salary ? <ListingPill value={salary} /> : null}
          {contract ? <ListingPill value={contract} /> : null}
        </View>
      </View>

      <View style={styles.listingFooter}>
        <View style={styles.listingButton}>
          <Text numberOfLines={1} style={styles.listingButtonText}>
            Vezi jobul
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function HomepageCourseCard({
  course,
  language,
  onPress,
}: {
  course: SearchCourseResult;
  language: LanguageCode;
  onPress: () => void;
}) {
  const date = formatDateLabel(course.start_date, language);
  const deliveryMode = formatDeliveryMode(course.delivery_mode);
  const price = formatCoursePrice(course);

  return (
    <Pressable
      accessibilityLabel={`Vezi cursul ${course.title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const webState = state as WebPressableState;

        return [
          styles.listingCard,
          webState.hovered && styles.listingCardHover,
          webState.focused && styles.listingCardFocus,
          webState.focused && focusRingWebStyle,
          webState.pressed && styles.listingCardPressed,
        ];
      }}
    >
      <View style={styles.listingCardBody}>
        <View style={styles.listingCardHeader}>
          <Text numberOfLines={2} style={styles.listingTitle}>
            {sanitizeLegacyWorkerLabel(course.title, "Curs profesional")}
          </Text>
          {date ? (
            <Text numberOfLines={1} style={styles.listingDate}>
              {date}
            </Text>
          ) : null}
        </View>

        <Text numberOfLines={1} style={styles.listingPrimaryMeta}>
          {course.provider_name}
        </Text>
        {course.location_label ? (
          <Text numberOfLines={1} style={styles.listingSecondaryMeta}>
            {course.location_label}
          </Text>
        ) : null}

        <View style={styles.listingMetaRow}>
          {deliveryMode ? <ListingPill value={deliveryMode} /> : null}
          {price ? <ListingPill value={price} /> : null}
        </View>
      </View>

      <View style={styles.listingFooter}>
        <View style={styles.listingButton}>
          <Text numberOfLines={1} style={styles.listingButtonText}>
            Vezi cursul
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function ListingPill({ value }: { value: string }) {
  return (
    <View style={styles.listingPill}>
      <Text numberOfLines={1} style={styles.listingPillText}>
        {value}
      </Text>
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

function sanitizeLegacyWorkerLabel(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  return legacyListingLabels.has(normalized.toLocaleLowerCase("en-US"))
    ? fallback
    : normalized;
}

function formatJobSalary(job: SearchJobResult) {
  if (job.salary_from === null && job.salary_to === null) {
    return "";
  }

  const suffix = formatSalaryType(job.salary_type);

  if (job.salary_from !== null && job.salary_to !== null) {
    return `${formatNumber(job.salary_from)}-${formatNumber(job.salary_to)} EUR ${suffix}`;
  }

  if (job.salary_from !== null) {
    return `de la ${formatNumber(job.salary_from)} EUR ${suffix}`;
  }

  return `pana la ${formatNumber(job.salary_to)} EUR ${suffix}`;
}

function formatSalaryType(value: string) {
  if (value === "hourly") {
    return "/ ora";
  }

  if (value === "yearly") {
    return "/ an";
  }

  if (value === "fixed") {
    return "fix";
  }

  return "/ luna";
}

function formatEmploymentType(value: string | null) {
  if (value === "full_time") {
    return "Full-time";
  }

  if (value === "part_time") {
    return "Part-time";
  }

  if (value === "mini_job") {
    return "Mini job";
  }

  if (value === "temporary") {
    return "Temporar";
  }

  if (value === "freelance") {
    return "Freelance";
  }

  return "";
}

function formatDeliveryMode(value: string | null) {
  if (value === "online") {
    return "Online";
  }

  if (value === "onsite") {
    return "La locatie";
  }

  if (value === "hybrid") {
    return "Hibrid";
  }

  return "";
}

function formatCoursePrice(course: SearchCourseResult) {
  if (course.price_amount === null) {
    return "";
  }

  return `${formatNumber(course.price_amount)} ${course.currency_code ?? "EUR"}`;
}

function formatNumber(value: number | null) {
  return value === null
    ? ""
    : new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: 0,
      }).format(value);
}

function formatDateLabel(value: string | null, language: LanguageCode) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const locale =
    language === "de" ? "de-DE" : language === "en" ? "en-US" : "ro-RO";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
    padding: 0,
  },
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: Radius.xl,
    borderColor: palette.borderSoft,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "space-between",
    maxWidth: layout.headerMaxWidth,
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.sm,
    ...Shadows.elevated,
    width: "100%",
    elevation: 4,
  },
  headerCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  brand: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: Spacing.sm,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: palette.blue,
    borderColor: "rgba(255, 255, 255, 0.70)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    ...Shadows.button,
    width: 38,
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
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  nav: {
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
    justifyContent: "center",
    minWidth: 0,
  },
  navCompact: {
    alignItems: "stretch",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  navButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: Radius.round,
    borderWidth: 1,
    flexShrink: 1,
    height: 38,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  navButtonActive: {
    backgroundColor: palette.blueSoft,
    borderColor: "rgba(20, 92, 255, 0.18)",
  },
  navButtonDisabled: {
    opacity: 0.74,
  },
  navText: {
    color: palette.text,
    fontSize: 13,
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
    flexShrink: 0,
    flexWrap: "nowrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  headerActionsCompact: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  languageSelector: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
  },
  languageButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderColor: palette.borderSoft,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    padding: 0,
    width: 54,
  },
  languageButtonActive: {
    borderColor: palette.blue,
    ...Shadows.button,
  },
  authSummary: {
    alignItems: "center",
    backgroundColor: "rgba(247, 250, 255, 0.94)",
    borderColor: "rgba(218, 227, 245, 0.90)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.sm,
    height: 42,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
  },
  authSummaryTextWrap: {
    alignItems: "flex-start",
    maxWidth: 146,
    minWidth: 88,
  },
  authSummaryName: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },
  authSummaryEmail: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 1,
  },
  authSummaryActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
  },
  accountActionButton: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    height: 34,
    minWidth: 112,
    paddingHorizontal: Spacing.md,
  },
  accountActionText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    minHeight: 42,
    minWidth: 106,
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
    borderRadius: Radius.round,
    minHeight: 42,
    minWidth: 132,
    paddingHorizontal: Spacing.three,
    justifyContent: "center",
  },
  registerText: {
    color: palette.surface,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 241, 246, 0.92)",
    borderColor: "rgba(240, 19, 99, 0.18)",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    height: 34,
    minWidth: 82,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    color: palette.rose,
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  hero: {
    alignSelf: "center",
    borderRadius: 28,
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    minHeight: 540,
    overflow: "visible",
    position: "relative",
    width: "100%",
  },
  heroCompact: {
    minHeight: 520,
  },
  heroPhone: {
    minHeight: 600,
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
    backgroundColor: "rgba(6, 10, 25, 0.46)",
  },
  heroLeftOverlay: {
    backgroundColor: "rgba(6, 10, 25, 0.42)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: "62%",
  },
  heroCenterOverlay: {
    backgroundColor: "rgba(6, 10, 25, 0.18)",
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
    minHeight: 540,
    paddingHorizontal: Spacing.eight,
    paddingVertical: 56,
    zIndex: 1,
  },
  heroContentCompact: {
    minHeight: 520,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.six,
  },
  heroContentPhone: {
    minHeight: 600,
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
    marginBottom: Spacing.md,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: palette.surface,
    fontSize: 52,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
    lineHeight: 60,
    maxWidth: 900,
    textAlign: "center",
  },
  heroTitleCompact: {
    fontSize: 44,
    lineHeight: 52,
  },
  heroTitlePhone: {
    fontSize: 34,
    lineHeight: 40,
  },
  heroTitleAccent: {
    color: palette.cyan,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.94)",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: 26,
    marginTop: Spacing.xxl,
    maxWidth: 680,
    textAlign: "center",
  },
  heroSubtitlePhone: {
    fontSize: Typography.body,
    lineHeight: 24,
  },
  adminBar: {
    alignSelf: "center",
    alignItems: "stretch",
    backgroundColor: palette.ink,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.lg,
    justifyContent: "space-between",
    marginTop: Spacing.three,
    maxWidth: layout.contentMaxWidth,
    padding: Spacing.lg,
    ...Shadows.floating,
    width: "100%",
    elevation: 5,
  },
  adminBarCompact: {
    flexDirection: "column",
  },
  adminBarTextWrap: {
    flex: 0.68,
    minWidth: 220,
  },
  adminBarTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  adminBarTitle: {
    color: palette.surface,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  adminBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 26,
    paddingHorizontal: Spacing.md,
  },
  adminBadgeText: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 11,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
  },
  adminBarSubtitle: {
    color: "rgba(255, 255, 255, 0.70)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  adminConsoleGroups: {
    alignItems: "stretch",
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  adminConsoleGroup: {
    backgroundColor: "rgba(255, 255, 255, 0.075)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexBasis: 218,
    flexGrow: 1,
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  adminConsoleGroupTitle: {
    color: "rgba(255, 255, 255, 0.66)",
    fontSize: 11,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0,
    paddingHorizontal: Spacing.xs,
    textTransform: "uppercase",
  },
  adminConsoleLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  adminButtonRow: {
    alignItems: "center",
    flex: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    justifyContent: "flex-end",
  },
  adminButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: Radius.round,
    borderWidth: 1,
    flexBasis: 112,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
  },
  adminButtonCompact: {
    flexBasis: 118,
    flexGrow: 1,
  },
  adminButtonActive: {
    backgroundColor: palette.blueSoft,
    borderColor: palette.blue,
  },
  adminButtonHover: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.26)",
  },
  adminButtonFocus: {
    borderColor: "rgba(24, 199, 223, 0.82)",
  },
  adminButtonPressed: {
    opacity: 0.88,
  },
  adminButtonText: {
    color: palette.surface,
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
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
    marginTop: Spacing.six,
    maxWidth: 1000,
    overflow: "visible",
    width: "100%",
    zIndex: 20,
  },
  heroSearchPanelPhone: {
    marginTop: Spacing.five,
  },
  heroSearchFields: {
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    borderColor: "rgba(255, 255, 255, 0.56)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    padding: Spacing.md,
    ...Shadows.floating,
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
    minHeight: 52,
    minWidth: 158,
    ...Shadows.button,
    elevation: 5,
  },
  heroSearchButtonHover: {},
  heroSearchButtonFocus: {
    borderColor: "rgba(24, 199, 223, 0.86)",
  },
  heroSearchButtonPressed: {
    opacity: 0.92,
  },
  heroSearchButtonPhone: {
    alignSelf: "stretch",
    width: "100%",
  },
  heroCategories: {
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
    justifyContent: "center",
    marginTop: Spacing.xxl,
    maxWidth: 720,
    width: "100%",
  },
  heroCategoriesPhone: {
    alignSelf: "stretch",
    flexWrap: "wrap",
  },
  heroCategory: {
    alignItems: "center",
    backgroundColor: "rgba(8, 14, 34, 0.48)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: Radius.round,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
    ...Shadows.card,
  },
  heroCategoryPhone: {
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "100%",
    minWidth: 0,
    width: "47%",
  },
  heroCategoryActive: {
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    borderColor: "rgba(255, 255, 255, 0.82)",
  },
  heroCategoryHover: {
    backgroundColor: "rgba(12, 24, 54, 0.42)",
    borderColor: "rgba(255, 255, 255, 0.34)",
  },
  heroCategoryHoverLift: {},
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
    color: palette.blueDeep,
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
    borderRadius: Radius.round,
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
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginTop: Spacing.four,
    maxWidth: layout.contentMaxWidth,
    width: "100%",
  },
  sectionsGridCompact: {
    flexDirection: "column",
  },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderColor: "rgba(218, 227, 245, 0.78)",
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    padding: Spacing.four,
    ...Shadows.card,
    elevation: 2,
  },
  sectionCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    flex: 1,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: 0,
  },
  sectionAction: {
    alignItems: "center",
    backgroundColor: "rgba(233, 240, 255, 0.82)",
    borderColor: "rgba(20, 92, 255, 0.14)",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 132,
    paddingHorizontal: Spacing.md,
    paddingVertical: 0,
  },
  sectionActionText: {
    color: palette.blueDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
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
    marginTop: Spacing.three,
  },
  latestJobsGridSingle: {
    maxWidth: 420,
  },
  activityStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.three,
  },
  quickPanel: {
    flex: 0.74,
    minWidth: 0,
  },
  quickActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.three,
  },
  quickActionCard: {
    alignItems: "flex-start",
    backgroundColor: "rgba(248, 251, 255, 0.96)",
    borderColor: "rgba(218, 227, 245, 0.82)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 76,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.card,
    elevation: 1,
  },
  quickActionCardHover: {
    backgroundColor: palette.surface,
    borderColor: "rgba(20, 92, 255, 0.24)",
    transform: [{ translateY: -1 }],
  },
  quickActionCardFocus: {
    borderColor: palette.blue,
  },
  quickActionCardPressed: {
    transform: [{ translateY: 0 }],
  },
  quickActionText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: 19,
  },
  listingCard: {
    backgroundColor: "rgba(248, 251, 255, 0.96)",
    borderColor: "rgba(218, 227, 245, 0.76)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexBasis: 238,
    flexGrow: 1,
    justifyContent: "space-between",
    minHeight: 194,
    padding: Spacing.lg,
    ...Shadows.card,
    elevation: 1,
  },
  listingCardHover: {
    backgroundColor: palette.surface,
    borderColor: "rgba(20, 92, 255, 0.26)",
    transform: [{ translateY: -1 }],
  },
  listingCardFocus: {
    borderColor: palette.blue,
  },
  listingCardPressed: {
    transform: [{ translateY: 0 }],
  },
  listingCardBody: {
    gap: Spacing.sm,
  },
  listingCardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "space-between",
  },
  listingTitle: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 22,
  },
  listingDate: {
    color: palette.faint,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
    textAlign: "right",
  },
  listingPrimaryMeta: {
    color: palette.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  listingSecondaryMeta: {
    color: palette.muted,
    fontSize: Typography.small,
  },
  listingMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  listingPill: {
    backgroundColor: palette.surface,
    borderColor: "rgba(218, 227, 245, 0.90)",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 30,
    paddingHorizontal: Spacing.md,
  },
  listingPillText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: Typography.fontWeight.bold,
  },
  listingFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Spacing.lg,
  },
  listingButton: {
    alignItems: "center",
    backgroundColor: palette.blue,
    borderRadius: Radius.round,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 106,
    paddingHorizontal: Spacing.md,
  },
  listingButtonText: {
    color: palette.surface,
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
  },
  sectionStatusState: {
    backgroundColor: "rgba(255, 240, 246, 0.48)",
    borderColor: "rgba(240, 19, 99, 0.16)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.three,
    padding: Spacing.three,
  },
  sectionErrorText: {
    color: palette.rose,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  jobSkeletonCard: {
    backgroundColor: "rgba(243, 247, 255, 0.90)",
    borderColor: "rgba(218, 227, 245, 0.76)",
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
    backgroundColor: "rgba(243, 247, 255, 0.88)",
    borderColor: "rgba(218, 227, 245, 0.76)",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.three,
    minHeight: 124,
    padding: Spacing.three,
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
    lineHeight: 20,
    textAlign: "center",
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
    ...Shadows.card,
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


