import { DefinitionList, Section } from "@/components/ui";
import type { PublicCompanyProfile } from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
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
    <Section
      action={
        <Text accessibilityElementsHidden style={styles.percentage}>
          {completion.percentage}%
        </Text>
      }
      contentStyle={styles.content}
      description={summary(
        completion.completedCount,
        completion.totalCount
      )}
      title={title}
    >
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
          <DefinitionList
            columns={2}
            items={organizationCompletionFieldKeys.map((field) => {
              const complete = completion.fields[field];
              const statusLabel = complete
                ? statusLabels.complete
                : statusLabels.incomplete;

              return {
                accessibilityLabel: `${labels[field]}: ${statusLabel}`,
                label: labels[field],
                value: (
                  <Text
                    style={[
                      styles.status,
                      complete ? styles.statusComplete : styles.statusIncomplete,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                ),
              };
            })}
          />
        </View>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.component,
  },
  percentage: {
    color: Colors.goldPressed,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.heading,
  },
  progressTrack: {
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    height: 8,
    overflow: "hidden",
    width: "100%",
  },
  progressValue: {
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    height: "100%",
  },
  checklist: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    gap: Spacing.control,
    paddingTop: Spacing.component,
  },
  checklistTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.supporting,
  },
  status: {
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.supporting,
  },
  statusComplete: {
    color: Colors.success,
  },
  statusIncomplete: {
    color: Colors.textMuted,
  },
});
