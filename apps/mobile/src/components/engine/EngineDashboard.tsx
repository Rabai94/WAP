import AppIcon, { type AppIconName } from "@/components/navigation/AppIcon";
import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import JobSummaryCard from "@/components/jobs/JobSummaryCard";
import JobQuickView from "@/components/jobs/quick-view/JobQuickView";
import { useJobQuickView } from "@/components/jobs/quick-view/useJobQuickView";
import { PageContainer, RabAIButton, RabAICard } from "@/components/ui";
import RecentActivityCard from "@/components/engine/RecentActivityCard";
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
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";

type SearchMode = "jobs" | "courses";
type QuickActionKey = "profile" | "organization" | "jobs" | "task";

const dashboardWallpaper = require("../../assets/hero/rabai-home-hero-background-v001.png");

const quickActions: {
  icon: AppIconName;
  key: QuickActionKey;
  route: string;
}[] = [
  {
    icon: "profile",
    key: "profile",
    route: "/profile",
  },
  {
    icon: "organization",
    key: "organization",
    route: "/organizations/create",
  },
  {
    icon: "briefcase",
    key: "jobs",
    route: "/jobs",
  },
  {
    icon: "task",
    key: "task",
    route: "/tasks/create",
  },
];

type DashboardCopy = {
  authenticated: string;
  courses: {
    action: string;
    empty: string;
    subtitle: string;
    title: string;
  };
  errors: {
    courses: string;
    jobs: string;
  };
  eyebrow: string;
  jobs: {
    action: string;
    empty: string;
    subtitle: string;
    title: string;
  };
  quickActions: Record<QuickActionKey, { label: string; subtitle: string }>;
  quickActionsSubtitle: string;
  quickActionsTitle: string;
  recommendationsSubtitle: string;
  recommendationsTitle: string;
  returnHome: string;
  search: {
    courseAccessibilityLabel: string;
    courseMode: string;
    coursePlaceholder: string;
    jobAccessibilityLabel: string;
    jobMode: string;
    jobPlaceholder: string;
    submit: string;
  };
  services: {
    action: string;
    empty: string;
    title: string;
  };
  welcomeSubtitle: string;
  welcomeTitle: string;
};

const copyByLanguage = {
  ro: {
    authenticated: "Cont autentificat",
    courses: {
      action: "Vezi toate cursurile",
      empty: "Momentan nu există cursuri active disponibile pentru recomandare.",
      subtitle: "Programe active publicate de furnizori RabAI.",
      title: "Cursuri",
    },
    errors: {
      courses: "Nu am putut încărca cursurile recomandate.",
      jobs: "Nu am putut încărca joburile recomandate.",
    },
    eyebrow: "Spațiul tău RabAI",
    jobs: {
      action: "Vezi toate joburile",
      empty: "Momentan nu există joburi active disponibile pentru recomandare.",
      subtitle: "Oportunități de muncă publicate în RabAI.",
      title: "Locuri de muncă",
    },
    quickActions: {
      profile: {
        label: "Completează profilul",
        subtitle: "Adaugă detaliile care te ajută să fii găsit.",
      },
      organization: {
        label: "Creează organizație",
        subtitle: "Pregătește spațiul de lucru al echipei tale.",
      },
      jobs: {
        label: "Vezi joburi",
        subtitle: "Descoperă oportunitățile publicate recent.",
      },
      task: {
        label: "Publică lucrare",
        subtitle: "Descrie o nevoie punctuală și public-o.",
      },
    },
    quickActionsSubtitle: "Cele mai folosite acțiuni, la un singur clic distanță.",
    quickActionsTitle: "Acțiuni rapide",
    recommendationsSubtitle: "Anunțuri reale și active, selectate dintre cele publicate recent.",
    recommendationsTitle: "Recomandări recente",
    returnHome: "Înapoi la Acasă",
    search: {
      courseAccessibilityLabel: "Caută cursuri",
      courseMode: "Cursuri",
      coursePlaceholder: "Ex: limba germană, siguranță, depozit",
      jobAccessibilityLabel: "Caută joburi",
      jobMode: "Joburi",
      jobPlaceholder: "Ex: electrician, șofer, logistică",
      submit: "Caută",
    },
    services: {
      action: "Vezi serviciile",
      empty:
        "Recomandările de servicii nu sunt disponibile momentan; nu afișăm oferte fără o sursă reală conectată.",
      title: "Servicii recomandate",
    },
    welcomeSubtitle: "Continuă de unde ai rămas în RabAI.",
    welcomeTitle: "Bun venit",
  },
  en: {
    authenticated: "Authenticated account",
    courses: {
      action: "View all courses",
      empty: "There are currently no active courses available to recommend.",
      subtitle: "Active programs published by RabAI providers.",
      title: "Courses",
    },
    errors: {
      courses: "We could not load the recommended courses.",
      jobs: "We could not load the recommended jobs.",
    },
    eyebrow: "Your RabAI workspace",
    jobs: {
      action: "View all jobs",
      empty: "There are currently no active jobs available to recommend.",
      subtitle: "Job opportunities published in RabAI.",
      title: "Jobs",
    },
    quickActions: {
      profile: {
        label: "Complete your profile",
        subtitle: "Add the details that help others find you.",
      },
      organization: {
        label: "Create organization",
        subtitle: "Set up your team's workspace.",
      },
      jobs: {
        label: "View jobs",
        subtitle: "Discover recently published opportunities.",
      },
      task: {
        label: "Publish task",
        subtitle: "Describe a one-time need and publish it.",
      },
    },
    quickActionsSubtitle: "Your most-used actions, one click away.",
    quickActionsTitle: "Quick actions",
    recommendationsSubtitle: "Real, active listings selected from recent publications.",
    recommendationsTitle: "Recent recommendations",
    returnHome: "Back to Home",
    search: {
      courseAccessibilityLabel: "Search courses",
      courseMode: "Courses",
      coursePlaceholder: "E.g. German, safety, warehouse",
      jobAccessibilityLabel: "Search jobs",
      jobMode: "Jobs",
      jobPlaceholder: "E.g. electrician, driver, logistics",
      submit: "Search",
    },
    services: {
      action: "View services",
      empty:
        "Service recommendations are not available yet; we do not show offers without a connected real source.",
      title: "Recommended services",
    },
    welcomeSubtitle: "Continue where you left off in RabAI.",
    welcomeTitle: "Welcome",
  },
  de: {
    authenticated: "Angemeldetes Konto",
    courses: {
      action: "Alle Kurse ansehen",
      empty: "Derzeit sind keine aktiven Kurse für Empfehlungen verfügbar.",
      subtitle: "Aktive Programme von RabAI-Anbietern.",
      title: "Kurse",
    },
    errors: {
      courses: "Die empfohlenen Kurse konnten nicht geladen werden.",
      jobs: "Die empfohlenen Jobs konnten nicht geladen werden.",
    },
    eyebrow: "Dein RabAI-Arbeitsbereich",
    jobs: {
      action: "Alle Jobs ansehen",
      empty: "Derzeit sind keine aktiven Jobs für Empfehlungen verfügbar.",
      subtitle: "In RabAI veröffentlichte Stellenangebote.",
      title: "Jobs",
    },
    quickActions: {
      profile: {
        label: "Profil vervollständigen",
        subtitle: "Ergänze die Angaben, mit denen du gefunden wirst.",
      },
      organization: {
        label: "Organisation erstellen",
        subtitle: "Richte den Arbeitsbereich deines Teams ein.",
      },
      jobs: {
        label: "Jobs ansehen",
        subtitle: "Entdecke kürzlich veröffentlichte Angebote.",
      },
      task: {
        label: "Auftrag veröffentlichen",
        subtitle: "Beschreibe einen einmaligen Bedarf und veröffentliche ihn.",
      },
    },
    quickActionsSubtitle: "Deine meistgenutzten Aktionen mit nur einem Klick.",
    quickActionsTitle: "Schnellaktionen",
    recommendationsSubtitle: "Echte, aktive und kürzlich veröffentlichte Angebote.",
    recommendationsTitle: "Aktuelle Empfehlungen",
    returnHome: "Zurück zum Start",
    search: {
      courseAccessibilityLabel: "Kurse suchen",
      courseMode: "Kurse",
      coursePlaceholder: "Z. B. Deutsch, Sicherheit, Lager",
      jobAccessibilityLabel: "Jobs suchen",
      jobMode: "Jobs",
      jobPlaceholder: "Z. B. Elektriker, Fahrer, Logistik",
      submit: "Suchen",
    },
    services: {
      action: "Dienstleistungen ansehen",
      empty:
        "Dienstleistungsempfehlungen sind derzeit nicht verfügbar; ohne angebundene reale Quelle zeigen wir keine Angebote.",
      title: "Empfohlene Dienstleistungen",
    },
    welcomeSubtitle: "Mach in RabAI dort weiter, wo du aufgehört hast.",
    welcomeTitle: "Willkommen",
  },
} satisfies Record<LanguageCode, DashboardCopy>;

export default function EngineDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const copy = copyByLanguage[language];
  const [jobs, setJobs] = useState<SearchJobResult[]>([]);
  const [courses, setCourses] = useState<SearchCourseResult[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null | undefined>(undefined);
  const [coursesError, setCoursesError] = useState<string | null | undefined>(
    undefined
  );
  const [contentWidth, setContentWidth] = useState(0);
  const { closeJobQuickView, openJobQuickView, selection } = useJobQuickView();
  const responsiveWidth = contentWidth > 0 ? contentWidth : width;
  const isMobile = responsiveWidth < 640;
  const firstName = getFirstName(user?.fullName, user?.email);

  function handleLayout(event: LayoutChangeEvent) {
    const nextWidth = Math.round(event.nativeEvent.layout.width);

    setContentWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth
    );
  }

  useEffect(() => {
    let mounted = true;

    fetchLatestPublishedJobs(2)
      .then((results) => {
        if (mounted) {
          setJobs(results);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setJobs([]);
          setJobsError(readError(error));
        }
      })
      .finally(() => {
        if (mounted) {
          setJobsLoading(false);
        }
      });

    fetchLatestPublishedCourses(2)
      .then((results) => {
        if (mounted) {
          setCourses(results);
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setCourses([]);
          setCoursesError(readError(error));
        }
      })
      .finally(() => {
        if (mounted) {
          setCoursesLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View onLayout={handleLayout} style={styles.screen}>
      <PageContainer
        contentStyle={[
          styles.content,
          isMobile && styles.contentMobile,
        ]}
        maxWidth="dashboard"
        scroll
        scrollEnabled={!selection}
      >
        <ImageBackground
          imageStyle={styles.welcomeBannerImage}
          resizeMode="cover"
          source={dashboardWallpaper}
          style={[
            styles.welcomeBanner,
            isMobile && styles.welcomeBannerMobile,
          ]}
        >
          <View style={[styles.welcomeBannerOverlay, styles.nonInteractive]} />
          <View
            style={[
              styles.welcomeBannerContent,
              isMobile && styles.welcomeBannerContentMobile,
            ]}
          >
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeCopy}>
                <View style={styles.welcomeMetaRow}>
                  <Text numberOfLines={1} style={styles.eyebrow}>
                    {copy.eyebrow}
                  </Text>
                  <View style={styles.secureStatus}>
                    <View style={styles.statusDot} />
                    <Text numberOfLines={1} style={styles.secureStatusText}>
                      {copy.authenticated}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.welcomeTitle,
                    isMobile && styles.welcomeTitleMobile,
                  ]}
                >
                  {copy.welcomeTitle}{firstName ? `, ${firstName}` : ""}
                </Text>
                <Text
                  style={[
                    styles.welcomeSubtitle,
                    isMobile && styles.welcomeSubtitleMobile,
                  ]}
                >
                  {copy.welcomeSubtitle}
                </Text>
              </View>
            </View>

            <GlobalSearchCard copy={copy.search} isMobile={isMobile} />
          </View>
        </ImageBackground>

        <View style={styles.dashboardGrid}>
          <RabAICard
            padding="lg"
            style={styles.quickActionsCard}
            variant="elevated"
          >
            <SectionHeading
              subtitle={copy.quickActionsSubtitle}
              title={copy.quickActionsTitle}
            />
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <QuickActionControl
                  icon={action.icon}
                  key={action.key}
                  label={copy.quickActions[action.key].label}
                  onPress={() => router.push(action.route as never)}
                  subtitle={copy.quickActions[action.key].subtitle}
                />
              ))}
            </View>
          </RabAICard>

          <RecentActivityCard style={styles.activityPanel} />
        </View>

        <View style={styles.recommendationHeader}>
          <SectionHeading
            subtitle={copy.recommendationsSubtitle}
            title={copy.recommendationsTitle}
          />
        </View>

        <View style={styles.recommendationGrid}>
          <RecommendationCard
            actionLabel={copy.jobs.action}
            icon="briefcase"
            onAction={() => router.push("/jobs" as never)}
            subtitle={copy.jobs.subtitle}
            title={copy.jobs.title}
          >
            {jobsLoading ? (
              <RecommendationSkeleton />
            ) : jobsError !== undefined ? (
              <StateMessage error text={jobsError ?? copy.errors.jobs} />
            ) : jobs.length > 0 ? (
              <View style={styles.recommendationItems}>
                {jobs.map((job) => (
                  <JobSummaryCard
                    job={job}
                    key={job.job_id}
                    language={language}
                    onAction={(selectedJob, action) =>
                      openJobQuickView(selectedJob, action, "/engine")
                    }
                    returnLabel={copy.returnHome}
                    variant="compact"
                  />
                ))}
              </View>
            ) : (
              <StateMessage text={copy.jobs.empty} />
            )}
          </RecommendationCard>

          <RecommendationCard
            actionLabel={copy.courses.action}
            icon="course"
            onAction={() => router.push("/courses" as never)}
            subtitle={copy.courses.subtitle}
            title={copy.courses.title}
          >
            {coursesLoading ? (
              <RecommendationSkeleton />
            ) : coursesError !== undefined ? (
              <StateMessage error text={coursesError ?? copy.errors.courses} />
            ) : courses.length > 0 ? (
              <View style={styles.recommendationItems}>
                {courses.map((course) => (
                  <CourseSummaryCard
                    course={course}
                    key={course.course_id}
                    language={language}
                    returnLabel={copy.returnHome}
                    returnTo="/engine"
                    variant="compact"
                  />
                ))}
              </View>
            ) : (
              <StateMessage text={copy.courses.empty} />
            )}
          </RecommendationCard>
        </View>

        <RabAICard padding="lg" style={styles.servicesCard}>
          <View style={styles.servicesIcon}>
            <AppIcon color={Colors.brandDeep} name="service" size={22} />
          </View>
          <View style={styles.servicesCopy}>
            <Text style={styles.servicesTitle}>{copy.services.title}</Text>
            <Text style={styles.servicesText}>{copy.services.empty}</Text>
          </View>
          <RabAIButton
            onPress={() => router.push("/services" as never)}
            size="sm"
            title={copy.services.action}
            variant="secondary"
          />
        </RabAICard>
      </PageContainer>
      <JobQuickView onClose={closeJobQuickView} selection={selection} />
    </View>
  );
}

function QuickActionControl({
  icon,
  label,
  onPress,
  subtitle,
}: {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  subtitle: string;
}) {
  return (
    <RabAICard
      accessibilityLabel={label}
      interactive
      onPress={onPress}
      padding="sm"
      style={styles.quickAction}
      variant="filled"
    >
      <View style={styles.quickActionIcon}>
        <AppIcon color={Colors.brandDeep} name={icon} size={20} />
      </View>
      <View style={styles.quickActionCopy}>
        <Text style={styles.quickActionTitle}>{label}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <AppIcon color={Colors.textMuted} name="chevron-right" size={16} />
    </RabAICard>
  );
}

function GlobalSearchCard({
  copy,
  isMobile,
}: {
  copy: DashboardCopy["search"];
  isMobile: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("jobs");
  const [query, setQuery] = useState("");

  function submit() {
    const trimmedQuery = query.trim();
    const baseRoute = mode === "courses" ? "/courses" : "/jobs";
    const route = trimmedQuery
      ? `${baseRoute}?search=${encodeURIComponent(trimmedQuery)}`
      : baseRoute;

    router.push(route as never);
  }

  return (
    <View style={[styles.searchCard, isMobile && styles.searchCardMobile]}>
      <View accessibilityRole="radiogroup" style={styles.searchModes}>
        <SearchModeButton
          active={mode === "jobs"}
          label={copy.jobMode}
          onPress={() => setMode("jobs")}
        />
        <SearchModeButton
          active={mode === "courses"}
          label={copy.courseMode}
          onPress={() => setMode("courses")}
        />
      </View>

      <View
        style={[
          styles.searchInputRow,
          isMobile && styles.searchInputRowMobile,
        ]}
      >
        <View style={styles.dashboardSearchField}>
          <AppIcon color={Colors.textMuted} name="search" size={21} />
          <TextInput
            accessibilityLabel={
              mode === "courses"
                ? copy.courseAccessibilityLabel
                : copy.jobAccessibilityLabel
            }
            onChangeText={setQuery}
            onSubmitEditing={submit}
            placeholder={
              mode === "courses"
                ? copy.coursePlaceholder
                : copy.jobPlaceholder
            }
            placeholderTextColor={Colors.placeholder}
            returnKeyType="search"
            style={styles.dashboardSearchInput}
            value={query}
          />
        </View>
        <RabAIButton
          fullWidth={isMobile}
          onPress={submit}
          title={copy.submit}
        />
      </View>
    </View>
  );
}

function SearchModeButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <RabAIButton
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      size="sm"
      title={label}
      variant={active ? "secondary" : "ghost"}
    />
  );
}

function RecommendationCard({
  actionLabel,
  children,
  icon,
  onAction,
  subtitle,
  title,
}: {
  actionLabel: string;
  children: ReactNode;
  icon: AppIconName;
  onAction: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <RabAICard
      padding="lg"
      style={styles.recommendationCard}
      variant="elevated"
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleIcon}>
          <AppIcon color={Colors.brandDeep} name={icon} size={20} />
        </View>
        <View style={styles.cardHeaderCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <RabAIButton
          onPress={onAction}
          size="sm"
          title={actionLabel}
          variant="ghost"
        />
      </View>
      {children}
    </RabAICard>
  );
}

function SectionHeading({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function RecommendationSkeleton() {
  return (
    <View style={styles.skeletonStack}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

function StateMessage({ error = false, text }: { error?: boolean; text: string }) {
  return (
    <View style={[styles.stateMessage, error && styles.stateMessageError]}>
      <Text style={[styles.stateMessageText, error && styles.stateMessageTextError]}>
        {text}
      </Text>
    </View>
  );
}

function getFirstName(fullName?: string, email?: string | null) {
  const firstName = fullName?.trim().split(/\s+/)[0];

  if (firstName) {
    return firstName;
  }

  return email?.split("@")[0] || "";
}

function readError(error: unknown) {
  return error instanceof Error && error.message ? error.message : null;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  nonInteractive: {
    pointerEvents: "none",
  },
  content: {
    gap: Spacing.screen,
  },
  contentMobile: {
    gap: Spacing.three,
  },
  welcomeBanner: {
    backgroundColor: Colors.surfaceInverse,
    borderColor: Colors.borderOnInverse,
    borderRadius: Radius.card,
    borderWidth: 1,
    minHeight: 240,
    overflow: "hidden",
    ...Shadows.card,
  },
  welcomeBannerMobile: {
    minHeight: 220,
  },
  welcomeBannerImage: {
    borderRadius: Radius.card,
  },
  welcomeBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlayStrong,
  },
  welcomeBannerContent: {
    flex: 1,
    gap: Spacing.three,
    justifyContent: "space-between",
    padding: Spacing.screen,
  },
  welcomeBannerContentMobile: {
    gap: Spacing.md,
    padding: Spacing.three,
  },
  welcomeHeader: {
    width: "100%",
  },
  welcomeCopy: {
    flex: 1,
    minWidth: 0,
  },
  welcomeMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  eyebrow: {
    color: Colors.textOnInverseMuted,
    flex: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    color: Colors.white,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    letterSpacing: -0.5,
  },
  welcomeTitleMobile: {
    fontSize: 22,
    lineHeight: 28,
  },
  welcomeSubtitle: {
    color: Colors.textOnInverseSecondary,
    fontSize: Typography.body,
    lineHeight: 23,
    marginTop: Spacing.sm,
  },
  welcomeSubtitleMobile: {
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  secureStatus: {
    alignItems: "center",
    backgroundColor: Colors.surfaceInverseSubtle,
    borderColor: Colors.borderInverse,
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    flexShrink: 0,
    gap: Spacing.sm,
    minHeight: 28,
    paddingHorizontal: Spacing.md,
  },
  statusDot: {
    backgroundColor: Colors.success,
    borderRadius: Radius.round,
    height: 7,
    width: 7,
  },
  secureStatusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.fontWeight.extraBold,
  },
  searchCard: {
    alignItems: "center",
    backgroundColor: Colors.surfaceInverseElevated,
    borderColor: Colors.borderInverse,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  searchCardMobile: {
    alignItems: "stretch",
    flexDirection: "column",
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  searchModes: {
    backgroundColor: Colors.surfaceInverseMuted,
    borderColor: Colors.borderInverse,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  searchInputRow: {
    alignItems: "stretch",
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 0,
  },
  searchInputRowMobile: {
    flexDirection: "column",
    gap: Spacing.xs,
  },
  dashboardSearchField: {
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.borderInverseStrong,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: 46,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  dashboardSearchInput: {
    color: Colors.text,
    flex: 1,
    fontSize: Typography.body,
    minHeight: 40,
    paddingVertical: 0,
  },
  dashboardGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.screen,
  },
  quickActionsCard: {
    flex: 1,
    flexBasis: 520,
    minWidth: 0,
  },
  activityPanel: {
    flex: 1,
    flexBasis: 520,
    minWidth: 0,
    width: "auto",
  },
  sectionHeading: {
    flex: 1,
    minWidth: 220,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.three,
  },
  quickAction: {
    alignItems: "center",
    flexBasis: 200,
    flexGrow: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minHeight: 68,
  },
  quickActionIcon: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  quickActionCopy: {
    flex: 1,
    minWidth: 0,
  },
  quickActionTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  quickActionSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: 17,
    marginTop: 3,
  },
  recommendationHeader: {
    flexDirection: "row",
  },
  recommendationGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.screen,
  },
  recommendationCard: {
    flex: 1,
    flexBasis: 520,
    minWidth: 0,
  },
  cardHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    marginBottom: Spacing.three,
  },
  cardTitleIcon: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  cardHeaderCopy: {
    flex: 1,
    minWidth: 170,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  cardSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: 18,
    marginTop: 3,
  },
  recommendationItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  servicesCard: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  servicesIcon: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  servicesCopy: {
    flex: 1,
    flexBasis: 180,
    minWidth: 0,
  },
  servicesTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  servicesText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  skeletonStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  skeletonCard: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    minHeight: 170,
    padding: Spacing.three,
  },
  skeletonTitle: {
    backgroundColor: Colors.border,
    borderRadius: Radius.round,
    height: 14,
    marginBottom: Spacing.three,
    width: "72%",
  },
  skeletonLine: {
    backgroundColor: Colors.borderMuted,
    borderRadius: Radius.round,
    height: 11,
    marginBottom: Spacing.md,
    width: "100%",
  },
  skeletonLineShort: {
    backgroundColor: Colors.borderMuted,
    borderRadius: Radius.round,
    height: 11,
    width: "48%",
  },
  stateMessage: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 112,
    padding: Spacing.three,
  },
  stateMessageError: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
  },
  stateMessageText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    textAlign: "center",
  },
  stateMessageTextError: {
    color: Colors.danger,
    fontWeight: Typography.fontWeight.bold,
  },
});
