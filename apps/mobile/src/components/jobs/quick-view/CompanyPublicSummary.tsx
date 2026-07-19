import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";
import JobDetailSection from "./JobDetailSection";

type CompanyPublicSummaryProps = {
  companyName: string;
  verified: boolean;
};

export default function CompanyPublicSummary({
  companyName,
  verified,
}: CompanyPublicSummaryProps) {
  return (
    <JobDetailSection title="Despre companie">
      <View style={styles.companyRow}>
        <View style={styles.logoFallback}>
          <Text style={styles.logoText}>{getInitials(companyName)}</Text>
        </View>
        <View style={styles.companyCopy}>
          <Text selectable style={styles.companyName}>
            {companyName}
          </Text>
          {verified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedMark}>✓</Text>
              <Text style={styles.verifiedText}>Companie verificată</Text>
            </View>
          ) : null}
        </View>
      </View>
    </JobDetailSection>
  );
}

export function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "C";
}

const styles = StyleSheet.create({
  companyRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
  },
  logoFallback: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  logoText: {
    color: Colors.brandDeep,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  companyCopy: {
    alignItems: "flex-start",
    flex: 1,
    gap: Spacing.sm,
    minWidth: 0,
  },
  companyName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#BBF7D0",
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  verifiedMark: {
    color: Colors.success,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
});
