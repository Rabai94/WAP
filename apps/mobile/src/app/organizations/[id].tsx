import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function OrganizationDetailsScreen() {
  return (
    <RequireAuth>
      <OrganizationDetailsContent />
    </RequireAuth>
  );
}

function OrganizationDetailsContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const { user } = useAuth();
  const organizationId = readParam(params.id);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrganization() {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const ownCompany = await fetchOwnCompany(user.id);

        if (!mounted) {
          return;
        }

        if (!ownCompany || ownCompany.id !== organizationId) {
          setCompany(null);
          setError(t("organizations.detailNotFound"));
          return;
        }

        setCompany(ownCompany);
      } catch (nextError) {
        if (mounted) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : t("organizations.loadError")
          );
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
  }, [organizationId, t, user?.id]);

  return (
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: responsive.isMobile ? Spacing.sm : Spacing.md,
            maxWidth: responsive.contentMaxWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AuthenticatedHeader active="profile" />

        <Header
          title={company?.name ?? t("organizations.detailTitle")}
          subtitle={t("organizations.detailSubtitle")}
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>{t("organizations.loading")}</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {company ? (
          <Card title={company.name}>
            <View style={styles.infoGrid}>
              <InfoItem
                label={t("organizations.type")}
                value={t("organizations.type.company")}
              />
              <InfoItem label={t("common.status")} value={company.status} />
              <InfoItem
                label={t("organizations.verification")}
                value={company.verification_status}
              />
              <InfoItem
                label={t("organizations.activityArea")}
                value={company.industry ?? t("common.missing")}
              />
              <InfoItem
                label={t("common.city")}
                value={company.city ?? t("common.missing")}
              />
              <InfoItem
                label={t("organizations.website")}
                value={company.website ?? t("common.missing")}
              />
            </View>
            <Text style={styles.bodyText}>
              {company.description || t("organizations.noDescription")}
            </Text>
          </Card>
        ) : null}

        <Button
          title={t("organizations.backToOrganizations")}
          variant="secondary"
          onPress={() => router.replace("/organizations" as any)}
        />
      </ScrollView>
    </Screen>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoItem: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
