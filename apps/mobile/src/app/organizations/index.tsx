import RequireAuth from "@/components/RequireAuth";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  fetchOwnCompanyJobs,
  type CompanyDashboardJob,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function OrganizationsScreen() {
  return (
    <RequireAuth>
      <OrganizationsContent />
    </RequireAuth>
  );
}

function OrganizationsContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<CompanyDashboardJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canPublishJobs =
    company?.status === "active" && company.verification_status === "verified";

  const activeJobCount = useMemo(
    () => jobs.filter((job) => job.status === "published").length,
    [jobs]
  );

  const loadOrganization = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextCompany = await fetchOwnCompany(userId);
      const nextJobs = nextCompany
        ? await fetchOwnCompanyJobs(nextCompany.id)
        : [];

      setCompany(nextCompany);
      setJobs(nextJobs);
    } catch (nextError) {
      setCompany(null);
      setJobs([]);
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("organizations.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadOrganization();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadOrganization]);

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
        description={t("organizations.subtitle")}
        title={t("organizations.title")}
      />

      {loading ? (
        <LoadingState title={t("organizations.loading")} />
      ) : error ? (
        <ErrorState
          description={error}
          onRetry={() => void loadOrganization()}
          retryLabel={getRetryLabel(language)}
          title={t("organizations.loadError")}
        />
      ) : !company ? (
        <EmptyState
          actionLabel={t("organizations.createAction")}
          description={t("organizations.emptyText")}
          onAction={() => router.push("/organizations/create" as any)}
          title={t("organizations.emptyTitle")}
        />
      ) : (
        <>
          <RabAICard title={company.name}>
            <View style={styles.infoGrid}>
              <InfoPill
                label={t("organizations.type")}
                value={t("organizations.type.company")}
              />
              <InfoPill
                label={t("common.status")}
                value={formatCompanyStatus(company.status, t)}
              />
              <InfoPill
                label={t("organizations.verification")}
                tone={
                  company.verification_status === "verified"
                    ? "success"
                    : "warning"
                }
                value={formatVerificationStatus(company.verification_status, t)}
              />
              <InfoPill
                label={t("organizations.activeJobs")}
                value={String(activeJobCount)}
              />
            </View>

            <Text style={styles.bodyText}>
              {company.description || t("organizations.noDescription")}
            </Text>
          </RabAICard>

          <RabAICard title={t("organizations.quickActions")}>
            <View style={styles.actionGrid}>
              <ActionButton
                label={t("organizations.details")}
                onPress={() => router.push(`/organizations/${company.id}` as any)}
              />
              <ActionButton
                disabled={!canPublishJobs}
                label={t("organizations.publishJob")}
                onPress={() => router.push("/create-job" as any)}
              />
              <ActionButton
                label={t("organizations.edit")}
                onPress={() => router.push("/organizations/create" as any)}
              />
              <ActionButton
                label={t("organizations.applications")}
                onPress={() => router.push("/applications" as any)}
              />
            </View>
            {!canPublishJobs ? (
              <Text style={styles.hintText}>
                {t("organizations.publishRequirement")}
              </Text>
            ) : null}
          </RabAICard>

          <RabAICard title={t("organizations.jobsTitle")}>
            {jobs.length > 0 ? (
              <View style={styles.jobList}>
                {jobs.map((job) => (
                  <View key={job.id} style={styles.jobRow}>
                    <View style={styles.jobMain}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.mutedText}>
                        {formatJobStatus(job.status, t)}
                      </Text>
                    </View>
                    <RabAIButton
                      onPress={() =>
                        router.push(`/create-job?jobId=${job.id}` as any)
                      }
                      size="sm"
                      title={t("organizations.editJob")}
                      variant="outline"
                    />
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState compact title={t("organizations.noJobs")} />
            )}
          </RabAICard>
        </>
      )}
    </PageContainer>
  );
}

function InfoPill({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "success" | "warning";
  value: string;
}) {
  return (
    <View
      style={[
        styles.infoPill,
        tone === "success" && styles.infoPillSuccess,
        tone === "warning" && styles.infoPillWarning,
      ]}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <RabAIButton
      disabled={disabled}
      onPress={onPress}
      size="sm"
      style={styles.actionButton}
      title={label}
      variant="outline"
    />
  );
}

function formatVerificationStatus(value: string, t: (key: string) => string) {
  if (value === "verified") {
    return t("verification.status.verified");
  }

  if (value === "rejected") {
    return t("organizations.verification.rejected");
  }

  return t("organizations.unverifiedStatus");
}

function formatCompanyStatus(value: string, t: (key: string) => string) {
  return t(`organizations.status.${value}`);
}

function formatJobStatus(value: string, t: (key: string) => string) {
  return t(`organizations.jobStatus.${value}`);
}

function getRetryLabel(language: string) {
  if (language === "de") {
    return "Erneut versuchen";
  }

  if (language === "en") {
    return "Try again";
  }

  return "Reîncearcă";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginBottom: Spacing.component,
  },
  infoPill: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.control,
    flexBasis: 160,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.inline,
  },
  infoPillSuccess: {
    backgroundColor: Colors.successSurface,
  },
  infoPillWarning: {
    backgroundColor: Colors.warningSurface,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.compact,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.component,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  actionButton: {
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
  },
  jobList: {
    gap: Spacing.control,
  },
  jobRow: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.control,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "space-between",
    padding: Spacing.inline,
  },
  jobMain: {
    flexBasis: 160,
    flexGrow: 1,
    minWidth: 0,
  },
  jobTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
