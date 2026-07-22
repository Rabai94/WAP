import OrganizationHero from "@/components/organizations/OrganizationHero";
import OwnerOrganizationDashboard from "@/components/organizations/OwnerOrganizationDashboard";
import PublicOrganizationProfile from "@/components/organizations/PublicOrganizationProfile";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import PublicHeader from "@/components/navigation/PublicHeader";
import {
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompanies,
  fetchOwnCompanyJobs,
  fetchPublicCompanyById,
  toPublicCompanyProfile,
  type CompanyDashboardJob,
  type CompanyProfile,
  type CompanyStatus,
  type CompanyVerificationStatus,
  type PublicCompanyProfile,
} from "@/services/company/companyService";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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
  const [jobs, setJobs] = useState<CompanyDashboardJob[]>([]);
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
      setJobs([]);

      if (!isUuid(organizationId)) {
        setError({ kind: "invalid" });
        setLoading(false);
        return;
      }

      try {
        const ownCompanies = user?.id
          ? await fetchOwnCompanies(user.id)
          : [];
        const matchingOwnedCompany =
          ownCompanies.find((company) => company.id === organizationId) ?? null;
        let nextPublicCompany: PublicCompanyProfile | null;
        let nextJobs: CompanyDashboardJob[] = [];

        if (matchingOwnedCompany) {
          nextPublicCompany = toPublicCompanyProfile(matchingOwnedCompany);
          nextJobs = await fetchOwnCompanyJobs(matchingOwnedCompany.id);
        } else {
          nextPublicCompany = await fetchPublicCompanyById(organizationId);
        }

        if (!mounted) {
          return;
        }

        if (!nextPublicCompany) {
          setError({ kind: "not-found" });
          return;
        }

        setOwnedCompany(matchingOwnedCompany);
        setPublicCompany(nextPublicCompany);
        setJobs(nextJobs);
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
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
        {!user && !authLoading ? <PublicHeader /> : null}
        <PageHeader
          backLabel={isPublicPreview ? copy.exitPublicPreview : copy.back}
          description={
            isPublicPreview ? copy.publicPreviewNote : copy.publicProfileSubtitle
          }
          onBack={isPublicPreview ? handleExitPreview : handleBack}
          title={isPublicPreview ? copy.publicPreview : copy.publicProfile}
        />

        {loading || authLoading ? (
          <LoadingState title={copy.loadingProfile} />
        ) : null}

        {!loading && error ? (
          <ErrorState
            description={
              error.kind === "invalid"
                ? copy.invalidOrganization
                : error.kind === "not-found"
                  ? copy.publicNotFound
                  : t("organizations.loadError")
            }
            onRetry={
              error.kind === "load"
                ? () => setReloadAttempt((current) => current + 1)
                : undefined
            }
            retryLabel={copy.retry}
            title={t("organizations.loadError")}
          />
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
                formatJobStatus={(status) =>
                  t(`organizations.jobStatus.${status}`)
                }
                formatStatus={(status) =>
                  formatCompanyStatus(status, language, t)
                }
                formatVerification={(status) =>
                  formatVerificationStatus(status, language, t)
                }
                isMobile={responsive.isMobile}
                jobLabels={{
                  activeJobs: t("organizations.activeJobs"),
                  editJob: t("organizations.editJob"),
                  jobsTitle: t("organizations.jobsTitle"),
                  noJobs: t("organizations.noJobs"),
                }}
                jobs={jobs}
                onEdit={() => router.push("/organizations/create" as never)}
                onEditJob={(jobId) =>
                  router.push(`/create-job?jobId=${jobId}` as never)
                }
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
    </PageContainer>
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
    gap: Spacing.section,
  },
  previewBanner: {
    backgroundColor: Colors.goldMuted,
    borderLeftColor: Colors.goldPrimary,
    borderLeftWidth: 3,
    padding: Spacing.component,
  },
  previewTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.semibold,
  },
  previewText: {
    color: Colors.textSecondary,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.compact,
  },
});
