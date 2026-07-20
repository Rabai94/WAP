import type {
  CompanyProfile,
  CompanyStatus,
  CompanyVerificationStatus,
} from "@/services/company/companyService";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
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

type OwnerOrganizationDashboardProps = {
  company: CompanyProfile;
  completionLabels: CompletionLabels;
  copy: OrganizationCopy;
  formatStatus: (status: CompanyStatus) => string;
  formatVerification: (status: CompanyVerificationStatus) => string;
  isMobile: boolean;
  onEdit: () => void;
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
  formatStatus,
  formatVerification,
  isMobile,
  onEdit,
  onOpenApplications,
  onPublishJob,
  onViewPublicProfile,
  statusLabel,
  verificationLabel,
}: OwnerOrganizationDashboardProps) {
  const completion = calculateOrganizationCompletion(company);
  const canPublishJobs =
    company.status === "active" &&
    company.verification_status === "verified";

  return (
    <View
      accessibilityLabel={copy.ownerDashboard}
      style={styles.section}
    >
      <View>
        <Text style={styles.eyebrow}>
          {copy.ownedOrganization}
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          {copy.ownerDashboard}
        </Text>
        <Text style={styles.subtitle}>{copy.ownerDashboardSubtitle}</Text>
      </View>

      <View style={styles.internalCard}>
        <Text style={styles.internalLabel}>{copy.internalStatus}</Text>
        <View style={styles.statusGrid}>
          <StatusItem
            label={statusLabel}
            value={formatStatus(company.status)}
          />
          <StatusItem
            label={verificationLabel}
            tone={
              company.verification_status === "verified"
                ? "success"
                : company.verification_status === "rejected"
                  ? "danger"
                  : "warning"
            }
            value={formatVerification(company.verification_status)}
          />
        </View>
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

      <View style={styles.actionCard}>
        <View style={styles.actionGrid}>
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
        <Text style={styles.routeNote}>{copy.verificationUnavailable}</Text>
      </View>
    </View>
  );
}

function StatusItem({
  label,
  tone = "neutral",
  value,
}: {
  label: string;
  tone?: "danger" | "neutral" | "success" | "warning";
  value: string;
}) {
  return (
    <View
      style={[
        styles.statusItem,
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

const styles = StyleSheet.create({
  section: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    gap: Spacing.three,
    paddingTop: Spacing.screen,
  },
  eyebrow: {
    color: Colors.accent,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 30,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.sm,
  },
  internalCard: {
    backgroundColor: "#17213F",
    borderRadius: Radius.xxl,
    padding: Spacing.three,
    ...Shadows.card,
  },
  internalLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statusItem: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: Radius.card,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.three,
  },
  statusItemSuccess: {
    backgroundColor: "rgba(7, 134, 92, 0.24)",
    borderColor: "rgba(167, 243, 208, 0.34)",
  },
  statusItemWarning: {
    backgroundColor: "rgba(217, 119, 6, 0.22)",
    borderColor: "rgba(253, 186, 116, 0.42)",
  },
  statusItemDanger: {
    backgroundColor: "rgba(225, 29, 72, 0.22)",
    borderColor: "rgba(253, 164, 175, 0.40)",
  },
  statusLabel: {
    color: "rgba(255, 255, 255, 0.68)",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  statusValue: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.xs,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.three,
    ...Shadows.card,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionHint: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },
  routeNote: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: Typography.lineHeight.compact,
  },
});
