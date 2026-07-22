import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import PublicHeader from "@/components/navigation/PublicHeader";
import {
  EmptyState,
  ErrorState,
  ListingRow,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  Section,
} from "@/components/ui";
import type { AuthRole } from "@/domain/auth/auth.types";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { languages } from "@/i18n/translations";
import { buildCourseDetailsPath } from "@/services/courses/courseNavigation";
import {
  fetchLatestPublishedCourses,
  type SearchCourseResult,
} from "@/services/courses/courseService";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
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
import {
  Breakpoints,
  Colors,
  Layers,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

type AutocompleteTarget = "occupation" | "location" | null;

type OccupationAutocompleteOption = HeroAutocompleteOption & {
  suggestion: OccupationSuggestion;
};

type LocationAutocompleteOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

type EcosystemKey =
  | "jobs"
  | "courses"
  | "services"
  | "organizations"
  | "progress";

type HomeCopy = {
  eyebrow: string;
  title: string;
  description: string;
  languageLabel: string;
  search: {
    title: string;
    description: string;
    occupationLabel: string;
    occupationPlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    submit: string;
    loading: string;
    noResults: string;
    occupationError: string;
    locationError: string;
    locationSelectionRequired: string;
  };
  ecosystem: {
    title: string;
    description: string;
    items: Record<
      EcosystemKey,
      { action: string; description: string; eyebrow: string; title: string }
    >;
  };
  latest: {
    jobsTitle: string;
    jobsDescription: string;
    jobsAction: string;
    jobsEmpty: string;
    jobsError: string;
    coursesTitle: string;
    coursesDescription: string;
    coursesAction: string;
    coursesEmpty: string;
    coursesError: string;
    loadingJobs: string;
    loadingCourses: string;
    retry: string;
    viewJob: string;
    viewCourse: string;
  };
};

const copyByLanguage = {
  ro: {
    eyebrow: "Ecosistem profesional conectat",
    title: "Munca, învățarea și organizațiile tale, într-un singur loc.",
    description:
      "RabAI te ajută să găsești oportunități reale, să-ți dezvolți profilul profesional și să lucrezi mai clar cu organizațiile din ecosistem.",
    languageLabel: "Limba interfeței",
    search: {
      title: "Caută o oportunitate",
      description:
        "Pornește de la ocupație și locație. Selecțiile păstrează identificatorii reali folosiți de căutarea RabAI.",
      occupationLabel: "Ocupație",
      occupationPlaceholder: "ex: logistică, electrician, șofer",
      locationLabel: "Locație",
      locationPlaceholder: "ex: Augsburg sau München",
      submit: "Caută joburi",
      loading: "Se caută…",
      noResults: "Nu am găsit rezultate.",
      occupationError: "Ocupațiile nu au putut fi încărcate momentan.",
      locationError: "Locațiile nu au putut fi încărcate momentan.",
      locationSelectionRequired: "Alege locația din lista de sugestii.",
    },
    ecosystem: {
      title: "Un parcurs profesional coerent",
      description:
        "Fiecare zonă are un rol clar. Accesezi date reale, fără statistici sau promisiuni inventate.",
      items: {
        jobs: {
          action: "Vezi joburile",
          description:
            "Explorează roluri publicate de organizații și aplică folosind profilul tău RabAI.",
          eyebrow: "Oportunități",
          title: "Locuri de muncă",
        },
        courses: {
          action: "Vezi cursurile",
          description:
            "Descoperă programe active și urmărește starea reală a înscrierilor tale.",
          eyebrow: "Învățare",
          title: "Cursuri profesionale",
        },
        services: {
          action: "Vezi serviciile",
          description:
            "Găsește zona dedicată serviciilor fără a afișa oferte care nu există în backend.",
          eyebrow: "Colaborare",
          title: "Servicii",
        },
        organizations: {
          action: "Vezi organizațiile",
          description:
            "Creează sau administrează profilul unei organizații și oportunitățile publicate de ea.",
          eyebrow: "Echipe",
          title: "Organizații",
        },
        progress: {
          action: "Creează un cont",
          description:
            "Păstrează profilul, aplicațiile și înscrierile într-un parcurs profesional continuu.",
          eyebrow: "Dezvoltare",
          title: "Progres profesional",
        },
      },
    },
    latest: {
      jobsTitle: "Joburi publicate recent",
      jobsDescription: "O selecție din anunțurile active disponibile acum.",
      jobsAction: "Toate joburile",
      jobsEmpty: "Momentan nu există joburi publicate.",
      jobsError: "Joburile recente nu au putut fi încărcate.",
      coursesTitle: "Cursuri active",
      coursesDescription: "Programe reale publicate de furnizori RabAI.",
      coursesAction: "Toate cursurile",
      coursesEmpty: "Momentan nu există cursuri active.",
      coursesError: "Cursurile active nu au putut fi încărcate.",
      loadingJobs: "Se încarcă joburile…",
      loadingCourses: "Se încarcă cursurile…",
      retry: "Încearcă din nou",
      viewJob: "Vezi jobul",
      viewCourse: "Vezi cursul",
    },
  },
  en: {
    eyebrow: "A connected professional ecosystem",
    title: "Work, learning, and organizations in one clear place.",
    description:
      "RabAI helps you find real opportunities, develop your professional profile, and work more clearly with organizations across the ecosystem.",
    languageLabel: "Interface language",
    search: {
      title: "Find an opportunity",
      description:
        "Start with an occupation and location. Selections preserve the real identifiers used by RabAI search.",
      occupationLabel: "Occupation",
      occupationPlaceholder: "e.g. logistics, electrician, driver",
      locationLabel: "Location",
      locationPlaceholder: "e.g. Augsburg or Munich",
      submit: "Search jobs",
      loading: "Searching…",
      noResults: "No results found.",
      occupationError: "Occupations could not be loaded right now.",
      locationError: "Locations could not be loaded right now.",
      locationSelectionRequired: "Choose a location from the suggestions.",
    },
    ecosystem: {
      title: "One coherent professional journey",
      description:
        "Each area has a clear role. You access real data without invented statistics or promises.",
      items: {
        jobs: {
          action: "View jobs",
          description:
            "Explore roles published by organizations and apply with your RabAI profile.",
          eyebrow: "Opportunities",
          title: "Jobs",
        },
        courses: {
          action: "View courses",
          description:
            "Discover active programs and follow the real status of your enrollments.",
          eyebrow: "Learning",
          title: "Professional courses",
        },
        services: {
          action: "View services",
          description:
            "Open the services area without displaying offers that do not exist in the backend.",
          eyebrow: "Collaboration",
          title: "Services",
        },
        organizations: {
          action: "View organizations",
          description:
            "Create or manage an organization profile and the opportunities it publishes.",
          eyebrow: "Teams",
          title: "Organizations",
        },
        progress: {
          action: "Create an account",
          description:
            "Keep your profile, applications, and enrollments in one continuous professional journey.",
          eyebrow: "Development",
          title: "Professional progress",
        },
      },
    },
    latest: {
      jobsTitle: "Recently published jobs",
      jobsDescription: "A selection from the active listings available now.",
      jobsAction: "All jobs",
      jobsEmpty: "There are no published jobs right now.",
      jobsError: "Recent jobs could not be loaded.",
      coursesTitle: "Active courses",
      coursesDescription: "Real programs published by RabAI providers.",
      coursesAction: "All courses",
      coursesEmpty: "There are no active courses right now.",
      coursesError: "Active courses could not be loaded.",
      loadingJobs: "Loading jobs…",
      loadingCourses: "Loading courses…",
      retry: "Try again",
      viewJob: "View job",
      viewCourse: "View course",
    },
  },
  de: {
    eyebrow: "Ein vernetztes berufliches Ökosystem",
    title: "Arbeit, Lernen und Organisationen an einem klaren Ort.",
    description:
      "RabAI hilft dir, echte Möglichkeiten zu finden, dein berufliches Profil zu entwickeln und klarer mit Organisationen zusammenzuarbeiten.",
    languageLabel: "Sprache der Oberfläche",
    search: {
      title: "Eine Möglichkeit finden",
      description:
        "Beginne mit Beruf und Ort. Auswahlen behalten die echten Kennungen der RabAI-Suche bei.",
      occupationLabel: "Beruf",
      occupationPlaceholder: "z. B. Logistik, Elektriker, Fahrer",
      locationLabel: "Ort",
      locationPlaceholder: "z. B. Augsburg oder München",
      submit: "Jobs suchen",
      loading: "Suche läuft…",
      noResults: "Keine Ergebnisse gefunden.",
      occupationError: "Berufe konnten derzeit nicht geladen werden.",
      locationError: "Orte konnten derzeit nicht geladen werden.",
      locationSelectionRequired: "Wähle einen Ort aus den Vorschlägen.",
    },
    ecosystem: {
      title: "Ein zusammenhängender beruflicher Weg",
      description:
        "Jeder Bereich hat eine klare Aufgabe. Du greifst auf echte Daten ohne erfundene Statistiken zu.",
      items: {
        jobs: {
          action: "Jobs ansehen",
          description:
            "Entdecke Stellen von Organisationen und bewirb dich mit deinem RabAI-Profil.",
          eyebrow: "Möglichkeiten",
          title: "Jobs",
        },
        courses: {
          action: "Kurse ansehen",
          description:
            "Entdecke aktive Programme und verfolge den echten Status deiner Anmeldungen.",
          eyebrow: "Lernen",
          title: "Berufliche Kurse",
        },
        services: {
          action: "Dienste ansehen",
          description:
            "Öffne den Dienstebereich, ohne Angebote anzuzeigen, die im Backend nicht existieren.",
          eyebrow: "Zusammenarbeit",
          title: "Dienstleistungen",
        },
        organizations: {
          action: "Organisationen ansehen",
          description:
            "Erstelle oder verwalte ein Organisationsprofil und seine veröffentlichten Möglichkeiten.",
          eyebrow: "Teams",
          title: "Organisationen",
        },
        progress: {
          action: "Konto erstellen",
          description:
            "Halte Profil, Bewerbungen und Anmeldungen in einem fortlaufenden Weg zusammen.",
          eyebrow: "Entwicklung",
          title: "Beruflicher Fortschritt",
        },
      },
    },
    latest: {
      jobsTitle: "Kürzlich veröffentlichte Jobs",
      jobsDescription: "Eine Auswahl der derzeit aktiven Anzeigen.",
      jobsAction: "Alle Jobs",
      jobsEmpty: "Derzeit sind keine Jobs veröffentlicht.",
      jobsError: "Aktuelle Jobs konnten nicht geladen werden.",
      coursesTitle: "Aktive Kurse",
      coursesDescription: "Echte Programme von RabAI-Anbietern.",
      coursesAction: "Alle Kurse",
      coursesEmpty: "Derzeit sind keine aktiven Kurse verfügbar.",
      coursesError: "Aktive Kurse konnten nicht geladen werden.",
      loadingJobs: "Jobs werden geladen…",
      loadingCourses: "Kurse werden geladen…",
      retry: "Erneut versuchen",
      viewJob: "Job ansehen",
      viewCourse: "Kurs ansehen",
    },
  },
} satisfies Record<LanguageCode, HomeCopy>;

const ecosystemRoutes: Record<EcosystemKey, string> = {
  jobs: "/jobs",
  courses: "/courses",
  services: "/services",
  organizations: "/organizations",
  progress: "/login?mode=signup",
};

const ecosystemOrder: EcosystemKey[] = [
  "jobs",
  "courses",
  "services",
  "organizations",
  "progress",
];

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

export default function RabaiHomePage({ authState }: RabaiHomePageProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { width } = useWindowDimensions();
  const copy = copyByLanguage[language];
  const isCompact = width < Breakpoints.tablet;
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
  const [latestJobs, setLatestJobs] = useState<SearchJobResult[]>([]);
  const [latestJobsLoading, setLatestJobsLoading] = useState(true);
  const [latestJobsError, setLatestJobsError] = useState(false);
  const [latestCourses, setLatestCourses] = useState<SearchCourseResult[]>([]);
  const [latestCoursesLoading, setLatestCoursesLoading] = useState(true);
  const [latestCoursesError, setLatestCoursesError] = useState(false);
  const occupationRequestId = useRef(0);
  const locationRequestId = useRef(0);
  const latestJobsRequestId = useRef(0);
  const latestCoursesRequestId = useRef(0);
  const listingReturnPath = authState === "authenticated" ? "/engine" : "/";

  const loadLatestJobs = useCallback(async () => {
    const requestId = ++latestJobsRequestId.current;
    setLatestJobsLoading(true);
    setLatestJobsError(false);

    try {
      const jobs = await fetchLatestPublishedJobs(2);
      if (latestJobsRequestId.current === requestId) {
        setLatestJobs(jobs);
      }
    } catch {
      if (latestJobsRequestId.current === requestId) {
        setLatestJobs([]);
        setLatestJobsError(true);
      }
    } finally {
      if (latestJobsRequestId.current === requestId) {
        setLatestJobsLoading(false);
      }
    }
  }, []);

  const loadLatestCourses = useCallback(async () => {
    const requestId = ++latestCoursesRequestId.current;
    setLatestCoursesLoading(true);
    setLatestCoursesError(false);

    try {
      const courses = await fetchLatestPublishedCourses(2);
      if (latestCoursesRequestId.current === requestId) {
        setLatestCourses(courses);
      }
    } catch {
      if (latestCoursesRequestId.current === requestId) {
        setLatestCourses([]);
        setLatestCoursesError(true);
      }
    } finally {
      if (latestCoursesRequestId.current === requestId) {
        setLatestCoursesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadLatestJobs();
      void loadLatestCourses();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      latestJobsRequestId.current += 1;
      latestCoursesRequestId.current += 1;
    };
  }, [loadLatestCourses, loadLatestJobs]);

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
          if (occupationRequestId.current === requestId) {
            setOccupationSuggestions([]);
            setOccupationActiveIndex(-1);
            setOccupationError(copy.search.occupationError);
          }
        })
        .finally(() => {
          if (occupationRequestId.current === requestId) {
            setOccupationLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [copy.search.occupationError, language, query]);

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
          if (locationRequestId.current === requestId) {
            setLocationSuggestions([]);
            setLocationActiveIndex(-1);
            setLocationError(copy.search.locationError);
          }
        })
        .finally(() => {
          if (locationRequestId.current === requestId) {
            setLocationLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [copy.search.locationError, location]);

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
      return;
    }

    setOccupationError(null);
    setOpenAutocomplete("occupation");
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
      return;
    }

    setLocationError(null);
    setOpenAutocomplete("location");
  }

  function submitSearch() {
    const params: [string, string][] = [];
    const trimmedQuery = query.trim();
    const trimmedLocation = location.trim();

    if (
      trimmedLocation &&
      (!selectedLocation || trimmedLocation !== selectedLocation.label)
    ) {
      setLocationError(copy.search.locationSelectionRequired);
      setOpenAutocomplete("location");
      return;
    }

    function addParam(key: string, value?: string | number | null) {
      if (value === null || value === undefined) {
        return;
      }

      const normalizedValue = String(value).trim();
      if (normalizedValue) {
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
    }

    const queryString = params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    router.push(`/jobs${queryString ? `?${queryString}` : ""}` as never);
  }

  return (
    <PageContainer
      contentStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
      maxWidth="wide"
      scroll
    >
      <PublicHeader active="home" />

      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>{copy.languageLabel}</Text>
        <View accessibilityRole="radiogroup" style={styles.languageActions}>
          {languages.map((item) => (
            <RabAIButton
              accessibilityRole="radio"
              accessibilityState={{ checked: language === item.code }}
              key={item.code}
              onPress={() => setLanguage(item.code)}
              size="sm"
              title={item.code.toUpperCase()}
              variant={language === item.code ? "secondary" : "ghost"}
            />
          ))}
        </View>
      </View>

      <View style={styles.intro}>
        <View style={styles.introAccent} />
        <PageHeader
          description={copy.description}
          eyebrow={copy.eyebrow}
          style={styles.introHeader}
          title={copy.title}
        />
      </View>

      <Section
        description={copy.search.description}
        title={copy.search.title}
      >
        <View
          style={[
            styles.searchSurface,
            isCompact && styles.searchSurfaceCompact,
          ]}
        >
          <View
            style={[
              styles.searchFields,
              isCompact && styles.searchFieldsCompact,
            ]}
          >
            <HeroAutocompleteField
              activeIndex={occupationActiveIndex}
              containerStyle={styles.searchField}
              dropdownMode={isCompact ? "inline" : "overlay"}
              emptyMessage={copy.search.noResults}
              errorMessage={occupationError}
              fieldId="hero-occupation-search"
              isOpen={
                openAutocomplete === "occupation" && query.trim().length >= 2
              }
              label={copy.search.occupationLabel}
              loading={occupationLoading}
              loadingLabel={copy.search.loading}
              onActiveIndexChange={setOccupationActiveIndex}
              onChangeText={handleQueryChange}
              onFocus={() => setOpenAutocomplete("occupation")}
              onRequestClose={() => setOpenAutocomplete(null)}
              onSelect={(option) => {
                setSelectedOccupation(option.suggestion);
                setQuery(option.suggestion.label);
                setOpenAutocomplete(null);
                setOccupationActiveIndex(-1);
              }}
              placeholder={copy.search.occupationPlaceholder}
              queryText={query}
              suggestions={occupationOptions}
              value={query}
            />
            <HeroAutocompleteField
              activeIndex={locationActiveIndex}
              containerStyle={styles.searchField}
              dropdownMode={isCompact ? "inline" : "overlay"}
              emptyMessage={copy.search.noResults}
              errorMessage={locationError}
              fieldId="hero-location-search"
              isOpen={
                openAutocomplete === "location" && location.trim().length >= 2
              }
              label={copy.search.locationLabel}
              loading={locationLoading}
              loadingLabel={copy.search.loading}
              onActiveIndexChange={setLocationActiveIndex}
              onChangeText={handleLocationChange}
              onFocus={() => setOpenAutocomplete("location")}
              onRequestClose={() => setOpenAutocomplete(null)}
              onSelect={(option) => {
                setSelectedLocation(option.suggestion);
                setLocation(option.suggestion.label);
                setLocationError(null);
                setOpenAutocomplete(null);
                setLocationActiveIndex(-1);
              }}
              placeholder={copy.search.locationPlaceholder}
              queryText={location}
              suggestions={locationOptions}
              value={location}
            />
          </View>
          <RabAIButton
            fullWidth={isCompact}
            onPress={submitSearch}
            title={copy.search.submit}
          />
        </View>
      </Section>

      <Section
        description={copy.ecosystem.description}
        title={copy.ecosystem.title}
      >
        <View style={styles.rowList}>
          {ecosystemOrder.map((key) => {
            const item = copy.ecosystem.items[key];
            return (
              <ListingRow
                actions={
                  <RabAIButton
                    onPress={() => router.push(ecosystemRoutes[key] as never)}
                    size="sm"
                    title={item.action}
                    variant="outline"
                  />
                }
                description={item.description}
                eyebrow={item.eyebrow}
                key={key}
                title={item.title}
              />
            );
          })}
        </View>
      </Section>

      <View style={[styles.latestGrid, isCompact && styles.latestGridCompact]}>
        <Section
          action={
            <RabAIButton
              onPress={() => router.push("/jobs" as never)}
              size="sm"
              title={copy.latest.jobsAction}
              variant="ghost"
            />
          }
          description={copy.latest.jobsDescription}
          style={styles.latestSection}
          title={copy.latest.jobsTitle}
        >
          {latestJobsLoading ? (
            <LoadingState compact title={copy.latest.loadingJobs} />
          ) : latestJobsError ? (
            <ErrorState
              compact
              onRetry={() => void loadLatestJobs()}
              retryLabel={copy.latest.retry}
              title={copy.latest.jobsError}
            />
          ) : latestJobs.length === 0 ? (
            <EmptyState compact title={copy.latest.jobsEmpty} />
          ) : (
            <View style={styles.rowList}>
              {latestJobs.slice(0, 2).map((job) => (
                <JobRow
                  actionLabel={copy.latest.viewJob}
                  job={job}
                  key={job.job_id}
                  language={language}
                  onPress={() =>
                    router.push(
                      buildJobDetailsPath(job.job_id, listingReturnPath) as never
                    )
                  }
                />
              ))}
            </View>
          )}
        </Section>

        <Section
          action={
            <RabAIButton
              onPress={() => router.push("/courses" as never)}
              size="sm"
              title={copy.latest.coursesAction}
              variant="ghost"
            />
          }
          description={copy.latest.coursesDescription}
          style={styles.latestSection}
          title={copy.latest.coursesTitle}
        >
          {latestCoursesLoading ? (
            <LoadingState compact title={copy.latest.loadingCourses} />
          ) : latestCoursesError ? (
            <ErrorState
              compact
              onRetry={() => void loadLatestCourses()}
              retryLabel={copy.latest.retry}
              title={copy.latest.coursesError}
            />
          ) : latestCourses.length === 0 ? (
            <EmptyState compact title={copy.latest.coursesEmpty} />
          ) : (
            <View style={styles.rowList}>
              {latestCourses.slice(0, 2).map((course) => (
                <CourseRow
                  actionLabel={copy.latest.viewCourse}
                  course={course}
                  key={course.course_id}
                  language={language}
                  onPress={() =>
                    router.push(
                      buildCourseDetailsPath(
                        course.course_id,
                        listingReturnPath
                      ) as never
                    )
                  }
                />
              ))}
            </View>
          )}
        </Section>
      </View>
    </PageContainer>
  );
}

function JobRow({
  actionLabel,
  job,
  language,
  onPress,
}: {
  actionLabel: string;
  job: SearchJobResult;
  language: LanguageCode;
  onPress: () => void;
}) {
  const location =
    job.location_label ||
    [job.postal_code, job.city, job.state].filter(Boolean).join(" ");
  const salary = formatJobSalary(job, language);

  return (
    <ListingRow
      actions={
        <RabAIButton
          onPress={onPress}
          size="sm"
          title={actionLabel}
          variant="outline"
        />
      }
      compact
      meta={[
        ...(location ? [{ label: "", value: location }] : []),
        ...(salary ? [{ label: "", value: salary }] : []),
        {
          label: "",
          value: formatEmploymentType(job.employment_type, language),
        },
        {
          label: "",
          value: formatDate(job.published_at, language),
        },
      ].filter((item) => item.value)}
      subtitle={job.company_name}
      title={job.title}
    />
  );
}

function CourseRow({
  actionLabel,
  course,
  language,
  onPress,
}: {
  actionLabel: string;
  course: SearchCourseResult;
  language: LanguageCode;
  onPress: () => void;
}) {
  const price = formatCoursePrice(course, language);
  const delivery = formatDeliveryMode(course.delivery_mode, language);

  return (
    <ListingRow
      actions={
        <RabAIButton
          onPress={onPress}
          size="sm"
          title={actionLabel}
          variant="outline"
        />
      }
      compact
      meta={[
        ...(course.location_label
          ? [{ label: "", value: course.location_label }]
          : []),
        ...(delivery ? [{ label: "", value: delivery }] : []),
        ...(price ? [{ label: "", value: price }] : []),
        ...(course.start_date
          ? [{ label: "", value: formatDate(course.start_date, language) }]
          : []),
      ]}
      subtitle={course.provider_name}
      title={course.title}
    />
  );
}

const localeByLanguage: Record<LanguageCode, string> = {
  de: "de-DE",
  en: "en-US",
  ro: "ro-RO",
};

function formatJobSalary(job: SearchJobResult, language: LanguageCode) {
  if (job.salary_from === null && job.salary_to === null) {
    return "";
  }

  const suffix = formatSalaryType(job.salary_type, language);
  if (job.salary_from !== null && job.salary_to !== null) {
    return `${formatNumber(job.salary_from, language)}–${formatNumber(job.salary_to, language)} ${suffix}`.trim();
  }

  if (job.salary_from !== null) {
    return `${formatNumber(job.salary_from, language)}+ ${suffix}`.trim();
  }

  return `≤ ${formatNumber(job.salary_to, language)} ${suffix}`.trim();
}

function formatSalaryType(value: string, language: LanguageCode) {
  const values: Record<string, Record<LanguageCode, string>> = {
    hourly: { de: "/ Stunde", en: "/ hour", ro: "/ oră" },
    daily: { de: "/ Tag", en: "/ day", ro: "/ zi" },
    weekly: { de: "/ Woche", en: "/ week", ro: "/ săptămână" },
    monthly: { de: "/ Monat", en: "/ month", ro: "/ lună" },
    yearly: { de: "/ Jahr", en: "/ year", ro: "/ an" },
    fixed: { de: "fest", en: "fixed", ro: "fix" },
  };
  return values[value]?.[language] ?? "";
}

function formatEmploymentType(value: string, language: LanguageCode) {
  const values: Record<string, Record<LanguageCode, string>> = {
    full_time: { de: "Vollzeit", en: "Full-time", ro: "Normă întreagă" },
    part_time: { de: "Teilzeit", en: "Part-time", ro: "Part-time" },
    mini_job: { de: "Minijob", en: "Mini job", ro: "Mini job" },
    temporary: { de: "Befristet", en: "Temporary", ro: "Temporar" },
    contract: { de: "Vertrag", en: "Contract", ro: "Contract" },
    freelance: { de: "Freiberuflich", en: "Freelance", ro: "Freelance" },
  };
  return values[value]?.[language] ?? value.replace(/_/g, " ");
}

function formatCoursePrice(course: SearchCourseResult, language: LanguageCode) {
  return course.price_amount !== null && course.currency_code
    ? `${formatNumber(course.price_amount, language)} ${course.currency_code}`
    : "";
}

function formatDeliveryMode(value: string | null, language: LanguageCode) {
  const values: Record<string, Record<LanguageCode, string>> = {
    online: { de: "Online", en: "Online", ro: "Online" },
    onsite: { de: "Vor Ort", en: "On site", ro: "La locație" },
    hybrid: { de: "Hybrid", en: "Hybrid", ro: "Hibrid" },
  };
  return value ? values[value]?.[language] ?? value : "";
}

function formatNumber(value: number | null, language: LanguageCode) {
  return value === null
    ? ""
    : new Intl.NumberFormat(localeByLanguage[language], {
        maximumFractionDigits: 0,
      }).format(value);
}

function formatDate(value: string, language: LanguageCode) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const styles = StyleSheet.create({
  pageContent: {
    gap: Spacing.section,
  },
  languageRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  languageLabel: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  languageActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.compact,
  },
  intro: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: Spacing.content,
    paddingBottom: Spacing.section,
    paddingTop: Spacing.component,
  },
  introAccent: {
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    flexShrink: 0,
    width: Spacing.compact,
  },
  introHeader: {
    flex: 1,
    marginBottom: Spacing.none,
  },
  searchSurface: {
    alignItems: "flex-end",
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderRadius: Radius.panel,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    padding: Spacing.component,
    position: "relative",
    zIndex: Layers.raised,
  },
  searchFields: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    minWidth: 0,
  },
  searchFieldsCompact: {
    flexDirection: "column",
  },
  searchSurfaceCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  searchField: {
    flex: 1,
  },
  rowList: {
    minWidth: 0,
  },
  latestGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.page,
  },
  latestGridCompact: {
    flexDirection: "column",
    gap: Spacing.none,
  },
  latestSection: {
    flex: 1,
    minWidth: 0,
  },
});
