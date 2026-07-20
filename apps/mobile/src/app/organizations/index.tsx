import RequireAuth from "@/components/RequireAuth";
import OrganizationActionButton from "@/components/organizations/OrganizationActionButton";
import OrganizationAvatar from "@/components/organizations/OrganizationAvatar";
import OrganizationProfileCompletion from "@/components/organizations/OrganizationProfileCompletion";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import { calculateOrganizationCompletion } from "@/components/organizations/organizationProfile";
import { Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompanies,
  type CompanyProfile,
  type CompanyStatus,
  type CompanyVerificationStatus,
} from "@/services/company/companyService";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const companyStatusLabels: Record<
  LanguageCode,
  Record<CompanyStatus, string>
> = {
  de: {
    active: "Aktiv",
    archived: "Archiviert",
    draft: "Entwurf",
    inactive: "Inaktiv",
    pending: "Ausstehend",
    suspended: "Gesperrt",
    verified: "Bestätigt",
  },
  en: {
    active: "Active",
    archived: "Archived",
    draft: "Draft",
    inactive: "Inactive",
    pending: "Pending",
    suspended: "Suspended",
    verified: "Verified",
  },
  ro: {
    active: "Activă",
    archived: "Arhivată",
    draft: "Ciornă",
    inactive: "Inactivă",
    pending: "În așteptare",
    suspended: "Suspendată",
    verified: "Verificată",
  },
};

const verificationStatusLabels: Record<
  LanguageCode,
  Record<CompanyVerificationStatus, string>
> = {
  de: {
    pending: "Ausstehend",
    rejected: "Abgelehnt",
    verified: "Verifiziert",
  },
  en: {
    pending: "Pending",
    rejected: "Rejected",
    verified: "Verified",
  },
  ro: {
    pending: "În așteptare",
    rejected: "Respinsă",
    verified: "Verificată",
  },
};

const completionStateLabels: Record<
  LanguageCode,
  { complete: string; incomplete: string }
> = {
  de: { complete: "Vollständig", incomplete: "Unvollständig" },
  en: { complete: "Complete", incomplete: "Incomplete" },
  ro: { complete: "Complet", incomplete: "Incomplet" },
};

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
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

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
      setRedirecting(false);
      setError(t("organizations.loadError"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setRedirecting(false);
    setError("");

    try {
      const nextCompanies = await fetchOwnCompanies(userId);

      if (nextCompanies.length === 1) {
        setCompanies([]);
        setRedirecting(true);
        router.replace(`/organizations/${nextCompanies[0].id}` as Href);
        return;
      }

      setCompanies(nextCompanies);
    } catch {
      setCompanies([]);
      setRedirecting(false);
      setError(t("organizations.loadError"));
    } finally {
      setLoading(false);
    }
  }, [router, t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadOrganizations();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadOrganizations]);

  const showingLoadingState = loading || redirecting;

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
            maxWidth: Math.min(responsive.contentMaxWidth, 1040),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={t("organizations.title")}
          subtitle={t("organizations.subtitle")}
        />

        {showingLoadingState ? (
          <View
            accessibilityLabel={copy.loadingProfile}
            accessibilityRole="progressbar"
            style={styles.stateCard}
          >
            <ActivityIndicator
              accessible={false}
              color={Colors.brand}
              size="small"
            />
            <Text accessibilityLiveRegion="polite" style={styles.stateText}>
              {copy.loadingProfile}
            </Text>
          </View>
        ) : null}

        {!showingLoadingState && error ? (
          <View style={[styles.stateCard, styles.errorCard]}>
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.errorText}
            >
              {error}
            </Text>
            <OrganizationActionButton
              accessibilityHint={copy.loadingProfile}
              fullWidth={responsive.isMobile}
              label={copy.retry}
              onPress={() => void loadOrganizations()}
              variant="secondary"
            />
          </View>
        ) : null}

        {!showingLoadingState && !error && companies.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyCopy}>
              <Text accessibilityRole="header" style={styles.emptyTitle}>
                {t("organizations.emptyTitle")}
              </Text>
              <Text style={styles.bodyText}>
                {t("organizations.emptyText")}
              </Text>
            </View>
            <OrganizationActionButton
              accessibilityHint={t("organizations.createSubtitle")}
              fullWidth={responsive.isMobile}
              label={copy.createOrganization}
              onPress={() => router.push("/organizations/create" as Href)}
              variant="primary"
            />
          </View>
        ) : null}

        {!showingLoadingState && !error && companies.length >= 2
          ? companies.map((company) => {
              const completion = calculateOrganizationCompletion(company);

              return (
                <View key={company.id} style={styles.organizationCard}>
                  <View
                    style={[
                      styles.organizationHeader,
                      responsive.isMobile && styles.organizationHeaderMobile,
                    ]}
                  >
                    <OrganizationAvatar
                      name={company.name}
                      size={responsive.isMobile ? 58 : 72}
                    />
                    <View style={styles.organizationIdentity}>
                      <Text style={styles.eyebrow}>
                        {copy.ownedOrganization}
                      </Text>
                      <View style={styles.nameRow}>
                        <Text
                          accessibilityRole="header"
                          style={styles.companyName}
                        >
                          {company.name}
                        </Text>
                        {company.verification_status === "verified" ? (
                          <View
                            accessibilityLabel={`${t("organizations.verification")}: ${formatVerificationStatus(company.verification_status, language)}`}
                            accessible
                            style={styles.verifiedBadge}
                          >
                            <Text style={styles.verifiedBadgeText}>
                              ✓{" "}
                              {formatVerificationStatus(
                                company.verification_status,
                                language
                              )}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <View style={styles.factGrid}>
                    <FactItem
                      fullWidth={responsive.isMobile}
                      label={t("organizations.activityArea")}
                      value={company.industry?.trim() || copy.notProvided}
                    />
                    <FactItem
                      fullWidth={responsive.isMobile}
                      label={t("common.city")}
                      value={company.city?.trim() || copy.notProvided}
                    />
                  </View>

                  <View style={styles.statusGrid}>
                    <StatusItem
                      fullWidth={responsive.isMobile}
                      label={copy.internalStatus}
                      tone={companyStatusTone(company.status)}
                      value={formatCompanyStatus(company.status, language)}
                    />
                    <StatusItem
                      fullWidth={responsive.isMobile}
                      label={t("organizations.verification")}
                      tone={verificationStatusTone(
                        company.verification_status
                      )}
                      value={formatVerificationStatus(
                        company.verification_status,
                        language
                      )}
                    />
                  </View>

                  <OrganizationProfileCompletion
                    checklistTitle={copy.completionChecklist}
                    company={company}
                    labels={completionLabels}
                    showChecklist
                    statusLabels={completionStateLabels[language]}
                    summary={copy.completionSummary}
                    title={copy.profileCompletion}
                  />

                  <View
                    style={[
                      styles.actionRow,
                      responsive.isMobile && styles.actionRowMobile,
                    ]}
                  >
                    <OrganizationActionButton
                      accessibilityHint={copy.publicDataNote}
                      fullWidth={responsive.isMobile}
                      label={copy.viewOrganization}
                      onPress={() =>
                        router.push(`/organizations/${company.id}` as Href)
                      }
                      variant="primary"
                    />
                    <OrganizationActionButton
                      accessibilityHint={copy.formSubtitle}
                      fullWidth={responsive.isMobile}
                      label={
                        completion.percentage === 100
                          ? copy.editOrganization
                          : copy.completeProfile
                      }
                      onPress={() =>
                        router.push("/organizations/create" as Href)
                      }
                      variant="secondary"
                    />
                  </View>
                </View>
              );
            })
          : null}
      </ScrollView>
    </Screen>
  );
}

function FactItem({
  fullWidth,
  label,
  value,
}: {
  fullWidth: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.factItem, fullWidth && styles.fullWidthItem]}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text selectable style={styles.factValue}>
        {value}
      </Text>
    </View>
  );
}

function StatusItem({
  fullWidth,
  label,
  tone,
  value,
}: {
  fullWidth: boolean;
  label: string;
  tone: "danger" | "neutral" | "success" | "warning";
  value: string;
}) {
  return (
    <View
      accessibilityLabel={`${label}: ${value}`}
      accessible
      style={[
        styles.statusItem,
        fullWidth && styles.fullWidthItem,
        tone === "success" && styles.statusItemSuccess,
        tone === "warning" && styles.statusItemWarning,
        tone === "danger" && styles.statusItemDanger,
      ]}
    >
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function formatCompanyStatus(value: CompanyStatus, language: LanguageCode) {
  return companyStatusLabels[language][value];
}

function formatVerificationStatus(
  value: CompanyVerificationStatus,
  language: LanguageCode
) {
  return verificationStatusLabels[language][value];
}

function companyStatusTone(
  status: CompanyStatus
): "danger" | "neutral" | "success" | "warning" {
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
): "danger" | "success" | "warning" {
  if (status === "verified") {
    return "success";
  }

  return status === "rejected" ? "danger" : "warning";
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.screen,
    ...Shadows.card,
  },
  stateText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    textAlign: "center",
  },
  errorCard: {
    alignItems: "stretch",
    borderColor: "#FDA4AF",
  },
  errorText: {
    color: "#BE123C",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.default,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.screen,
    padding: Spacing.screen,
    ...Shadows.card,
  },
  emptyCopy: {
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.black,
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  organizationCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.three,
    overflow: "hidden",
    padding: Spacing.screen,
    ...Shadows.card,
  },
  organizationHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
  },
  organizationHeaderMobile: {
    alignItems: "flex-start",
  },
  organizationIdentity: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: Colors.brand,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  companyName: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 30,
  },
  verifiedBadge: {
    backgroundColor: "#E8F8F2",
    borderColor: "#BEEBD7",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  verifiedBadgeText: {
    color: "#056B4B",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  factItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.three,
  },
  factLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  factValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statusItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.three,
  },
  statusItemSuccess: {
    backgroundColor: "#E8F8F2",
    borderColor: "#BEEBD7",
  },
  statusItemWarning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  statusItemDanger: {
    backgroundColor: "#FFF1F2",
    borderColor: "#FDA4AF",
  },
  statusLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  statusValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.xs,
  },
  fullWidthItem: {
    flexBasis: "100%",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionRowMobile: {
    flexDirection: "column",
  },
});
