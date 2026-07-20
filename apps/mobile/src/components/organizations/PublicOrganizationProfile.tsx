import { ExternalLink } from "@/components/external-link";
import type { PublicCompanyProfile } from "@/services/company/companyService";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import type { Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import type { OrganizationCopy } from "./organizationCopy";

type PublicOrganizationLabels = {
  companySize: string;
  industry: string;
  location: string;
  verification: string;
  verified: string;
  website: string;
};

type PublicOrganizationProfileProps = {
  company: PublicCompanyProfile;
  copy: OrganizationCopy;
  labels: PublicOrganizationLabels;
};

export default function PublicOrganizationProfile({
  company,
  copy,
  labels,
}: PublicOrganizationProfileProps) {
  const website = readSafeWebsite(company.website);
  const facts = [
    { label: labels.industry, value: company.industry },
    { label: labels.location, value: company.city },
    { label: labels.companySize, value: company.employee_count_range },
    {
      label: labels.verification,
      value:
        company.verification_status === "verified"
          ? labels.verified
          : copy.notProvided,
    },
  ];

  return (
    <View
      accessibilityLabel={copy.publicProfile}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>
            {copy.publicProfile}
          </Text>
          <Text accessibilityRole="header" style={styles.title}>
            {copy.aboutCompany}
          </Text>
          <Text style={styles.subtitle}>{copy.publicProfileSubtitle}</Text>
        </View>
        <View accessible style={styles.publicNote}>
          <Text style={styles.publicNoteText}>{copy.publicDataNote}</Text>
        </View>
      </View>

      <View style={styles.aboutCard}>
        <Text selectable style={styles.description}>
          {company.description?.trim() || copy.notProvided}
        </Text>
      </View>

      <View style={styles.factGrid}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.factCard}>
            <Text style={styles.factLabel}>{fact.label}</Text>
            <Text selectable style={styles.factValue}>
              {fact.value?.trim() || copy.notProvided}
            </Text>
          </View>
        ))}

        <View style={styles.factCard}>
          <Text style={styles.factLabel}>{labels.website}</Text>
          {website ? (
            <ExternalLink
              accessibilityHint={copy.openWebsite}
              accessibilityLabel={`${copy.openWebsite}: ${company.name}`}
              accessibilityRole="link"
              href={website as Href & string}
              style={styles.websiteLink}
            >
              {formatWebsiteLabel(website)}
            </ExternalLink>
          ) : (
            <Text style={styles.factValue}>{copy.notProvided}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function readSafeWebsite(value: string | null) {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function formatWebsiteLabel(value: string) {
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./i, "");
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
  },
  headingCopy: {
    flex: 1,
    minWidth: 220,
  },
  eyebrow: {
    color: Colors.brand,
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
  publicNote: {
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    maxWidth: 340,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  publicNoteText: {
    color: Colors.brandDeep,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.compact,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.screen,
    ...Shadows.card,
  },
  description: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 26,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  factCard: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.three,
  },
  factLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  factValue: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.compact,
  },
  websiteLink: {
    alignSelf: "flex-start",
    color: Colors.link,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.compact,
    minHeight: 44,
    paddingVertical: Spacing.xl,
    textDecorationLine: "underline",
  },
});
