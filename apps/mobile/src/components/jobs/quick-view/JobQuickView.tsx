import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
import {
  applyToJob,
  type JobDetails,
  type WorkerProfile,
} from "@/services/worker/workerService";
import {
  Colors,
  InteractionStyles,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import CompanyPublicSummary from "./CompanyPublicSummary";
import JobApplicationConfirmDialog from "./JobApplicationConfirmDialog";
import JobDetailSection, {
  JobDetailGrid,
  JobDetailItem,
} from "./JobDetailSection";
import JobQuickViewHeader from "./JobQuickViewHeader";
import QuickViewDrawer from "./QuickViewDrawer";
import {
  fetchCachedApplicationContext,
  fetchCachedJobDetails,
  hasAppliedToJob,
  invalidateCachedApplicationContext,
  markJobAppliedLocally,
  readCachedApplicationContext,
  readCachedJobDetails,
  type JobApplicationContext,
} from "./jobQuickViewData";
import type { JobQuickViewSelection } from "./useJobQuickView";

type JobQuickViewProps = {
  companyCoverUrl?: string | null;
  companyLogoUrl?: string | null;
  companyVerified?: boolean;
  onClose: () => void;
  selection: JobQuickViewSelection | null;
};

type JobQuickViewPanelProps = Omit<JobQuickViewProps, "selection"> & {
  selection: JobQuickViewSelection;
};

type DetailsState = "error" | "idle" | "loaded" | "loading" | "missing";

type ProfileReadiness = {
  blockMessage: string | null;
  missingFields: string[];
};

export default function JobQuickView({
  companyCoverUrl,
  companyLogoUrl,
  companyVerified,
  onClose,
  selection,
}: JobQuickViewProps) {
  const { user } = useAuth();

  if (!selection) {
    return null;
  }

  return (
    <JobQuickViewPanel
      companyCoverUrl={companyCoverUrl}
      companyLogoUrl={companyLogoUrl}
      companyVerified={companyVerified}
      key={`${selection.job.job_id}:${selection.requestId}:${user?.id ?? "public"}`}
      onClose={onClose}
      selection={selection}
    />
  );
}

function JobQuickViewPanel({
  companyCoverUrl,
  companyLogoUrl,
  companyVerified = false,
  onClose,
  selection,
}: JobQuickViewPanelProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { loading: authLoading, session, user } = useAuth();
  const { width } = useWindowDimensions();
  const job = selection.job;
  const userId = user?.id ?? null;
  const initialDetails = readCachedJobDetails(job.job_id);
  const initialApplicationContext = userId
    ? readCachedApplicationContext(userId)
    : null;
  const [details, setDetails] = useState<JobDetails | null>(
    initialDetails ?? null
  );
  const [detailsState, setDetailsState] = useState<DetailsState>(
    initialDetails === undefined
      ? "loading"
      : initialDetails
        ? "loaded"
        : "missing"
  );
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [applicationContext, setApplicationContext] =
    useState<JobApplicationContext | null>(initialApplicationContext ?? null);
  const [loadingApplicationContext, setLoadingApplicationContext] =
    useState(
      Boolean(
        userId &&
          (!initialApplicationContext || selection.intent === "apply")
      )
    );
  const [applicationContextError, setApplicationContextError] = useState<
    string | null
  >(null);
  const [manualConfirmVisible, setManualConfirmVisible] = useState(false);
  const [initialConfirmDismissed, setInitialConfirmDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [applicationNotice, setApplicationNotice] = useState<string | null>(
    null
  );
  const mountedRef = useRef(true);
  const isPhone = width < 640;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadDetails = useCallback(async (jobId: string, force = false) => {
    setDetailsState("loading");
    setDetailsError(null);

    try {
      const nextDetails = await fetchCachedJobDetails(jobId, force);

      if (!mountedRef.current) {
        return;
      }

      setDetails(nextDetails);
      setDetailsState(nextDetails ? "loaded" : "missing");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setDetails(null);
      setDetailsState("error");
      setDetailsError(readError(error, "Nu am putut încărca detaliile jobului."));
    }
  }, []);

  const loadApplicationContext = useCallback(
    async (nextUserId: string, force = false) => {
      setLoadingApplicationContext(true);
      setApplicationContextError(null);

      try {
        const nextContext = await fetchCachedApplicationContext(
          nextUserId,
          force
        );

        if (!mountedRef.current) {
          return;
        }

        setApplicationContext(nextContext);
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        setApplicationContext(null);
        setApplicationContextError(
          readError(
            error,
            "Nu am putut verifica profilul și aplicațiile existente."
          )
        );
      } finally {
        if (mountedRef.current) {
          setLoadingApplicationContext(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const cachedDetails = readCachedJobDetails(job.job_id);

    if (cachedDetails !== undefined) {
      return;
    }

    let active = true;

    fetchCachedJobDetails(job.job_id)
      .then((nextDetails) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setDetails(nextDetails);
        setDetailsState(nextDetails ? "loaded" : "missing");
      })
      .catch((error: unknown) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setDetails(null);
        setDetailsState("error");
        setDetailsError(
          readError(error, "Nu am putut încărca detaliile jobului.")
        );
      });

    return () => {
      active = false;
    };
  }, [job]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const cachedContext = readCachedApplicationContext(userId);
    const forceRefresh = selection.intent === "apply";

    if (cachedContext && !forceRefresh) {
      return;
    }

    let active = true;

    fetchCachedApplicationContext(userId, forceRefresh)
      .then((nextContext) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setApplicationContext(nextContext);
        setLoadingApplicationContext(false);
      })
      .catch((error: unknown) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setApplicationContext(null);
        setLoadingApplicationContext(false);
        setApplicationContextError(
          readError(
            error,
            "Nu am putut verifica profilul și aplicațiile existente."
          )
        );
      });

    return () => {
      active = false;
    };
  }, [job, selection.intent, userId]);

  useEffect(() => {
    if (selection.intent !== "apply") {
      return;
    }

    if (authLoading) {
      return;
    }

    if (!session) {
      const loginPath = buildLoginPath(
        `/jobs/${encodeURIComponent(selection.job.job_id)}`
      );
      onClose();
      router.push(loginPath as never);
      return;
    }

  }, [authLoading, onClose, router, selection, session]);

  const confirmVisible =
    Boolean(session) &&
    !authLoading &&
    (manualConfirmVisible ||
      (selection.intent === "apply" && !initialConfirmDismissed));

  const alreadyApplied = (() => {
    if (!job || !userId) {
      return false;
    }

    return hasAppliedToJob(
      userId,
      job.job_id,
      applicationContext?.applications ?? []
    );
  })();
  const existingApplicationStatus = applicationContext?.applications.find(
    (application) => application.job_id === job.job_id
  )?.status;
  const applicationStatusLabel = alreadyApplied
    ? formatApplicationStatus(existingApplicationStatus ?? "submitted")
    : null;

  const profileReadiness = useMemo(
    () => getProfileReadiness(applicationContext?.profile ?? null),
    [applicationContext?.profile]
  );

  const requestClose = useCallback(() => {
    if (submitting) {
      return;
    }

    if (confirmVisible) {
      setManualConfirmVisible(false);
      setInitialConfirmDismissed(true);
      setSubmissionError(null);
      return;
    }

    onClose();
  }, [confirmVisible, onClose, submitting]);

  const requestApplication = useCallback(() => {
    if (!job || authLoading || submitting || detailsState !== "loaded") {
      return;
    }

    if (!session) {
      onClose();
      router.push(
        buildLoginPath(`/jobs/${encodeURIComponent(job.job_id)}`) as never
      );
      return;
    }

    if (alreadyApplied) {
      return;
    }

    setSubmissionError(null);
    if (userId) {
      void loadApplicationContext(userId, true);
    }
    setManualConfirmVisible(true);
  }, [
    alreadyApplied,
    authLoading,
    detailsState,
    job,
    loadApplicationContext,
    onClose,
    router,
    session,
    submitting,
    userId,
  ]);

  const submitApplication = useCallback(
    async (message: string | null) => {
      if (
        !job ||
        !userId ||
        submitting ||
        alreadyApplied ||
        applicationContextError ||
        loadingApplicationContext ||
        detailsState !== "loaded" ||
        profileReadiness.blockMessage ||
        profileReadiness.missingFields.length > 0
      ) {
        return;
      }

      setSubmitting(true);
      setSubmissionError(null);

      try {
        await applyToJob(job.job_id, message);

        if (!mountedRef.current) {
          return;
        }

        markJobAppliedLocally(userId, job.job_id);
        setApplicationNotice("Aplicația a fost trimisă cu succes.");
        setManualConfirmVisible(false);
        setInitialConfirmDismissed(true);

        void fetchCachedApplicationContext(userId, true)
          .then((nextContext) => {
            if (mountedRef.current) {
              setApplicationContext(nextContext);
            }
          })
          .catch(() => {
            // The application already succeeded. The local duplicate guard remains active.
          });
      } catch (error) {
        if (mountedRef.current) {
          const applicationError = readError(
            error,
            "Nu am putut trimite aplicația. Încearcă din nou."
          );

          try {
            const refreshedContext = await fetchCachedApplicationContext(
              userId,
              true
            );

            if (!mountedRef.current) {
              return;
            }

            setApplicationContext(refreshedContext);

            if (
              refreshedContext.applications.some(
                (application) => application.job_id === job.job_id
              )
            ) {
              markJobAppliedLocally(userId, job.job_id);
              setApplicationNotice(
                "Pentru acest job există deja o candidatură."
              );
              setManualConfirmVisible(false);
              setInitialConfirmDismissed(true);
              return;
            }
          } catch {
            // Keep the original application error when status refresh also fails.
          }

          setSubmissionError(applicationError);
        }
      } finally {
        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [
      alreadyApplied,
      applicationContextError,
      detailsState,
      job,
      loadingApplicationContext,
      profileReadiness.blockMessage,
      profileReadiness.missingFields.length,
      submitting,
      userId,
    ]
  );

  const openFullPage = useCallback(() => {
    const detailsPath = buildJobDetailsPath(job.job_id, selection.returnTo);
    onClose();
    router.push(detailsPath as never);
  }, [job, onClose, router, selection]);

  const openProfileEditor = useCallback(() => {
    if (submitting) {
      return;
    }

    setManualConfirmVisible(false);
    setInitialConfirmDismissed(true);
    if (userId) {
      invalidateCachedApplicationContext(userId);
    }
    onClose();
    router.push("/profile/edit" as never);
  }, [onClose, router, submitting, userId]);

  const headerDetails = details ?? job;
  const headerMetaItems = [
    {
      label: "Locație",
      value:
        headerDetails.location_label ||
        [headerDetails.postal_code, headerDetails.city, headerDetails.state]
          .filter(Boolean)
          .join(" "),
    },
    {
      label: "Salariu",
      value: formatSalary(headerDetails),
    },
    {
      label: "Contract",
      value: formatEmploymentType(headerDetails.employment_type),
    },
    {
      label: "Program",
      value: details?.working_hours?.trim() ?? "",
    },
  ].filter((item) => item.value);
  const footerApplyDisabled =
    authLoading ||
    submitting ||
    detailsState !== "loaded" ||
    (Boolean(session) && (alreadyApplied || loadingApplicationContext));
  const visibleProfileReadiness =
    loadingApplicationContext ||
    applicationContextError !== null ||
    applicationContext === null
      ? { blockMessage: null, missingFields: [] }
      : profileReadiness;
  const footerApplyLabel = alreadyApplied
    ? "Ai aplicat deja"
    : submitting
      ? "Se trimite…"
      : authLoading || loadingApplicationContext
        ? "Se verifică…"
        : detailsState === "loading"
          ? "Se încarcă…"
          : "Aplică acum";

  return (
    <>
      <QuickViewDrawer
        accessibilityLabel={`Vizualizare rapidă pentru jobul ${job.title}`}
        footer={
          <View style={styles.footerStack}>
            {applicationNotice ? (
              <Text accessibilityRole="alert" style={styles.successNotice}>
                {applicationNotice}
              </Text>
            ) : applicationStatusLabel ? (
              <Text style={styles.applicationStatusNotice}>
                Candidatură: {applicationStatusLabel}
              </Text>
            ) : null}
            <View
              style={[
                styles.footerActions,
                isPhone && styles.footerActionsPhone,
              ]}
            >
              <InteractivePressable
                accessibilityRole="button"
                hoverStyle={styles.secondaryButtonHover}
                onPress={openFullPage}
                pressedStyle={styles.buttonPressed}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  Deschide pagina completă
                </Text>
              </InteractivePressable>
              <InteractivePressable
                accessibilityRole="button"
                accessibilityState={{ disabled: footerApplyDisabled }}
                disabled={footerApplyDisabled}
                hoverStyle={styles.primaryButtonHover}
                onPress={requestApplication}
                pressedStyle={styles.buttonPressed}
                style={[
                  styles.primaryButton,
                  footerApplyDisabled && styles.primaryButtonDisabled,
                ]}
                testID="job-quick-view-apply"
              >
                <Text style={styles.primaryButtonText}>{footerApplyLabel}</Text>
              </InteractivePressable>
            </View>
          </View>
        }
        header={
          <JobQuickViewHeader
            companyCoverUrl={companyCoverUrl}
            companyLogoUrl={companyLogoUrl}
            companyName={job.company_name}
            metaItems={headerMetaItems}
            onClose={requestClose}
            title={job.title}
            verified={companyVerified}
          />
        }
        onRequestClose={requestClose}
        visible
      >
        {detailsState === "loading" || detailsState === "idle" ? (
          <QuickViewSkeleton />
        ) : detailsState === "error" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Detaliile nu au putut fi încărcate</Text>
            <Text style={styles.stateText}>{detailsError}</Text>
            <InteractivePressable
              accessibilityRole="button"
              hoverStyle={styles.secondaryButtonHover}
              onPress={() => void loadDetails(job.job_id, true)}
              pressedStyle={styles.buttonPressed}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Reîncearcă</Text>
            </InteractivePressable>
          </View>
        ) : detailsState === "missing" || !details ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Jobul nu mai este disponibil</Text>
            <Text style={styles.stateText}>
              Anunțul a expirat sau nu mai este publicat.
            </Text>
          </View>
        ) : (
          <JobQuickViewContent
            details={details}
            language={language}
            verified={companyVerified}
          />
        )}
      </QuickViewDrawer>

      {confirmVisible ? (
        <JobApplicationConfirmDialog
          alreadyApplied={alreadyApplied}
          applicationContextError={applicationContextError}
          applicationStatusLabel={applicationStatusLabel}
          companyName={job.company_name}
          jobDetailsError={detailsState === "error"}
          jobDetailsLoading={
            detailsState === "idle" || detailsState === "loading"
          }
          jobTitle={job.title}
          jobUnavailable={detailsState === "missing"}
          loadingApplicationContext={loadingApplicationContext}
          missingProfileFields={visibleProfileReadiness.missingFields}
          onCancel={() => {
            if (!submitting) {
              setManualConfirmVisible(false);
              setInitialConfirmDismissed(true);
              setSubmissionError(null);
            }
          }}
          onCompleteProfile={openProfileEditor}
          onConfirm={(message) => void submitApplication(message)}
          onRetryApplicationContext={() => {
            if (userId) {
              void loadApplicationContext(userId, true);
            }
          }}
          onRetryJobDetails={() => void loadDetails(job.job_id, true)}
          profileBlockMessage={visibleProfileReadiness.blockMessage}
          submissionError={submissionError}
          submitting={submitting}
          visible
        />
      ) : null}
    </>
  );
}

function JobQuickViewContent({
  details,
  language,
  verified,
}: {
  details: JobDetails;
  language: LanguageCode;
  verified: boolean;
}) {
  const roleItems = [
    { label: "Contract", value: formatEmploymentType(details.employment_type) },
    { label: "Experiență", value: formatExperienceLevel(details.experience_level) },
    { label: "Program", value: details.working_hours?.trim() ?? "" },
    { label: "Limbă", value: formatLanguage(details.language) },
    {
      label: "Ocupație",
      value: localizedName(details, "occupation", language),
    },
    {
      label: "Categorie",
      value: localizedName(details, "category", language),
    },
    { label: "Salariu", value: formatSalary(details) },
  ].filter((item) => item.value);
  const publicationItems = [
    { label: "Publicat", value: formatDate(details.published_at, language) },
    { label: "Expiră", value: formatDate(details.expires_at, language) },
  ].filter((item) => item.value);
  const location =
    details.location_label ||
    [details.postal_code, details.city, details.state].filter(Boolean).join(" ");

  return (
    <>
      {roleItems.length > 0 ? (
        <JobDetailSection title="Detalii despre rol">
          <JobDetailGrid>
            {roleItems.map((item) => (
              <JobDetailItem key={item.label} label={item.label} value={item.value} />
            ))}
          </JobDetailGrid>
        </JobDetailSection>
      ) : null}

      {details.description.trim() ? (
        <JobDetailSection title="Descriere completă">
          <JobDescription value={details.description} />
        </JobDetailSection>
      ) : null}

      {location ? (
        <JobDetailSection title="Locație">
          <Text selectable style={styles.description}>
            {location}
          </Text>
        </JobDetailSection>
      ) : null}

      {publicationItems.length > 0 ? (
        <JobDetailSection title="Publicare">
          <JobDetailGrid>
            {publicationItems.map((item) => (
              <JobDetailItem key={item.label} label={item.label} value={item.value} />
            ))}
          </JobDetailGrid>
        </JobDetailSection>
      ) : null}

      <CompanyPublicSummary
        companyName={details.company_name}
        verified={verified}
      />
    </>
  );
}

function JobDescription({ value }: { value: string }) {
  const paragraphs = value
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <View style={styles.descriptionStack}>
      {paragraphs.map((paragraph, index) => (
        <Text key={`${index}-${paragraph.slice(0, 24)}`} selectable style={styles.description}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

function QuickViewSkeleton() {
  return (
    <View accessibilityLabel="Se încarcă detaliile jobului" style={styles.skeletonStack}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

function getProfileReadiness(profile: WorkerProfile | null): ProfileReadiness {
  const requiredFields = [
    { label: "Prenume", valid: Boolean(profile?.first_name?.trim()) },
    { label: "Nume", valid: Boolean(profile?.last_name?.trim()) },
    { label: "Localitate", valid: Boolean(profile?.location_id?.trim()) },
    { label: "Ocupație", valid: Boolean(profile?.occupation_id?.trim()) },
    {
      label: "Experiență profesională",
      valid:
        profile !== null &&
        Number.isFinite(profile.experience_years) &&
        profile.experience_years >= 0,
    },
    {
      label: "Limbă preferată",
      valid: Boolean(profile?.preferred_language?.trim()),
    },
    {
      label: "Disponibilitate",
      valid: Boolean(profile?.availability_status?.trim()),
    },
    {
      label: "Drept de muncă",
      valid: Boolean(profile?.work_authorization_status?.trim()),
    },
  ];

  if (!profile) {
    return {
      blockMessage: "Nu ai încă un profil de lucrător activ.",
      missingFields: requiredFields.map((field) => field.label),
    };
  }

  return {
    blockMessage:
      profile.profile_status === "active"
        ? null
        : `Profilul de lucrător are statusul „${profile.profile_status}”. Pentru aplicare este necesar un profil activ.`,
    missingFields: requiredFields
      .filter((field) => !field.valid)
      .map((field) => field.label),
  };
}

function localizedName(
  details: JobDetails,
  prefix: "category" | "occupation",
  language: LanguageCode
) {
  if (language === "de") {
    return details[`${prefix}_name_de`];
  }

  if (language === "en") {
    return details[`${prefix}_name_en`];
  }

  return details[`${prefix}_name_ro`];
}

function formatSalary(job: {
  salary_from: number | null;
  salary_to: number | null;
  salary_type: string;
}) {
  if (job.salary_from === null && job.salary_to === null) {
    return "";
  }

  const period = formatSalaryType(job.salary_type);

  if (job.salary_from !== null && job.salary_to !== null) {
    return `${formatNumber(job.salary_from)} – ${formatNumber(job.salary_to)} ${period}`.trim();
  }

  if (job.salary_from !== null) {
    return `de la ${formatNumber(job.salary_from)} ${period}`.trim();
  }

  return `până la ${formatNumber(job.salary_to)} ${period}`.trim();
}

function formatNumber(value: number | null) {
  return value === null
    ? ""
    : new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value);
}

function formatSalaryType(value: string) {
  if (value === "hourly") {
    return "/ oră";
  }

  if (value === "daily") {
    return "/ zi";
  }

  if (value === "weekly") {
    return "/ săptămână";
  }

  if (value === "yearly") {
    return "/ an";
  }

  if (value === "fixed") {
    return "sumă fixă";
  }

  if (value === "monthly") {
    return "/ lună";
  }

  return humanize(value);
}

function formatEmploymentType(value: string) {
  const labels: Record<string, string> = {
    contract: "Contract",
    freelance: "Freelance",
    full_time: "Full-time",
    mini_job: "Mini job",
    part_time: "Part-time",
    temporary: "Temporar",
  };

  return labels[value] ?? humanize(value);
}

function formatExperienceLevel(value: string) {
  const labels: Record<string, string> = {
    entry: "Începător",
    junior: "Junior",
    mid: "Nivel mediu",
    senior: "Senior",
  };

  return labels[value] ?? humanize(value);
}

function formatLanguage(value: string) {
  const labels: Record<string, string> = {
    de: "Germană",
    en: "Engleză",
    ro: "Română",
  };

  return labels[value] ?? humanize(value);
}

function formatApplicationStatus(value: string) {
  const labels: Record<string, string> = {
    accepted: "Acceptată",
    rejected: "Respinsă",
    shortlisted: "Pe lista scurtă",
    submitted: "Trimisă",
    viewed: "Vizualizată",
    withdrawn: "Retrasă",
  };

  return labels[value] ?? humanize(value);
}

function humanize(value: string) {
  const normalized = value.trim().replace(/_/g, " ");
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "";
}

function formatDate(value: string | null, language: LanguageCode) {
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
    month: "long",
    year: "numeric",
  }).format(date);
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
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
  footerStack: {
    gap: Spacing.md,
  },
  footerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  footerActionsPhone: {
    flexDirection: "column-reverse",
  },
  successNotice: {
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    textAlign: "center",
  },
  applicationStatusNotice: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    textAlign: "center",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  secondaryButtonHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  secondaryButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonHover: {
    backgroundColor: Colors.brandDeep,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.surfaceDisabled,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.84,
  },
  description: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 25,
  },
  descriptionStack: {
    gap: Spacing.xl,
  },
  stateCard: {
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.five,
  },
  stateTitle: {
    color: Colors.text,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.extraBold,
  },
  stateText: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  retryButtonText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  skeletonStack: {
    gap: Spacing.three,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.xl,
    padding: Spacing.five,
  },
  skeletonTitle: {
    backgroundColor: "#E9EEF8",
    borderRadius: Radius.round,
    height: 18,
    width: "42%",
  },
  skeletonLine: {
    backgroundColor: "#F0F3F9",
    borderRadius: Radius.round,
    height: 14,
    width: "100%",
  },
  skeletonLineShort: {
    backgroundColor: "#F0F3F9",
    borderRadius: Radius.round,
    height: 14,
    width: "72%",
  },
});
