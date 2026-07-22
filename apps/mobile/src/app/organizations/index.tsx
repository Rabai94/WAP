import RequireAuth from "@/components/RequireAuth";
import OrganizationAvatar from "@/components/organizations/OrganizationAvatar";
import OwnerOrganizationDashboard from "@/components/organizations/OwnerOrganizationDashboard";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import {
  calculateOrganizationCompletion,
  getCompanyStatusLabel,
  getCompanyVerificationLabel,
} from "@/components/organizations/organizationProfile";
import {
  EmptyState,
  ErrorState,
  IdentityHeader,
  ListingRow,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIBadge,
  RabAIButton,
  Section,
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
import { Spacing } from "@/theme";
import { type Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

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
  const completionLabels = {
    city: t("common.city"),
    description: t("organizations.description"),
    employee_count_range: t("organizations.employeeCount"),
    industry: t("organizations.industry"),
    name: t("organizations.name"),
    website: t("organizations.website"),
  };

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

      if (nextCompanies.length === 1) {
        router.replace(`/organizations/${nextCompanies[0].id}` as Href);
      }
    } catch {
      setCompanies([]);
      setJobs([]);
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
          <IdentityHeader
            avatar={
              <OrganizationAvatar
                decorative
                name={singleCompany.name}
                size={56}
              />
            }
            badges={
              <>
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
              </>
            }
            compact
            eyebrow={copy.ownedOrganization}
            subtitle={
              singleCompany.industry?.trim() ||
              singleCompany.city?.trim() ||
              undefined
            }
            title={singleCompany.name}
          />
          <OwnerOrganizationDashboard
            company={singleCompany}
            completionLabels={completionLabels}
            copy={copy}
            formatJobStatus={(status) => formatJobStatus(status, t)}
            formatStatus={(status) =>
              getCompanyStatusLabel(status, language)
            }
            formatVerification={(status) =>
              getCompanyVerificationLabel(status, language)
            }
            isMobile={responsive.isMobile}
            jobLabels={{
              activeJobs: t("organizations.activeJobs"),
              editJob: t("organizations.editJob"),
              jobsTitle: t("organizations.jobsTitle"),
              noJobs: t("organizations.noJobs"),
            }}
            jobs={jobs}
            onEdit={() => router.push("/organizations/create" as Href)}
            onEditJob={(jobId) =>
              router.push(`/create-job?jobId=${jobId}` as Href)
            }
            onOpenApplications={() => router.push("/applications" as Href)}
            onPublishJob={() => router.push("/create-job" as Href)}
            onViewPublicProfile={() =>
              router.push(
                `/organizations/${singleCompany.id}?view=public` as Href
              )
            }
            statusLabel={t("common.status")}
            verificationLabel={t("organizations.verification")}
          />
        </>
      ) : null}

      {!loading && !error && companies.length >= 2 ? (
        <Section>
          {companies.map((company) => {
            const completion = calculateOrganizationCompletion(company);

            return (
              <ListingRow
                accessibilityHint={copy.viewOrganization}
                actions={
                  <RabAIButton
                    onPress={() =>
                      router.push("/organizations/create" as Href)
                    }
                    size="sm"
                    title={
                      completion.percentage === 100
                        ? copy.editOrganization
                        : copy.completeProfile
                    }
                    variant="outline"
                  />
                }
                badges={
                  <>
                    <RabAIBadge
                      label={getCompanyStatusLabel(company.status, language)}
                      tone={companyStatusTone(company.status)}
                    />
                    <RabAIBadge
                      label={getCompanyVerificationLabel(
                        company.verification_status,
                        language
                      )}
                      tone={verificationStatusTone(
                        company.verification_status
                      )}
                    />
                  </>
                }
                description={
                  company.description?.trim() ||
                  t("organizations.noDescription")
                }
                eyebrow={copy.ownedOrganization}
                key={company.id}
                leading={
                  <OrganizationAvatar name={company.name} size={56} />
                }
                meta={[
                  {
                    label: t("organizations.activityArea"),
                    value: company.industry?.trim() || copy.notProvided,
                  },
                  {
                    label: t("common.city"),
                    value: company.city?.trim() || copy.notProvided,
                  },
                  {
                    label: copy.profileCompletion,
                    value: `${completion.percentage}%`,
                  },
                ]}
                onPress={() =>
                  router.push(`/organizations/${company.id}` as Href)
                }
                title={company.name}
              />
            );
          })}
        </Section>
      ) : null}
    </PageContainer>
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
});
