import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import CourseQuickView from "@/components/courses/quick-view/CourseQuickView";
import { useCourseEnrollmentMap } from "@/components/courses/quick-view/useCourseEnrollmentMap";
import { useCourseQuickView } from "@/components/courses/quick-view/useCourseQuickView";
import RecentActivityCard from "@/components/engine/RecentActivityCard";
import JobSummaryCard from "@/components/jobs/JobSummaryCard";
import JobQuickView from "@/components/jobs/quick-view/JobQuickView";
import { useJobQuickView } from "@/components/jobs/quick-view/useJobQuickView";
import AppIcon, { type AppIconName } from "@/components/navigation/AppIcon";
import {
  EmptyState,
  ErrorState,
  ListingRow,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAIInput,
  Section,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchLatestPublishedCourses,
  type SearchCourseResult,
} from "@/services/courses/courseService";
import {
  fetchLatestPublishedJobs,
  type SearchJobResult,
} from "@/services/jobs/jobFlowService";
import {
  Breakpoints,
  Colors,
  ControlHeight,
  Radius,
  Spacing,
} from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

type SearchMode = "jobs" | "courses";
type QuickActionKey = "profile" | "jobs" | "organization";

type DashboardCopy = {
  eyebrow: string;
  title: string;
  description: string;
  returnHome: string;
  retry: string;
  search: {
    title: string;
    description: string;
    jobs: string;
    courses: string;
    jobLabel: string;
    jobPlaceholder: string;
    courseLabel: string;
    coursePlaceholder: string;
    submit: string;
  };
  quick: {
    title: string;
    description: string;
    items: Record<
      QuickActionKey,
      { action: string; description: string; title: string }
    >;
  };
  jobs: {
    title: string;
    description: string;
    action: string;
    loading: string;
    empty: string;
    error: string;
  };
  courses: {
    title: string;
    description: string;
    action: string;
    loading: string;
    empty: string;
    error: string;
  };
};

const copyByLanguage = {
  ro: {
    eyebrow: "Spațiul tău RabAI",
    title: "Bun venit",
    description:
      "Continuă cu activitatea, oportunitățile și următorii pași care folosesc datele reale ale contului tău.",
    returnHome: "Înapoi la Acasă",
    retry: "Încearcă din nou",
    search: {
      title: "Comandă rapidă",
      description: "Caută direct în joburile sau cursurile publicate.",
      jobs: "Joburi",
      courses: "Cursuri",
      jobLabel: "Caută joburi",
      jobPlaceholder: "ex: electrician, șofer, logistică",
      courseLabel: "Caută cursuri",
      coursePlaceholder: "ex: limba germană, siguranță, depozit",
      submit: "Caută",
    },
    quick: {
      title: "Următorii pași",
      description: "Trei acțiuni utile, fără scurtături decorative.",
      items: {
        profile: {
          action: "Deschide profilul",
          description:
            "Actualizează datele care susțin aplicațiile și colaborările tale.",
          title: "Profil profesional",
        },
        jobs: {
          action: "Explorează joburi",
          description:
            "Vezi oportunitățile publicate și deschide vizualizarea rapidă.",
          title: "Locuri de muncă",
        },
        organization: {
          action: "Vezi organizațiile",
          description:
            "Administrează organizațiile asociate contului sau creează una nouă.",
          title: "Organizații",
        },
      },
    },
    jobs: {
      title: "Joburi recomandate",
      description: "Anunțuri active dintre cele publicate recent.",
      action: "Toate joburile",
      loading: "Se încarcă joburile…",
      empty: "Momentan nu există joburi active pentru recomandare.",
      error: "Joburile recomandate nu au putut fi încărcate.",
    },
    courses: {
      title: "Cursuri recomandate",
      description: "Programe active publicate de furnizori RabAI.",
      action: "Toate cursurile",
      loading: "Se încarcă cursurile…",
      empty: "Momentan nu există cursuri active pentru recomandare.",
      error: "Cursurile recomandate nu au putut fi încărcate.",
    },
  },
  en: {
    eyebrow: "Your RabAI workspace",
    title: "Welcome",
    description:
      "Continue with activity, opportunities, and next steps backed by the real data in your account.",
    returnHome: "Back to Home",
    retry: "Try again",
    search: {
      title: "Quick command",
      description: "Search directly across published jobs or courses.",
      jobs: "Jobs",
      courses: "Courses",
      jobLabel: "Search jobs",
      jobPlaceholder: "e.g. electrician, driver, logistics",
      courseLabel: "Search courses",
      coursePlaceholder: "e.g. German, safety, warehouse",
      submit: "Search",
    },
    quick: {
      title: "Next steps",
      description: "Three useful actions without decorative shortcuts.",
      items: {
        profile: {
          action: "Open profile",
          description:
            "Update the information that supports your applications and collaborations.",
          title: "Professional profile",
        },
        jobs: {
          action: "Explore jobs",
          description:
            "View published opportunities and open their quick view.",
          title: "Jobs",
        },
        organization: {
          action: "View organizations",
          description:
            "Manage organizations associated with your account or create one.",
          title: "Organizations",
        },
      },
    },
    jobs: {
      title: "Recommended jobs",
      description: "Active listings selected from recent publications.",
      action: "All jobs",
      loading: "Loading jobs…",
      empty: "There are no active jobs to recommend right now.",
      error: "Recommended jobs could not be loaded.",
    },
    courses: {
      title: "Recommended courses",
      description: "Active programs published by RabAI providers.",
      action: "All courses",
      loading: "Loading courses…",
      empty: "There are no active courses to recommend right now.",
      error: "Recommended courses could not be loaded.",
    },
  },
  de: {
    eyebrow: "Dein RabAI-Arbeitsbereich",
    title: "Willkommen",
    description:
      "Setze deine Aktivitäten, Möglichkeiten und nächsten Schritte mit den echten Daten deines Kontos fort.",
    returnHome: "Zurück zum Start",
    retry: "Erneut versuchen",
    search: {
      title: "Schnellbefehl",
      description: "Suche direkt in veröffentlichten Jobs oder Kursen.",
      jobs: "Jobs",
      courses: "Kurse",
      jobLabel: "Jobs suchen",
      jobPlaceholder: "z. B. Elektriker, Fahrer, Logistik",
      courseLabel: "Kurse suchen",
      coursePlaceholder: "z. B. Deutsch, Sicherheit, Lager",
      submit: "Suchen",
    },
    quick: {
      title: "Nächste Schritte",
      description: "Drei nützliche Aktionen ohne dekorative Abkürzungen.",
      items: {
        profile: {
          action: "Profil öffnen",
          description:
            "Aktualisiere die Angaben für deine Bewerbungen und Zusammenarbeit.",
          title: "Berufliches Profil",
        },
        jobs: {
          action: "Jobs entdecken",
          description:
            "Sieh veröffentlichte Möglichkeiten an und öffne die Schnellansicht.",
          title: "Jobs",
        },
        organization: {
          action: "Organisationen ansehen",
          description:
            "Verwalte Organisationen deines Kontos oder erstelle eine neue.",
          title: "Organisationen",
        },
      },
    },
    jobs: {
      title: "Empfohlene Jobs",
      description: "Aktive Anzeigen aus den neuesten Veröffentlichungen.",
      action: "Alle Jobs",
      loading: "Jobs werden geladen…",
      empty: "Derzeit gibt es keine aktiven Jobs für Empfehlungen.",
      error: "Empfohlene Jobs konnten nicht geladen werden.",
    },
    courses: {
      title: "Empfohlene Kurse",
      description: "Aktive Programme von RabAI-Anbietern.",
      action: "Alle Kurse",
      loading: "Kurse werden geladen…",
      empty: "Derzeit gibt es keine aktiven Kurse für Empfehlungen.",
      error: "Empfohlene Kurse konnten nicht geladen werden.",
    },
  },
} satisfies Record<LanguageCode, DashboardCopy>;

const quickActions: {
  icon: AppIconName;
  key: QuickActionKey;
  route: string;
}[] = [
  { icon: "profile", key: "profile", route: "/profile" },
  { icon: "briefcase", key: "jobs", route: "/jobs" },
  { icon: "organization", key: "organization", route: "/organizations" },
];

export default function EngineDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const enrollmentMap = useCourseEnrollmentMap(user?.id ?? null);
  const copy = copyByLanguage[language];
  const [jobs, setJobs] = useState<SearchJobResult[]>([]);
  const [courses, setCourses] = useState<SearchCourseResult[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [jobsError, setJobsError] = useState(false);
  const [coursesError, setCoursesError] = useState(false);
  const jobsRequestId = useRef(0);
  const coursesRequestId = useRef(0);
  const {
    closeJobQuickView,
    openJobQuickView,
    selection: jobSelection,
  } = useJobQuickView();
  const {
    closeCourseQuickView,
    openCourseQuickView,
    selection: courseSelection,
  } = useCourseQuickView();
  const firstName = getFirstName(user?.fullName, user?.email);

  const loadJobs = useCallback(async () => {
    const requestId = ++jobsRequestId.current;
    setJobsLoading(true);
    setJobsError(false);

    try {
      const results = await fetchLatestPublishedJobs(2);
      if (jobsRequestId.current === requestId) {
        setJobs(results);
      }
    } catch {
      if (jobsRequestId.current === requestId) {
        setJobs([]);
        setJobsError(true);
      }
    } finally {
      if (jobsRequestId.current === requestId) {
        setJobsLoading(false);
      }
    }
  }, []);

  const loadCourses = useCallback(async () => {
    const requestId = ++coursesRequestId.current;
    setCoursesLoading(true);
    setCoursesError(false);

    try {
      const results = await fetchLatestPublishedCourses(2);
      if (coursesRequestId.current === requestId) {
        setCourses(results);
      }
    } catch {
      if (coursesRequestId.current === requestId) {
        setCourses([]);
        setCoursesError(true);
      }
    } finally {
      if (coursesRequestId.current === requestId) {
        setCoursesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadJobs();
      void loadCourses();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      jobsRequestId.current += 1;
      coursesRequestId.current += 1;
    };
  }, [loadCourses, loadJobs]);

  return (
    <View style={styles.screen}>
      <PageContainer
        contentStyle={styles.content}
        maxWidth="dashboard"
        scroll
        scrollEnabled={!jobSelection && !courseSelection}
      >
        <PageHeader
          description={copy.description}
          eyebrow={copy.eyebrow}
          title={`${copy.title}${firstName ? `, ${firstName}` : ""}`}
        />

        <Section
          description={copy.search.description}
          title={copy.search.title}
        >
          <GlobalSearch copy={copy.search} />
        </Section>

        <Section
          description={copy.quick.description}
          title={copy.quick.title}
        >
          <View style={styles.quickList}>
            {quickActions.map((action) => {
              const item = copy.quick.items[action.key];
              return (
                <ListingRow
                  actions={
                    <RabAIButton
                      onPress={() => router.push(action.route as never)}
                      size="sm"
                      title={item.action}
                      variant="outline"
                    />
                  }
                  description={item.description}
                  key={action.key}
                  leading={
                    <View style={styles.quickIcon}>
                      <AppIcon
                        color={Colors.goldPressed}
                        name={action.icon}
                        size={20}
                      />
                    </View>
                  }
                  title={item.title}
                />
              );
            })}
          </View>
        </Section>

        <RecentActivityCard key={user?.id ?? "signed-out"} />

        <Section
          action={
            <RabAIButton
              onPress={() => router.push("/jobs" as never)}
              size="sm"
              title={copy.jobs.action}
              variant="ghost"
            />
          }
          description={copy.jobs.description}
          title={copy.jobs.title}
        >
          {jobsLoading ? (
            <LoadingState compact title={copy.jobs.loading} />
          ) : jobsError ? (
            <ErrorState
              compact
              onRetry={() => void loadJobs()}
              retryLabel={copy.retry}
              title={copy.jobs.error}
            />
          ) : jobs.length === 0 ? (
            <EmptyState compact title={copy.jobs.empty} />
          ) : (
            <View style={styles.recommendationList}>
              {jobs.map((job) => (
                <JobSummaryCard
                  job={job}
                  key={job.job_id}
                  language={language}
                  onAction={(selectedJob, action) =>
                    openJobQuickView(selectedJob, action, "/engine")
                  }
                  returnLabel={copy.returnHome}
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
              title={copy.courses.action}
              variant="ghost"
            />
          }
          description={copy.courses.description}
          title={copy.courses.title}
        >
          {coursesLoading ? (
            <LoadingState compact title={copy.courses.loading} />
          ) : coursesError ? (
            <ErrorState
              compact
              onRetry={() => void loadCourses()}
              retryLabel={copy.retry}
              title={copy.courses.error}
            />
          ) : courses.length === 0 ? (
            <EmptyState compact title={copy.courses.empty} />
          ) : (
            <View style={styles.recommendationList}>
              {courses.map((course) => (
                <CourseSummaryCard
                  course={course}
                  enrollment={enrollmentMap.get(course.course_id)}
                  key={course.course_id}
                  language={language}
                  onAction={(selectedCourse, action) =>
                    openCourseQuickView(selectedCourse, action, "/engine")
                  }
                  returnLabel={copy.returnHome}
                />
              ))}
            </View>
          )}
        </Section>
      </PageContainer>

      <JobQuickView onClose={closeJobQuickView} selection={jobSelection} />
      <CourseQuickView
        onClose={closeCourseQuickView}
        selection={courseSelection}
      />
    </View>
  );
}

function GlobalSearch({ copy }: { copy: DashboardCopy["search"] }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<SearchMode>("jobs");
  const [query, setQuery] = useState("");
  const compact = width < Breakpoints.tablet;

  function submit() {
    const trimmedQuery = query.trim();
    const baseRoute = mode === "courses" ? "/courses" : "/jobs";
    router.push(
      (trimmedQuery
        ? `${baseRoute}?search=${encodeURIComponent(trimmedQuery)}`
        : baseRoute) as never
    );
  }

  return (
    <View style={styles.searchSurface}>
      <View accessibilityRole="radiogroup" style={styles.searchModes}>
        <RabAIButton
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === "jobs" }}
          onPress={() => setMode("jobs")}
          size="sm"
          title={copy.jobs}
          variant={mode === "jobs" ? "secondary" : "ghost"}
        />
        <RabAIButton
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === "courses" }}
          onPress={() => setMode("courses")}
          size="sm"
          title={copy.courses}
          variant={mode === "courses" ? "secondary" : "ghost"}
        />
      </View>
      <View style={[styles.searchRow, compact && styles.searchRowCompact]}>
        <RabAIInput
          containerStyle={styles.searchInput}
          label={mode === "courses" ? copy.courseLabel : copy.jobLabel}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          placeholder={
            mode === "courses" ? copy.coursePlaceholder : copy.jobPlaceholder
          }
          returnKeyType="search"
          value={query}
        />
        <RabAIButton
          fullWidth={compact}
          onPress={submit}
          title={copy.submit}
        />
      </View>
    </View>
  );
}

function getFirstName(fullName?: string, email?: string | null) {
  return fullName?.trim().split(/\s+/)[0] || email?.split("@")[0] || "";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  content: {
    minWidth: 0,
  },
  searchSurface: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderRadius: Radius.panel,
    borderWidth: 1,
    gap: Spacing.inline,
    padding: Spacing.component,
  },
  searchModes: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.compact,
  },
  searchRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: Spacing.inline,
  },
  searchRowCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  searchInput: {
    flex: 1,
  },
  quickList: {
    minWidth: 0,
  },
  quickIcon: {
    alignItems: "center",
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.control,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    width: ControlHeight.minimumTouch,
  },
  recommendationList: {
    minWidth: 0,
  },
});
