import OrganizationActionButton from "@/components/organizations/OrganizationActionButton";
import OrganizationHero from "@/components/organizations/OrganizationHero";
import OwnerOrganizationDashboard from "@/components/organizations/OwnerOrganizationDashboard";
import PublicOrganizationProfile from "@/components/organizations/PublicOrganizationProfile";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import { Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  fetchPublicCompanyById,
  toPublicCompanyProfile,
  type CompanyProfile,
  type CompanyStatus,
  type CompanyVerificationStatus,
  type PublicCompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type ProfileError =
  | { kind: "invalid" }
  | { kind: "load" }
  | { kind: "not-found" };

export default function OrganizationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    view?: string | string[];
  }>();
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const copy = getOrganizationCopy(language);
  const { loading: authLoading, user } = useAuth();
  const organizationId = readParam(params.id)?.trim() ?? "";
  const publicPreviewRequested = readParam(params.view) === "public";
  const [publicCompany, setPublicCompany] =
    useState<PublicCompanyProfile | null>(null);
  const [ownedCompany, setOwnedCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ProfileError | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let mounted = true;

    async function loadOrganization() {
      setLoading(true);
      setError(null);
      setOwnedCompany(null);
      setPublicCompany(null);

      if (!isUuid(organizationId)) {
        setError({ kind: "invalid" });
        setLoading(false);
        return;
      }

      try {
        const ownCompany = user?.id
          ? await fetchOwnCompany(user.id)
          : null;
        const matchingOwnedCompany =
          ownCompany?.id === organizationId ? ownCompany : null;
        const nextPublicCompany = matchingOwnedCompany
          ? toPublicCompanyProfile(matchingOwnedCompany)
          : await fetchPublicCompanyById(organizationId);

        if (!mounted) {
          return;
        }

        if (!nextPublicCompany) {
          setError({ kind: "not-found" });
          return;
        }

        setOwnedCompany(matchingOwnedCompany);
        setPublicCompany(nextPublicCompany);
      } catch {
        if (mounted) {
          setError({ kind: "load" });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      mounted = false;
    };
  }, [authLoading, organizationId, reloadAttempt, user?.id]);

  const isOwner = Boolean(ownedCompany);
  const isPublicPreview = isOwner && publicPreviewRequested;
  const completionLabels = {
    city: t("common.city"),
    description: t("organizations.description"),
    employee_count_range: t("organizations.employeeCount"),
    industry: t("organizations.industry"),
    name: t("organizations.name"),
    website: t("organizations.website"),
  };

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace((user ? "/organizations" : "/") as never);
  }

  function handleExitPreview() {
    router.replace(`/organizations/${organizationId}` as never);
  }

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
            gap: responsive.isMobile ? Spacing.three : Spacing.screen,
            maxWidth: Math.min(responsive.contentMaxWidth, 1120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.utilityRow}>
          <OrganizationActionButton
            accessibilityHint={
              isPublicPreview ? copy.exitPublicPreview : copy.back
            }
            fullWidth={responsive.isMobile}
            label={isPublicPreview ? copy.exitPublicPreview : copy.back}
            onPress={isPublicPreview ? handleExitPreview : handleBack}
            variant="ghost"
          />
        </View>

        {loading || authLoading ? (
          <View
            accessibilityLiveRegion="polite"
            accessible
            style={styles.stateCard}
          >
            <Text style={styles.stateText}>{copy.loadingProfile}</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View accessibilityRole="alert" style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              {error.kind === "invalid"
                ? copy.invalidOrganization
                : error.kind === "not-found"
                  ? copy.publicNotFound
                  : t("organizations.loadError")}
            </Text>
            {error.kind === "load" ? (
              <OrganizationActionButton
                fullWidth={responsive.isMobile}
                label={copy.retry}
                onPress={() => setReloadAttempt((current) => current + 1)}
                variant="secondary"
              />
            ) : null}
          </View>
        ) : null}

        {!loading && publicCompany ? (
          <>
            {isPublicPreview ? (
              <View accessibilityLiveRegion="polite" style={styles.previewBanner}>
                <Text style={styles.previewTitle}>{copy.publicPreview}</Text>
                <Text style={styles.previewText}>{copy.publicPreviewNote}</Text>
              </View>
            ) : null}

            <OrganizationHero
              city={publicCompany.city}
              industry={publicCompany.industry}
              name={publicCompany.name}
              verificationStatus={publicCompany.verification_status}
              verifiedLabel={t("verification.status.verified")}
              website={publicCompany.website}
            />

            <PublicOrganizationProfile
              company={publicCompany}
              copy={copy}
              labels={{
                companySize: t("organizations.employeeCount"),
                industry: t("organizations.industry"),
                location: t("common.city"),
                verification: t("organizations.verification"),
                verified: t("verification.status.verified"),
                website: t("organizations.website"),
              }}
            />

            {ownedCompany && !isPublicPreview ? (
              <OwnerOrganizationDashboard
                company={ownedCompany}
                completionLabels={completionLabels}
                copy={copy}
                formatStatus={(status) =>
                  formatCompanyStatus(status, language, t)
                }
                formatVerification={(status) =>
                  formatVerificationStatus(status, language, t)
                }
                isMobile={responsive.isMobile}
                onEdit={() => router.push("/organizations/create" as never)}
                onOpenApplications={() => router.push("/applications" as never)}
                onPublishJob={() => router.push("/create-job" as never)}
                onViewPublicProfile={() =>
                  router.replace(
                    `/organizations/${organizationId}?view=public` as never
                  )
                }
                statusLabel={t("common.status")}
                verificationLabel={t("organizations.verification")}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function formatCompanyStatus(
  status: CompanyStatus,
  language: LanguageCode,
  t: (key: string) => string
) {
  if (
    status === "active" ||
    status === "inactive" ||
    status === "suspended" ||
    status === "archived"
  ) {
    return t(`organizations.status.${status}`);
  }

  const fallback: Record<LanguageCode, Record<"draft" | "pending" | "verified", string>> = {
    de: { draft: "Entwurf", pending: "Ausstehend", verified: "Verifiziert" },
    en: { draft: "Draft", pending: "Pending", verified: "Verified" },
    ro: { draft: "Draft", pending: "În așteptare", verified: "Verificată" },
  };

  return fallback[language][status];
}

function formatVerificationStatus(
  status: CompanyVerificationStatus,
  language: LanguageCode,
  t: (key: string) => string
) {
  if (status === "verified") {
    return t("verification.status.verified");
  }

  if (status === "rejected") {
    return t("organizations.verification.rejected");
  }

  return {
    de: "Ausstehend",
    en: "Pending",
    ro: "În așteptare",
  }[language];
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  utilityRow: {
    alignItems: "flex-start",
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    minHeight: 160,
    justifyContent: "center",
    padding: Spacing.screen,
  },
  stateText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    textAlign: "center",
  },
  errorCard: {
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.screen,
  },
  errorTitle: {
    color: "#BE123C",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.default,
  },
  previewBanner: {
    backgroundColor: Colors.accentSoft,
    borderColor: "rgba(110, 29, 255, 0.24)",
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.three,
  },
  previewTitle: {
    color: Colors.accent,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  previewText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.xs,
  },
});
