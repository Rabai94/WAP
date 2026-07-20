import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import CourseDetailSection, {
  CourseDetailGrid,
  CourseDetailItem,
} from "./CourseDetailSection";

export type CourseProviderPublicSummaryProps = {
  providerDescription?: string | null;
  providerEmail?: string | null;
  providerName: string;
  providerPhone?: string | null;
  providerWebsite?: string | null;
};

export default function CourseProviderPublicSummary({
  providerDescription,
  providerEmail,
  providerName,
  providerPhone,
  providerWebsite,
}: CourseProviderPublicSummaryProps) {
  const visibleProviderName = providerName.trim();
  const visibleDescription = readText(providerDescription);
  const contactItems = [
    { label: "Website", value: readText(providerWebsite) },
    { label: "Email", value: readText(providerEmail) },
    { label: "Telefon", value: readText(providerPhone) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <CourseDetailSection title="Despre furnizor">
      <View style={styles.providerRow}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.initialsBadge}
        >
          <Text style={styles.initialsText}>
            {getProviderInitials(visibleProviderName)}
          </Text>
        </View>
        <Text selectable style={styles.providerName}>
          {visibleProviderName}
        </Text>
      </View>

      {visibleDescription ? (
        <Text selectable style={styles.description}>
          {visibleDescription}
        </Text>
      ) : null}

      {contactItems.length > 0 ? (
        <CourseDetailGrid>
          {contactItems.map((item) => (
            <CourseDetailItem
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </CourseDetailGrid>
      ) : null}
    </CourseDetailSection>
  );
}

export function getProviderInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");
}

function readText(value?: string | null) {
  const trimmedValue = value?.trim();
  return trimmedValue || null;
}

const styles = StyleSheet.create({
  providerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
    maxWidth: "100%",
    minWidth: 0,
  },
  initialsBadge: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexShrink: 0,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  initialsText: {
    color: Colors.brandDeep,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  providerName: {
    color: Colors.text,
    flex: 1,
    flexShrink: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: 22,
    minWidth: 0,
  },
  description: {
    color: Colors.textBody,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 22,
  },
});
