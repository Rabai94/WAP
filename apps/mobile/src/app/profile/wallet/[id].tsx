import CredentialSkillList from "@/components/credentials/CredentialSkillList";
import CredentialStatusBadge from "@/components/credentials/CredentialStatusBadge";
import CredentialWalletActions from "@/components/credentials/CredentialWalletActions";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  getOwnCredentialDetails,
  listCredentialAudit,
  type CredentialAuditEvent,
  type CredentialDetails,
} from "@/services/credentials/credentialService";
import { Colors, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function CredentialWalletDetailsScreen() {
  return (
    <RequireAuth>
      <CredentialWalletDetailsContent />
    </RequireAuth>
  );
}

function CredentialWalletDetailsContent() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const credentialId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const [credential, setCredential] = useState<CredentialDetails | null>(null);
  const [audit, setAudit] = useState<CredentialAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCredential = useCallback(async () => {
    if (!credentialId) {
      setError(t("credentials.details.invalid"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const nextCredential = await getOwnCredentialDetails(credentialId);
      setCredential(nextCredential);
      setAudit(nextCredential ? await listCredentialAudit(credentialId) : []);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.details.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [credentialId, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCredential();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCredential]);

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
          { maxWidth: Math.min(responsive.contentMaxWidth, 980) },
        ]}
      >
        <Header
          subtitle={t("credentials.details.subtitle")}
          title={t("credentials.details.title")}
        />
        <View style={styles.toolbar}>
          <Button
            onPress={() => router.push("/profile/wallet" as never)}
            title={t("credentials.details.back")}
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={() => void loadCredential()}
            title={t("common.refresh")}
            variant="ghost"
          />
        </View>

        {loading ? <Card><Text style={styles.muted}>{t("common.loading")}</Text></Card> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {!loading && !error && !credential ? (
          <Card><Text style={styles.muted}>{t("credentials.details.notFound")}</Text></Card>
        ) : null}

        {credential ? (
          <>
            <Card>
              <View style={styles.headerRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.credentialTitle}>{credential.title}</Text>
                  <Text style={styles.number}>{credential.credential_number}</Text>
                </View>
                <View style={styles.badges}>
                  <CredentialStatusBadge
                    label={t(`credentials.status.${credential.status}`)}
                    status={credential.status}
                  />
                  <CredentialStatusBadge
                    label={t(`credentials.document.${credential.document_status}`)}
                    status={credential.document_status}
                  />
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <Detail label={t("credentials.details.participant")} value={credential.participant_display_name} />
                <Detail label={t("credentials.details.course")} value={credential.course_title} />
                <Detail label={t("credentials.wallet.issuer")} value={credential.issuer_name} />
                <Detail label={t("credentials.wallet.issuedAt")} value={formatDate(credential.issued_at)} />
                <Detail
                  label={t("credentials.wallet.expiresAt")}
                  value={credential.expires_at
                    ? formatDate(credential.expires_at)
                    : t("credentials.wallet.noExpiry")}
                />
                <Detail label={t("credentials.details.version")} value={String(credential.version)} />
                <Detail
                  label={t("credentials.details.courseDates")}
                  value={formatCourseDates(credential.course_start_date, credential.course_end_date, t)}
                />
                <Detail
                  label={t("credentials.details.duration")}
                  value={credential.duration_value && credential.duration_unit
                    ? `${credential.duration_value} ${credential.duration_unit}`
                    : t("credentials.details.notSpecified")}
                />
              </View>

              <Text style={styles.sectionTitle}>{t("credentials.wallet.skills")}</Text>
              <CredentialSkillList
                emptyLabel={t("credentials.wallet.noSkills")}
                language={language}
                skills={credential.skills}
              />

              {credential.revoked_at ? (
                <View style={styles.revocationPanel}>
                  <Text style={styles.revocationTitle}>{t("credentials.details.revocation")}</Text>
                  <Text style={styles.revocationText}>{formatDateTime(credential.revoked_at)}</Text>
                  {credential.revoked_reason ? (
                    <Text style={styles.revocationText}>{credential.revoked_reason}</Text>
                  ) : null}
                </View>
              ) : null}

              {credential.pdf_sha256 ? (
                <View style={styles.hashPanel}>
                  <Text style={styles.hashLabel}>{t("credentials.details.hash")}</Text>
                  <Text selectable style={styles.hashValue}>
                    {formatHash(credential.pdf_sha256)}
                  </Text>
                </View>
              ) : null}

              <CredentialWalletActions
                credentialId={credential.credential_id}
                documentStatus={credential.document_status}
                isPublic={credential.is_public}
                onChanged={loadCredential}
                title={credential.title}
                verificationToken={credential.verification_token}
              />
            </Card>

            <Card title={t("credentials.details.audit") }>
              {audit.length === 0 ? (
                <Text style={styles.muted}>{t("credentials.participants.auditEmpty")}</Text>
              ) : audit.map((event) => (
                <View key={event.event_id} style={styles.auditEvent}>
                  <Text style={styles.auditTitle}>{t(`credentials.audit.${event.event_type}`)}</Text>
                  <Text style={styles.auditMeta}>
                    {`${formatDateTime(event.created_at)} · ${t(`credentials.actor.${event.actor_role}`)}`}
                  </Text>
                </View>
              ))}
            </Card>
          </>
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

function formatHash(value: string) {
  return value.match(/.{1,8}/g)?.join(" ") ?? value;
}

function formatCourseDates(
  startDate: string | null,
  endDate: string | null,
  t: (key: string) => string,
) {
  if (startDate && endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  if (startDate) {
    return formatDate(startDate);
  }
  if (endDate) {
    return formatDate(endDate);
  }
  return t("credentials.details.notSpecified");
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  titleBlock: {
    flex: 1,
    minWidth: 190,
  },
  credentialTitle: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  number: {
    color: Colors.brandDeep,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  badges: {
    alignItems: "flex-end",
    gap: Spacing.sm,
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
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  revocationPanel: {
    backgroundColor: "#FFF1F3",
    borderColor: "#FDA4AF",
    borderWidth: 1,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  revocationTitle: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  revocationText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.sm,
  },
  hashPanel: {
    marginTop: Spacing.lg,
  },
  hashLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  hashValue: {
    color: Colors.textBody,
    flexShrink: 1,
    fontFamily: "monospace",
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
  auditEvent: {
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
  },
  auditTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  auditMeta: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
  muted: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
});
