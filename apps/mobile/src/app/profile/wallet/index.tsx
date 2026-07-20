import CredentialSkillList from "@/components/credentials/CredentialSkillList";
import CredentialStatusBadge from "@/components/credentials/CredentialStatusBadge";
import CredentialWalletActions from "@/components/credentials/CredentialWalletActions";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  listOwnCredentials,
  type WalletCredential,
} from "@/services/credentials/credentialService";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const categories = ["certificate", "diploma", "license", "authorization"] as const;
type WalletCategory = (typeof categories)[number];

export default function CredentialWalletScreen() {
  return (
    <RequireAuth>
      <CredentialWalletContent />
    </RequireAuth>
  );
}

function CredentialWalletContent() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const [credentials, setCredentials] = useState<WalletCredential[]>([]);
  const [category, setCategory] = useState<WalletCategory>("certificate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCredentials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCredentials(await listOwnCredentials());
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.wallet.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCredentials();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadCredentials]);

  const visibleCredentials = useMemo(
    () => category === "certificate" ? credentials : [],
    [category, credentials],
  );

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
          { maxWidth: responsive.contentMaxWidth },
        ]}
      >
        <Header
          subtitle={t("credentials.wallet.subtitle")}
          title={t("credentials.wallet.title")}
        />

        <View style={styles.toolbar}>
          <Button
            onPress={() => router.push("/profile" as never)}
            title={t("credentials.wallet.backToProfile")}
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={() => void loadCredentials()}
            title={t("common.refresh")}
            variant="ghost"
          />
        </View>

        <View accessibilityRole="tablist" style={styles.categories}>
          {categories.map((nextCategory) => (
            <Button
              key={nextCategory}
              onPress={() => setCategory(nextCategory)}
              style={styles.categoryButton}
              title={t(`credentials.category.${nextCategory}`)}
              variant={category === nextCategory ? "primary" : "secondary"}
            />
          ))}
        </View>

        {loading ? <Card><Text style={styles.muted}>{t("common.loading")}</Text></Card> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        {!loading && visibleCredentials.length === 0 ? (
          <Card>
            <Text style={styles.muted}>
              {category === "certificate"
                ? t("credentials.wallet.empty")
                : t("credentials.wallet.futureCategory")}
            </Text>
          </Card>
        ) : null}

        {visibleCredentials.map((credential) => (
          <Card key={credential.credential_id}>
            <View style={styles.cardHeader}>
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
                  label={t(credential.is_public
                    ? "credentials.visibility.public"
                    : "credentials.visibility.private")}
                  status={credential.is_public ? "ready" : "pending"}
                />
              </View>
            </View>

            <View style={styles.metaGrid}>
              <Meta label={t("credentials.wallet.issuer")} value={credential.issuer_name} />
              <Meta label={t("credentials.wallet.issuedAt")} value={formatDate(credential.issued_at)} />
              <Meta
                label={t("credentials.wallet.expiresAt")}
                value={credential.expires_at
                  ? formatDate(credential.expires_at)
                  : t("credentials.wallet.noExpiry")}
              />
            </View>

            <Text style={styles.sectionLabel}>{t("credentials.wallet.skills")}</Text>
            <CredentialSkillList
              emptyLabel={t("credentials.wallet.noSkills")}
              language={language}
              skills={credential.skills}
            />

            <CredentialWalletActions
              credentialId={credential.credential_id}
              documentStatus={credential.document_status}
              isPublic={credential.is_public}
              onChanged={loadCredentials}
              title={credential.title}
              verificationToken={credential.verification_token}
            />
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
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
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryButton: {
    minWidth: 130,
  },
  cardHeader: {
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
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.extraBold,
  },
  number: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  badges: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  metaItem: {
    flexBasis: 180,
    flexGrow: 1,
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  metaValue: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
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
