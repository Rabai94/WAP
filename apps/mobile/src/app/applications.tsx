import RequireAuth from "@/components/RequireAuth";
import {
  EmptyState,
  ErrorState,
  ListingRow,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  Section,
  StatusBadge,
  type RabAIBadgeTone,
  type ListingRowMetaItem,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import {
  listCompanyApplications,
  updateApplicationStatus,
  type CompanyApplication,
} from "@/services/worker/workerService";
import { Spacing } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

type ApplicationStatusAction =
  | "viewed"
  | "shortlisted"
  | "accepted"
  | "rejected";

type ApplicationsCopy = {
  applied: string;
  back: string;
  emptyDescription: string;
  emptyTitle: string;
  experience: string;
  filteredSubtitle: string;
  filteredTitle: string;
  loadError: string;
  loading: string;
  retry: string;
  updateError: string;
};

const copyByLanguage: Record<LanguageCode, ApplicationsCopy> = {
  de: {
    applied: "Beworben",
    back: "Zurück zu Organisationen",
    emptyDescription:
      "Bewerbungen auf Jobs deiner Organisation werden hier angezeigt.",
    emptyTitle: "Noch keine Bewerbungen",
    experience: "Erfahrung",
    filteredSubtitle: "Es werden nur Bewerbungen für den gewählten Job angezeigt.",
    filteredTitle: "Bewerbungen für den Job",
    loadError: "Die Bewerbungen konnten nicht geladen werden.",
    loading: "Bewerbungen werden geladen",
    retry: "Erneut versuchen",
    updateError: "Der Bewerbungsstatus konnte nicht aktualisiert werden.",
  },
  en: {
    applied: "Applied",
    back: "Back to organizations",
    emptyDescription:
      "Applications submitted to your organization’s jobs will appear here.",
    emptyTitle: "No applications yet",
    experience: "Experience",
    filteredSubtitle: "Only applications for the selected job are shown.",
    filteredTitle: "Applications for this job",
    loadError: "Applications could not be loaded.",
    loading: "Loading applications",
    retry: "Try again",
    updateError: "The application status could not be updated.",
  },
  ro: {
    applied: "Aplicat",
    back: "Înapoi la organizații",
    emptyDescription:
      "Aplicările trimise la joburile organizației tale vor apărea aici.",
    emptyTitle: "Momentan nu există aplicări",
    experience: "Experiență",
    filteredSubtitle: "Sunt afișate doar aplicările pentru jobul selectat.",
    filteredTitle: "Aplicări pentru job",
    loadError: "Aplicările nu au putut fi încărcate.",
    loading: "Se încarcă aplicările",
    retry: "Încearcă din nou",
    updateError: "Statusul aplicării nu a putut fi actualizat.",
  },
};

const statusActions: Record<
  LanguageCode,
  readonly { label: string; value: ApplicationStatusAction }[]
> = {
  de: [
    { label: "Gesehen", value: "viewed" },
    { label: "Vorausgewählt", value: "shortlisted" },
    { label: "Akzeptiert", value: "accepted" },
    { label: "Abgelehnt", value: "rejected" },
  ],
  en: [
    { label: "Viewed", value: "viewed" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Accepted", value: "accepted" },
    { label: "Rejected", value: "rejected" },
  ],
  ro: [
    { label: "Văzută", value: "viewed" },
    { label: "Selectată", value: "shortlisted" },
    { label: "Acceptată", value: "accepted" },
    { label: "Respinsă", value: "rejected" },
  ],
};

const statusLabels: Record<LanguageCode, Record<string, string>> = {
  de: {
    accepted: "Akzeptiert",
    rejected: "Abgelehnt",
    shortlisted: "Vorausgewählt",
    submitted: "Gesendet",
    viewed: "Gesehen",
    withdrawn: "Zurückgezogen",
  },
  en: {
    accepted: "Accepted",
    rejected: "Rejected",
    shortlisted: "Shortlisted",
    submitted: "Submitted",
    viewed: "Viewed",
    withdrawn: "Withdrawn",
  },
  ro: {
    accepted: "Acceptată",
    rejected: "Respinsă",
    shortlisted: "Selectată",
    submitted: "Trimisă",
    viewed: "Văzută",
    withdrawn: "Retrasă",
  },
};

export default function ApplicationsScreen() {
  return (
    <RequireAuth>
      <ApplicationsContent />
    </RequireAuth>
  );
}

function ApplicationsContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const copy = copyByLanguage[language];
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const requestedJobId = readParam(params.jobId);
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");

  const groupedApplications = useMemo(() => {
    const groups = new Map<string, CompanyApplication[]>();
    const visibleApplications = requestedJobId
      ? applications.filter(
          (application) => application.job_id === requestedJobId
        )
      : applications;

    for (const application of visibleApplications) {
      const current = groups.get(application.job_id) ?? [];
      current.push(application);
      groups.set(application.job_id, current);
    }

    return Array.from(groups.entries()).map(([jobId, items]) => ({
      applications: items,
      jobId,
      jobTitle: items[0]?.job_title ?? "Job",
    }));
  }, [applications, requestedJobId]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      setApplications(await listCompanyApplications());
    } catch (nextError) {
      setLoadError(readError(nextError, copy.loadError));
    } finally {
      setLoading(false);
    }
  }, [copy.loadError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadApplications]);

  async function handleStatusUpdate(
    applicationId: string,
    status: ApplicationStatusAction
  ) {
    setUpdatingApplicationId(applicationId);
    setUpdateError("");

    try {
      await updateApplicationStatus(applicationId, status);
      setApplications((current) =>
        current.map((application) =>
          application.application_id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (nextError) {
      setUpdateError(readError(nextError, copy.updateError));
    } finally {
      setUpdatingApplicationId("");
    }
  }

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
        backLabel={copy.back}
        description={
          requestedJobId ? copy.filteredSubtitle : t("applications.subtitle")
        }
        onBack={() => router.replace("/organizations")}
        title={requestedJobId ? copy.filteredTitle : t("applications.title")}
      />

      {loading ? <LoadingState title={copy.loading} /> : null}
      {!loading && loadError ? (
        <ErrorState
          description={loadError}
          onRetry={() => void loadApplications()}
          retryLabel={copy.retry}
          title={copy.loadError}
        />
      ) : null}
      {updateError ? (
        <ErrorState
          compact
          description={
            updateError === copy.updateError ? undefined : updateError
          }
          title={copy.updateError}
        />
      ) : null}
      {!loading && !loadError && groupedApplications.length === 0 ? (
        <EmptyState
          description={copy.emptyDescription}
          title={copy.emptyTitle}
        />
      ) : null}

      {!loading && !loadError
        ? groupedApplications.map((group) => (
            <Section key={group.jobId} title={group.jobTitle}>
              <View style={styles.applicationList}>
                {group.applications.map((application) => {
                  const updating =
                    updatingApplicationId === application.application_id;
                  const withdrawn = application.status === "withdrawn";
                  const meta = buildApplicationMeta(
                    application,
                    copy,
                    language,
                    t("common.location")
                  );

                  return (
                    <ListingRow
                      accessibilityLabel={`${application.worker_name}, ${formatApplicationStatus(
                        application.status,
                        language
                      )}`}
                      actions={
                        <View style={styles.actionRow}>
                          {statusActions[language].map((action) => {
                            const selected =
                              application.status === action.value;
                            const disabled = updating || withdrawn;

                            return (
                              <RabAIButton
                                accessibilityState={{
                                  busy: updating,
                                  disabled,
                                  selected,
                                }}
                                disabled={disabled}
                                key={action.value}
                                onPress={() =>
                                  void handleStatusUpdate(
                                    application.application_id,
                                    action.value
                                  )
                                }
                                size="sm"
                                title={action.label}
                                variant={selected ? "secondary" : "ghost"}
                              />
                            );
                          })}
                        </View>
                      }
                      badges={
                        <StatusBadge
                          label={formatApplicationStatus(
                            application.status,
                            language
                          )}
                          status={application.status}
                          tone={applicationStatusTone(application.status)}
                        />
                      }
                      description={application.message ?? undefined}
                      key={application.application_id}
                      meta={meta}
                      subtitle={formatOccupation(application, language)}
                      title={application.worker_name}
                    />
                  );
                })}
              </View>
            </Section>
          ))
        : null}
    </PageContainer>
  );
}

function buildApplicationMeta(
  application: CompanyApplication,
  copy: ApplicationsCopy,
  language: LanguageCode,
  locationLabel: string
): ListingRowMetaItem[] {
  return [
    {
      label: copy.experience,
      value: formatExperience(application.experience_years, language),
    },
    {
      label: locationLabel,
      value: application.worker_location_label || application.worker_city,
    },
    {
      label: copy.applied,
      value: formatDate(application.created_at, language),
    },
  ];
}

function formatOccupation(
  application: CompanyApplication,
  language: LanguageCode
) {
  if (language === "de") {
    return application.occupation_name_de;
  }

  if (language === "en") {
    return application.occupation_name_en;
  }

  return application.occupation_name_ro;
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatApplicationStatus(value: string, language: LanguageCode) {
  return statusLabels[language][value] ?? statusLabels[language].submitted;
}

function applicationStatusTone(value: string): RabAIBadgeTone {
  if (value === "accepted") {
    return "success";
  }

  if (value === "rejected") {
    return "danger";
  }

  if (value === "shortlisted") {
    return "warning";
  }

  if (value === "withdrawn") {
    return "neutral";
  }

  return "information";
}

function formatExperience(value: number, language: LanguageCode) {
  if (language === "de") {
    return `${value} ${value === 1 ? "Jahr" : "Jahre"}`;
  }

  if (language === "en") {
    return `${value} ${value === 1 ? "year" : "years"}`;
  }

  return `${value} ${value === 1 ? "an" : "ani"}`;
}

function formatDate(value: string, language: LanguageCode) {
  const locale = language === "de" ? "de-DE" : language === "en" ? "en-GB" : "ro-RO";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  applicationList: {
    minWidth: 0,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
});
