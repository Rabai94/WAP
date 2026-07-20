import CredentialSkillList from "@/components/credentials/CredentialSkillList";
import CredentialStatusBadge from "@/components/credentials/CredentialStatusBadge";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  verifyCredentialByToken,
  type PublicCredentialVerification,
} from "@/services/credentials/credentialService";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function PublicCredentialVerificationScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const [credential, setCredential] = useState<PublicCredentialVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const verify = useCallback(async () => {
    setLoading(true);
    setInvalid(false);

    if (!token || !/^[0-9a-f]{64}$/.test(token)) {
      setCredential(null);
      setInvalid(true);
      setLoading(false);
      return;
    }

    try {
      const result = await verifyCredentialByToken(token);
      setCredential(result);
      setInvalid(!result);
    } catch {
      setCredential(null);
      setInvalid(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void verify();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [verify]);

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
          { maxWidth: Math.min(responsive.contentMaxWidth, 820) },
        ]}
      >
        <Header
          subtitle={t("credentials.verify.subtitle")}
          title={t("credentials.verify.title")}
        />
        <Button
          onPress={() => router.push("/" as never)}
          style={styles.homeButton}
          title={t("credentials.verify.backHome")}
          variant="secondary"
        />

        {loading ? (
          <Card><Text style={styles.muted}>{t("credentials.verify.checking")}</Text></Card>
        ) : null}

        {!loading && invalid ? (
          <Card>
            <Text accessibilityRole="alert" style={styles.invalidTitle}>
              {t("credentials.verify.invalidTitle")}
            </Text>
            <Text style={styles.muted}>{t("credentials.verify.invalidMessage")}</Text>
          </Card>
        ) : null}

        {credential ? (
          <Card>
            <View style={styles.statusRow}>
              <Text accessibilityRole="header" style={styles.resultTitle}>
                {t(`credentials.verify.result.${credential.status}`)}
              </Text>
              <CredentialStatusBadge
                label={t(`credentials.status.${credential.status}`)}
                status={credential.status}
              />
            </View>

            <View style={styles.detailsGrid}>
              <Detail label={t("credentials.verify.number")} value={credential.credential_number} />
              <Detail label={t("credentials.verify.participant")} value={credential.participant_display_name} />
              <Detail label={t("credentials.verify.course")} value={credential.course_title} />
              <Detail label={t("credentials.verify.issuer")} value={credential.issuer_name} />
              <Detail label={t("credentials.wallet.issuedAt")} value={formatDate(credential.issued_at)} />
              <Detail
                label={t("credentials.wallet.expiresAt")}
                value={credential.expires_at
                  ? formatDate(credential.expires_at)
                  : t("credentials.wallet.noExpiry")}
              />
            </View>

            {credential.revoked_at ? (
              <View style={styles.revokedPanel}>
                <Text style={styles.revokedText}>
                  {`${t("credentials.verify.revokedAt")}: ${formatDateTime(credential.revoked_at)}`}
                </Text>
              </View>
            ) : null}

            <Text style={styles.skillsTitle}>{t("credentials.wallet.skills")}</Text>
            <CredentialSkillList
              emptyLabel={t("credentials.wallet.noSkills")}
              language={language}
              skills={credential.skills}
            />

            <Text style={styles.privacyNote}>{t("credentials.verify.privacyNote")}</Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  homeButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  statusRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  resultTitle: {
    color: Colors.text,
    flex: 1,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    minWidth: 210,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  detail: {
    backgroundColor: Colors.surfaceMuted,
    flexBasis: 210,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  detailValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  revokedPanel: {
    backgroundColor: "#FFF1F3",
    borderColor: "#FDA4AF",
    borderWidth: 1,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  revokedText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  skillsTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  privacyNote: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: Typography.lineHeight.compact,
    marginTop: Spacing.lg,
  },
  invalidTitle: {
    color: Colors.text,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  muted: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
});
