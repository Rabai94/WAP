import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
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
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const { t } = useLanguage();
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
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: responsive.isMobile ? Spacing.sm : Spacing.md,
            maxWidth: responsive.contentMaxWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AuthenticatedHeader active="profile" />

        <Header
          title={t("organizations.title")}
          subtitle={t("organizations.subtitle")}
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>{t("organizations.loading")}</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && !company ? (
          <Card title={t("organizations.emptyTitle")}>
            <Text style={styles.bodyText}>{t("organizations.emptyText")}</Text>
            <Button
              title={t("organizations.createAction")}
              style={styles.cardButton}
              onPress={() => router.push("/organizations/create" as any)}
            />
          </Card>
        ) : null}

        {company ? (
          <>
            <Card title={company.name}>
              <View style={styles.infoGrid}>
                <InfoPill
                  compact={responsive.isMobile}
                  label={t("organizations.type")}
                  value={t("organizations.type.company")}
                />
                <InfoPill
                  compact={responsive.isMobile}
                  label={t("common.status")}
                  value={formatCompanyStatus(company.status, t)}
                />
                <InfoPill
                  compact={responsive.isMobile}
                  label={t("organizations.verification")}
                  tone={
                    company.verification_status === "verified"
                      ? "success"
                      : "warning"
                  }
                  value={formatVerificationStatus(company.verification_status, t)}
                />
                <InfoPill
                  compact={responsive.isMobile}
                  label={t("organizations.activeJobs")}
                  value={String(activeJobCount)}
                />
              </View>

              <Text style={styles.bodyText}>
                {company.description || t("organizations.noDescription")}
              </Text>
            </Card>

            <Card title={t("organizations.quickActions")}>
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
            </Card>

            <Card title={t("organizations.jobsTitle")}>
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
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          router.push(`/create-job?jobId=${job.id}` as any)
                        }
                        style={styles.smallButton}
                      >
                        <Text style={styles.smallButtonText}>
                          {t("organizations.editJob")}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.bodyText}>{t("organizations.noJobs")}</Text>
              )}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoPill({
  compact,
  label,
  tone,
  value,
}: {
  compact?: boolean;
  label: string;
  tone?: "success" | "warning";
  value: string;
}) {
  return (
    <View
      style={[
        styles.infoPill,
        compact && styles.infoPillCompact,
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
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

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoPill: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  infoPillCompact: {
    flexBasis: "100%",
  },
  infoPillSuccess: {
    backgroundColor: "#E8F8F2",
    borderColor: "#BEEBD7",
  },
  infoPillWarning: {
    backgroundColor: "#FFF7E8",
    borderColor: "#F6D7A8",
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
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  cardButton: {
    marginTop: Spacing.lg,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  jobList: {
    gap: Spacing.md,
  },
  jobRow: {
    alignItems: "center",
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  jobMain: {
    flexBasis: 260,
    flexGrow: 1,
  },
  jobTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  smallButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  smallButtonText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
