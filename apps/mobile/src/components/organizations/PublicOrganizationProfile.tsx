import { ExternalLink } from "@/components/external-link";
import { DefinitionList, Section } from "@/components/ui";
import type { PublicCompanyProfile } from "@/services/company/companyService";
import { Colors, Spacing, Typography } from "@/theme";
import type { Href } from "expo-router";
import { StyleSheet, Text } from "react-native";
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

  return (
    <Section
      contentStyle={styles.content}
      description={`${copy.publicProfileSubtitle} ${copy.publicDataNote}`}
      title={copy.aboutCompany}
    >
      <Text selectable style={styles.description}>
        {company.description?.trim() || copy.notProvided}
      </Text>

      <DefinitionList
        columns={2}
        items={[
          {
            label: labels.industry,
            value: company.industry?.trim() || copy.notProvided,
          },
          {
            label: labels.location,
            value: company.city?.trim() || copy.notProvided,
          },
          {
            label: labels.companySize,
            value: company.employee_count_range?.trim() || copy.notProvided,
          },
          {
            label: labels.verification,
            value:
              company.verification_status === "verified"
                ? labels.verified
                : copy.notProvided,
          },
          {
            label: labels.website,
            value: website ? (
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
              copy.notProvided
            ),
          },
        ]}
      />
    </Section>
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
  content: {
    gap: Spacing.component,
  },
  description: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  websiteLink: {
    alignSelf: "flex-start",
    color: Colors.link,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    minHeight: 44,
    paddingVertical: Spacing.control,
    textDecorationLine: "underline",
  },
});
