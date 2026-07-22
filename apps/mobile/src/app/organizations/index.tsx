import RequireAuth from "@/components/RequireAuth";
import OrganizationAvatar from "@/components/organizations/OrganizationAvatar";
import OrganizationProfileCompletion from "@/components/organizations/OrganizationProfileCompletion";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import {
  calculateOrganizationCompletion,
  getCompanyStatusLabel,
  getCompanyVerificationLabel,
} from "@/components/organizations/organizationProfile";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIBadge,
  RabAIButton,
  RabAICard,
  type RabAIBadgeTone,
} from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompanies,
  fetchOwnCompanyJobs,
  type CompanyDashboardJob,
  type CompanyProfile,
  type CompanyStatus,
  type CompanyVerificationStatus,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { type Href, useRouter } from "expo-router";
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
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const copy = getOrganizationCopy(language);
  const { user } = useAuth();
  const userId = user?.id;
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [jobs, setJobs] = useState<CompanyDashboardJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const singleCompany = companies.length === 1 ? companies[0] : null;
  const canPublishJobs =
    singleCompany?.status === "active" &&
    singleCompany.verification_status === "verified";
  const activeJobCount = useMemo(
    () => jobs.filter((job) => job.status === "published").length,
    [jobs]
  );
  const completionLabels = useMemo(
    () => ({
      city: t("common.city"),
      description: t("organizations.description"),
      employee_count_range: t("organizations.employeeCount"),
      industry: t("organizations.activityArea"),
      name: t("organizations.displayName"),
      website: t("organizations.website"),
    }),
    [t]
  );

  const loadOrganizations = useCallback(async () => {
    if (!userId) {
      setCompanies([]);
      setJobs([]);
      setError(t("organizations.loadError"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextCompanies = await fetchOwnCompanies(userId);
      const nextJobs =
        nextCompanies.length === 1
          ? await fetchOwnCompanyJobs(nextCompanies[0].id)
          : [];

      setCompanies(nextCompanies);
      setJobs(nextJobs);
    } catch {
      setCompanies([]);
      setJobs([]);
      setError(t("organizations.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadOrganizations();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadOrganizations]);

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
        description={t("organizations.subtitle")}
        title={t("organizations.title")}
      />

      {loading ? <LoadingState title={copy.loadingProfile} /> : null}

      {!loading && error ? (
        <ErrorState
          description={error}
          onRetry={() => void loadOrganizations()}
          retryLabel={copy.retry}
          title={t("organizations.loadError")}
        />
      ) : null}

      {!loading && !error && companies.length === 0 ? (
        <EmptyState
          actionLabel={copy.createOrganization}
          description={t("organizations.emptyText")}
          onAction={() => router.push("/organizations/create" as Href)}
          title={t("organizations.emptyTitle")}
        />
      ) : null}

      {!loading && !error && singleCompany ? (
        <>
          <RabAICard padding="lg">
            <View
              style={[
                styles.identityHeader,
                responsive.isMobile && styles.identityHeaderMobile,
              ]}
            >
              <OrganizationAvatar
                name={singleCompany.name}
                size={responsive.isMobile ? 58 : 72}
              />
              <View style={styles.identityCopy}>
                <Text style={styles.eyebrow}>{copy.ownedOrganization}</Text>
                <View style={styles.nameRow}>
                  <Text accessibilityRole="header" style={styles.companyName}>
                    {singleCompany.name}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.definitionList}>
              <DefinitionRow
                label={t("organizations.activityArea")}
                value={singleCompany.industry?.trim() || copy.notProvided}
              />
              <DefinitionRow
                label={t("common.city")}
                value={singleCompany.city?.trim() || copy.notProvided}
              />
              <DefinitionRow
                label={t("organizations.activeJobs")}
                value={String(activeJobCount)}
              />
            </View>

            <View style={styles.badgeRow}>
              <RabAIBadge
                label={getCompanyStatusLabel(singleCompany.status, language)}
                tone={companyStatusTone(singleCompany.status)}
              />
              <RabAIBadge
                label={getCompanyVerificationLabel(
                  singleCompany.verification_status,
                  language
                )}
                tone={verificationStatusTone(
                  singleCompany.verification_status
                )}
              />
            </View>

            <Text style={styles.bodyText}>
              {singleCompany.description || t("organizations.noDescription")}
            </Text>
          </RabAICard>

          <RabAICard title={t("organizations.quickActions")}>
            <View style={styles.actionGrid}>
              <RabAIButton
                fullWidth={responsive.isMobile}
                onPress={() =>
                  router.push(`/organizations/${singleCompany.id}` as Href)
                }
                style={styles.actionButton}
                title={t("organizations.details")}
              />
              <RabAIButton
                disabled={!canPublishJobs}
                fullWidth={responsive.isMobile}
                onPress={() => router.push("/create-job" as Href)}
                style={styles.actionButton}
                title={t("organizations.publishJob")}
                variant="outline"
              />
              <RabAIButton
                fullWidth={responsive.isMobile}
                onPress={() => router.push("/organizations/create" as Href)}
                style={styles.actionButton}
                title={t("organizations.edit")}
                variant="outline"
              />
              <RabAIButton
                fullWidth={responsive.isMobile}
                onPress={() => router.push("/applications" as Href)}
                style={styles.actionButton}
                title={t("organizations.applications")}
                variant="outline"
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
                        router.push(`/create-job?jobId=${job.id}` as Href)
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
      ) : null}

      {!loading && !error && companies.length >= 2
        ? companies.map((company, index) => {
            const completion = calculateOrganizationCompletion(company);

            return (
              <View
                key={company.id}
                style={[
                  styles.organizationRow,
                  index === companies.length - 1 && styles.organizationRowLast,
                ]}
              >
                <View
                  style={[
                    styles.identityHeader,
                    responsive.isMobile && styles.identityHeaderMobile,
                  ]}
                >
                  <OrganizationAvatar
                    name={company.name}
                    size={responsive.isMobile ? 58 : 72}
                  />
                  <View style={styles.identityCopy}>
                    <Text style={styles.eyebrow}>{copy.ownedOrganization}</Text>
                    <View style={styles.nameRow}>
                      <Text accessibilityRole="header" style={styles.companyName}>
                        {company.name}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.definitionList}>
                  <DefinitionRow
                    label={t("organizations.activityArea")}
                    value={company.industry?.trim() || copy.notProvided}
                  />
                  <DefinitionRow
                    label={t("common.city")}
                    value={company.city?.trim() || copy.notProvided}
                  />
                </View>

                <View style={styles.badgeRow}>
                  <RabAIBadge
                    label={getCompanyStatusLabel(company.status, language)}
                    tone={companyStatusTone(company.status)}
                  />
                  <RabAIBadge
                    label={getCompanyVerificationLabel(
                      company.verification_status,
                      language
                    )}
                    tone={verificationStatusTone(company.verification_status)}
                  />
                </View>

                <OrganizationProfileCompletion
                  checklistTitle={copy.completionChecklist}
                  company={company}
                  labels={completionLabels}
                  showChecklist
                  statusLabels={{
                    complete: copy.complete,
                    incomplete: copy.incomplete,
                  }}
                  summary={copy.completionSummary}
                  title={copy.profileCompletion}
                />

                <View
                  style={[
                    styles.actionGrid,
                    responsive.isMobile && styles.actionGridMobile,
                  ]}
                >
                  <RabAIButton
                    fullWidth={responsive.isMobile}
                    onPress={() =>
                      router.push(`/organizations/${company.id}` as Href)
                    }
                    style={styles.actionButton}
                    title={copy.viewOrganization}
                  />
                  <RabAIButton
                    fullWidth={responsive.isMobile}
                    onPress={() =>
                      router.push("/organizations/create" as Href)
                    }
                    style={styles.actionButton}
                    title={
                      completion.percentage === 100
                        ? copy.editOrganization
                        : copy.completeProfile
                    }
                    variant="secondary"
                  />
                </View>
              </View>
            );
          })
        : null}
    </PageContainer>
  );
}

function DefinitionRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.definitionRow}>
      <Text style={styles.definitionLabel}>{label}</Text>
      <Text selectable style={styles.definitionValue}>
        {value}
      </Text>
    </View>
  );
}

function companyStatusTone(status: CompanyStatus): RabAIBadgeTone {
  if (status === "active" || status === "verified") {
    return "success";
  }

  if (status === "draft" || status === "pending") {
    return "warning";
  }

  if (status === "archived" || status === "suspended") {
    return "danger";
  }

  return "neutral";
}

function verificationStatusTone(
  status: CompanyVerificationStatus
): RabAIBadgeTone {
  if (status === "verified") {
    return "success";
  }

  return status === "rejected" ? "danger" : "warning";
}

function formatJobStatus(value: string, t: (key: string) => string) {
  return t(`organizations.jobStatus.${value}`);
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  identityHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.component,
  },
  identityHeaderMobile: {
    alignItems: "flex-start",
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: Colors.primaryPressed,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: Typography.letterSpacing.eyebrow,
    marginBottom: Spacing.control,
    textTransform: "uppercase",
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  companyName: {
    color: Colors.textPrimary,
    flexShrink: 1,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.relaxed,
  },
  definitionList: {
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    marginTop: Spacing.component,
  },
  definitionRow: {
    alignItems: "flex-start",
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "space-between",
    paddingVertical: Spacing.control,
  },
  definitionLabel: {
    color: Colors.textMuted,
    flexBasis: 140,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  definitionValue: {
    color: Colors.textBody,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    minWidth: 140,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginTop: Spacing.component,
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.component,
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
  actionGridMobile: {
    flexDirection: "column",
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
  organizationRow: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    gap: Spacing.component,
    paddingBottom: Spacing.section,
  },
  organizationRowLast: {
    borderBottomWidth: 0,
  },
});
