import PublicHeader from "@/components/navigation/PublicHeader";
import {
  DefinitionList,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  Section,
  type DefinitionListItem,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  getJobReturnLabel,
  sanitizeReturnPath,
} from "@/services/jobs/jobNavigation";
import { buildLoginPath } from "@/services/auth/authNavigation";
import {
  applyToJob,
  fetchJobDetails,
  fetchOwnWorkerProfile,
  type JobDetails,
} from "@/services/worker/workerService";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function JobDetailsScreen() {
  const router = useRouter();
  const { from, id } = useLocalSearchParams<{
    from?: string | string[];
    id?: string | string[];
  }>();
  const { t } = useLanguage();
  const { session } = useAuth();
  const jobId = Array.isArray(id) ? id[0] : id;
  const fallbackReturnPath = session ? "/engine" : "/";
  const returnPath = useMemo(
    () => sanitizeReturnPath(from) ?? fallbackReturnPath,
    [fallbackReturnPath, from]
  );
  const returnLabel = useMemo(
    () => getJobReturnLabel(returnPath),
    [returnPath]
  );
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [requiresProfileCompletion, setRequiresProfileCompletion] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadJob() {
      if (!jobId || !isUuid(jobId)) {
        setError("Jobul nu mai este disponibil.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const nextJob = await fetchJobDetails(jobId);

        if (!mounted) {
          return;
        }

        setJob(nextJob);

        if (!nextJob) {
          setError("Jobul nu mai este disponibil.");
        }
      } catch {
        if (mounted) {
          setError("Jobul nu mai este disponibil.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadJob();

    return () => {
      mounted = false;
    };
  }, [jobId]);

  async function handleApply() {
    if (!jobId) {
      return;
    }

    if (!session) {
      router.push(buildLoginPath(`/jobs/${jobId}`) as any);
      return;
    }

    setApplying(true);
    setApplyError("");
    setRequiresProfileCompletion(false);

    try {
      const workerProfile = await fetchOwnWorkerProfile(session.user.id);

      if (!workerProfile) {
        setApplyError(t("jobs.apply.legacyProfileRequired"));
        setRequiresProfileCompletion(true);
        return;
      }

      const applicationId = await applyToJob(jobId);
      router.replace(
        `/application-sent?applicationId=${applicationId}&jobId=${jobId}` as any
      );
    } catch (nextError) {
      setApplyError(readError(nextError));
    } finally {
      setApplying(false);
    }
  }

  const detailItems: DefinitionListItem[] = job
    ? [
        { label: "Companie", value: job.company_name },
        { label: "Locație", value: job.location_label },
        { label: "Salariu", value: formatSalary(job) },
        { label: "Contract", value: formatEmploymentType(job.employment_type) },
        { label: "Program", value: job.working_hours || "Nespecificat" },
        { label: "Limbă", value: formatLanguage(job.language) },
        { label: "Experiență", value: formatExperience(job.experience_level) },
        { label: "Ocupație", value: job.occupation_name_ro },
        { label: "Publicat", value: formatDate(job.published_at) },
        {
          label: "Expiră",
          value: job.expires_at ? formatDate(job.expires_at) : "Nespecificat",
        },
      ]
    : [];

  return (
    <PageContainer maxWidth="content" scroll>
      {!session ? <PublicHeader active="jobs" /> : null}
      {loading ? (
        <>
          <PageHeader
            description="Verificăm disponibilitatea și detaliile publice."
            onBack={() => router.replace(returnPath as never)}
            backLabel={returnLabel}
            title="Se încarcă jobul"
          />
          <LoadingState title="Se încarcă detaliile jobului..." />
        </>
      ) : error ? (
        <>
          <PageHeader
            description="Acest job nu poate fi afișat momentan."
            onBack={() => router.replace(returnPath as never)}
            backLabel={returnLabel}
            title="Job indisponibil"
          />
          <ErrorState description={error} title="Jobul nu este disponibil" />
        </>
      ) : job ? (
        <>
          <PageHeader
            actions={
              session ? (
                <RabAIButton
                  loading={applying}
                  loadingLabel="Se trimite..."
                  onPress={handleApply}
                  title="Aplică"
                />
              ) : (
                <RabAIButton
                  onPress={handleApply}
                  title="Autentifică-te pentru a aplica"
                />
              )
            }
            backLabel={returnLabel}
            description={`${job.company_name} · ${job.location_label}`}
            onBack={() => router.replace(returnPath as never)}
            title={job.title}
          />

          {applyError ? (
            <View accessibilityLiveRegion="assertive" role="alert" style={styles.applyError}>
              <Text style={styles.errorText}>{applyError}</Text>
              {requiresProfileCompletion ? (
                <RabAIButton
                  onPress={() => router.push("/profile/edit" as never)}
                  size="sm"
                  title={t("jobs.apply.completeProfileAction")}
                  variant="secondary"
                />
              ) : null}
            </View>
          ) : null}

          <Section title="Detalii job">
            <DefinitionList columns={2} items={detailItems} />
          </Section>
          <Section title="Descriere">
            <Text selectable style={styles.description}>{job.description}</Text>
          </Section>
        </>
      ) : null}
    </PageContainer>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatSalary(job: JobDetails) {
  if (job.salary_from === null && job.salary_to === null) {
    return "Nespecificat";
  }

  const suffix = formatSalaryType(job.salary_type);

  if (job.salary_from !== null && job.salary_to !== null) {
    return `${job.salary_from} - ${job.salary_to} EUR ${suffix}`;
  }

  if (job.salary_from !== null) {
    return `de la ${job.salary_from} EUR ${suffix}`;
  }

  return `pana la ${job.salary_to} EUR ${suffix}`;
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

function formatEmploymentType(value: string) {
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

  return "Contract";
}

function formatExperience(value: string) {
  if (value === "entry") {
    return "Entry";
  }

  if (value === "junior") {
    return "Junior";
  }

  if (value === "mid") {
    return "Mid";
  }

  if (value === "senior") {
    return "Senior";
  }

  return "Oricare";
}

function formatLanguage(value: string) {
  if (value === "ro") {
    return "Romana";
  }

  if (value === "en") {
    return "Engleza";
  }

  if (value === "any") {
    return "Oricare";
  }

  return "Germana";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca jobul.";
}

const styles = StyleSheet.create({
  applyError: {
    alignItems: "flex-start",
    backgroundColor: Colors.dangerSurface,
    borderLeftColor: Colors.danger,
    borderLeftWidth: 3,
    gap: Spacing.control,
    marginBottom: Spacing.section,
    padding: Spacing.component,
  },
  description: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
});
