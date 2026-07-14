import { Button, Card, Header, Screen } from "@/components/ui";
import { canAccessRole } from "@/domain/auth/roleAccess";
import { useAuth } from "@/providers/AuthProvider";
import {
  applyToJob,
  fetchJobDetails,
  type JobDetails,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { session, user } = useAuth();
  const jobId = Array.isArray(id) ? id[0] : id;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadJob() {
      if (!jobId) {
        setError("Jobul nu a fost gasit.");
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
          setError("Jobul nu este disponibil pentru aplicare.");
        }
      } catch (nextError) {
        if (mounted) {
          setError(readError(nextError));
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
      router.push("/login" as any);
      return;
    }

    if (!canAccessRole(user, "worker")) {
      setApplyError("Doar conturile worker pot aplica la joburi.");
      return;
    }

    setApplying(true);
    setApplyError("");

    try {
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

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/jobs" as any)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Inapoi la joburi</Text>
          </Pressable>
        </View>

        {loading ? (
          <>
            <Header title="Se incarca jobul" subtitle="Verificam detaliile jobului." />
            <Card>
              <Text style={styles.mutedText}>Se incarca...</Text>
            </Card>
          </>
        ) : error ? (
          <>
            <Header title="Job indisponibil" subtitle="Acest job nu poate fi afisat momentan." />
            <Card>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          </>
        ) : job ? (
          <>
            <Header
              title={job.title}
              subtitle={`${job.company_name} - ${job.location_label}`}
            />

            <Card title="Detalii job">
              <View style={styles.infoGrid}>
                <InfoLine label="Companie" value={job.company_name} />
                <InfoLine label="Locatie" value={job.location_label} />
                <InfoLine label="Salariu" value={formatSalary(job)} />
                <InfoLine label="Contract" value={formatEmploymentType(job.employment_type)} />
                <InfoLine label="Program" value={job.working_hours || "Nespecificat"} />
                <InfoLine label="Limba" value={formatLanguage(job.language)} />
                <InfoLine label="Experienta" value={formatExperience(job.experience_level)} />
                <InfoLine label="Ocupatie" value={job.occupation_name_ro} />
                <InfoLine label="Publicat" value={formatDate(job.published_at)} />
                <InfoLine
                  label="Expira"
                  value={job.expires_at ? formatDate(job.expires_at) : "Nespecificat"}
                />
              </View>
            </Card>

            <Card title="Descriere">
              <Text style={styles.description}>{job.description}</Text>
            </Card>

            {applyError ? <Text style={styles.errorText}>{applyError}</Text> : null}

            {session ? (
              <Button
                disabled={applying}
                title={applying ? "Se trimite..." : "Aplica"}
                onPress={handleApply}
              />
            ) : (
              <Button title="Autentifica-te pentru a aplica" onPress={handleApply} />
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  topBar: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  infoItem: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  description: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 25,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  mutedText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
