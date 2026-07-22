import {
  DefinitionList,
  EmptyState,
  ListingRow,
  RabAIButton,
  Section,
  StatusBadge,
} from "@/components/ui";
import type {
  CompanyDashboardJob,
  CompanyProfile,
  CompanyStatus,
  CompanyVerificationStatus,
} from "@/services/company/companyService";
import { Colors, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import OrganizationActionButton from "./OrganizationActionButton";
import OrganizationProfileCompletion from "./OrganizationProfileCompletion";
import type { OrganizationCopy } from "./organizationCopy";
import { calculateOrganizationCompletion } from "./organizationProfile";

type CompletionLabels = {
  city: string;
  description: string;
  employee_count_range: string;
  industry: string;
  name: string;
  website: string;
};

type JobLabels = {
  activeJobs: string;
  editJob: string;
  jobsTitle: string;
  noJobs: string;
};

type OwnerOrganizationDashboardProps = {
  company: CompanyProfile;
  completionLabels: CompletionLabels;
  copy: OrganizationCopy;
  formatJobStatus: (status: string) => string;
  formatStatus: (status: CompanyStatus) => string;
  formatVerification: (status: CompanyVerificationStatus) => string;
  isMobile: boolean;
  jobLabels: JobLabels;
  jobs: readonly CompanyDashboardJob[];
  onEdit: () => void;
  onEditJob: (jobId: string) => void;
  onOpenApplications: () => void;
  onPublishJob: () => void;
  onViewPublicProfile: () => void;
  statusLabel: string;
  verificationLabel: string;
};

export default function OwnerOrganizationDashboard({
  company,
  completionLabels,
  copy,
  formatJobStatus,
  formatStatus,
  formatVerification,
  isMobile,
  jobLabels,
  jobs,
  onEdit,
  onEditJob,
  onOpenApplications,
  onPublishJob,
  onViewPublicProfile,
  statusLabel,
  verificationLabel,
}: OwnerOrganizationDashboardProps) {
  const completion = calculateOrganizationCompletion(company);
  const activeJobCount = jobs.filter((job) => job.status === "published").length;
  const canPublishJobs =
    company.status === "active" &&
    company.verification_status === "verified";

  return (
    <View accessibilityLabel={copy.ownerDashboard} style={styles.dashboard}>
      <Section
        contentStyle={styles.statusContent}
        description={copy.ownerDashboardSubtitle}
        title={copy.ownerDashboard}
      >
        <Text style={styles.privateLabel}>{copy.internalStatus}</Text>
        <DefinitionList
          columns={2}
          items={[
            {
              label: statusLabel,
              value: (
                <StatusBadge
                  label={formatStatus(company.status)}
                  status={company.status}
                />
              ),
            },
            {
              label: verificationLabel,
              value: (
                <StatusBadge
                  label={formatVerification(company.verification_status)}
                  status={company.verification_status}
                />
              ),
            },
            {
              label: jobLabels.activeJobs,
              value: String(activeJobCount),
            },
          ]}
        />
      </Section>

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

      <Section title={jobLabels.jobsTitle}>
        {jobs.length > 0 ? (
          <View style={styles.jobList}>
            {jobs.map((job) => (
              <ListingRow
                actions={
                  <RabAIButton
                    accessibilityLabel={`${jobLabels.editJob}: ${job.title}`}
                    onPress={() => onEditJob(job.id)}
                    size="sm"
                    title={jobLabels.editJob}
                    variant="outline"
                  />
                }
                badges={
                  <StatusBadge
                    label={formatJobStatus(job.status)}
                    status={job.status}
                  />
                }
                key={job.id}
                subtitle={formatJobLocation(job)}
                title={job.title}
              />
            ))}
          </View>
        ) : (
          <EmptyState compact title={jobLabels.noJobs} />
        )}
      </Section>

      <Section contentStyle={styles.actionContent}>
        <View
          style={[styles.actionGrid, isMobile && styles.actionGridMobile]}
        >
          <OrganizationActionButton
            accessibilityHint={copy.formSubtitle}
            fullWidth={isMobile}
            label={
              completion.percentage === 100
                ? copy.editOrganization
                : copy.completeProfile
            }
            onPress={onEdit}
            variant="primary"
          />
          <OrganizationActionButton
            accessibilityHint={copy.publicDataNote}
            fullWidth={isMobile}
            label={copy.viewPublicProfile}
            onPress={onViewPublicProfile}
            variant="secondary"
          />
          <OrganizationActionButton
            accessibilityHint={
              canPublishJobs ? copy.publishJob : copy.publicationUnavailable
            }
            disabled={!canPublishJobs}
            fullWidth={isMobile}
            label={copy.publishJob}
            onPress={onPublishJob}
            variant="secondary"
          />
          <OrganizationActionButton
            fullWidth={isMobile}
            label={copy.viewApplications}
            onPress={onOpenApplications}
            variant="secondary"
          />
        </View>

        {!canPublishJobs ? (
          <Text accessibilityLiveRegion="polite" style={styles.actionHint}>
            {copy.publicationUnavailable}
          </Text>
        ) : null}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    alignSelf: "stretch",
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    minWidth: 0,
    paddingTop: Spacing.section,
  },
  statusContent: {
    gap: Spacing.control,
  },
  privateLabel: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.eyebrow,
    lineHeight: Typography.lineHeight.compact,
    textTransform: "uppercase",
  },
  actionContent: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    gap: Spacing.inline,
    paddingTop: Spacing.component,
  },
  jobList: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    minWidth: 0,
  },
  actionGrid: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  actionGridMobile: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  actionHint: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
});

function formatJobLocation(job: CompanyDashboardJob) {
  if (!job.location) {
    return undefined;
  }

  return [
    job.location.postal_code,
    job.location.city,
    job.location.district,
    job.location.state,
  ]
    .filter(Boolean)
    .join(" / ");
}
