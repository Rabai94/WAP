import type { PublicCompanyProfile } from "@/services/company/companyService";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import {
  calculateOrganizationCompletion,
  organizationCompletionFieldKeys,
  type OrganizationCompletionField,
} from "./organizationProfile";

type OrganizationProfileCompletionProps = {
  checklistTitle: string;
  company: PublicCompanyProfile;
  labels: Record<OrganizationCompletionField, string>;
  showChecklist?: boolean;
  statusLabels?: {
    complete: string;
    incomplete: string;
  };
  summary: (completed: number, total: number) => string;
  title: string;
};

export default function OrganizationProfileCompletion({
  checklistTitle,
  company,
  labels,
  showChecklist = false,
  statusLabels = { complete: "Complete", incomplete: "Incomplete" },
  summary,
  title,
}: OrganizationProfileCompletionProps) {
  const completion = calculateOrganizationCompletion(company);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.summary}>
            {summary(completion.completedCount, completion.totalCount)}
          </Text>
        </View>
        <Text
          aria-hidden
          style={styles.percentage}
        >
          {completion.percentage}%
        </Text>
      </View>

      <View
        accessibilityLabel={`${title}: ${completion.percentage}%`}
        accessibilityRole="progressbar"
        accessibilityValue={{
          max: 100,
          min: 0,
          now: completion.percentage,
        }}
        style={styles.progressTrack}
      >
        <View
          style={[
            styles.progressValue,
            { width: `${completion.percentage}%` },
          ]}
        />
      </View>

      {showChecklist ? (
        <View style={styles.checklist}>
          <Text accessibilityRole="header" style={styles.checklistTitle}>
            {checklistTitle}
          </Text>
          <View style={styles.checklistGrid}>
            {organizationCompletionFieldKeys.map((field) => {
              const complete = completion.fields[field];
              const statusLabel = complete
                ? statusLabels.complete
                : statusLabels.incomplete;

              return (
                <View
                  accessibilityLabel={`${labels[field]}: ${statusLabel}`}
                  accessible
                  key={field}
                  style={styles.checklistItem}
                >
                  <View
                    style={[
                      styles.checkmark,
                      complete
                        ? styles.checkmarkComplete
                        : styles.checkmarkIncomplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkmarkText,
                        !complete && styles.checkmarkTextIncomplete,
                      ]}
                    >
                      {complete ? "✓" : "—"}
                    </Text>
                  </View>
                  <Text style={styles.fieldLabel}>{labels[field]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.three,
    ...Shadows.card,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  summary: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: Typography.lineHeight.compact,
    marginTop: Spacing.xs,
  },
  percentage: {
    color: Colors.brandDeep,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.black,
  },
  progressTrack: {
    backgroundColor: Colors.borderMuted,
    borderRadius: Radius.round,
    height: 10,
    overflow: "hidden",
    width: "100%",
  },
  progressValue: {
    backgroundColor: Colors.brand,
    borderRadius: Radius.round,
    height: "100%",
  },
  checklist: {
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.three,
  },
  checklistTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  checklistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  checklistItem: {
    alignItems: "center",
    flexBasis: 180,
    flexDirection: "row",
    flexGrow: 1,
    gap: Spacing.md,
    minWidth: 0,
  },
  checkmark: {
    alignItems: "center",
    borderRadius: Radius.round,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  checkmarkComplete: {
    backgroundColor: "#E8F8F2",
    borderColor: "#BEEBD7",
    borderWidth: 1,
  },
  checkmarkIncomplete: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  checkmarkText: {
    color: "#056B4B",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  checkmarkTextIncomplete: {
    color: Colors.textMuted,
  },
  fieldLabel: {
    color: Colors.textBody,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.compact,
  },
});
