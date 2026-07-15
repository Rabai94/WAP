import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Header, Screen } from "@/components/ui";
import type { OnboardingIntent } from "@/domain/account";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useState } from "react";

export default function AccountTypeScreen() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const { session, updateOnboardingIntent } = useAuth();
  const [error, setError] = useState("");
  const [submittingIntent, setSubmittingIntent] =
    useState<OnboardingIntent | null>(null);

  async function chooseOnboardingIntent(onboardingIntent: OnboardingIntent) {
    if (submittingIntent) {
      return;
    }

    setSubmittingIntent(onboardingIntent);
    setError("");

    try {
      await updateOnboardingIntent(onboardingIntent);
      router.replace(
        (onboardingIntent === "create_organization"
          ? "/organizations/create"
          : "/engine") as any
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("accountType.saveError")
      );
    } finally {
      setSubmittingIntent(null);
    }
  }

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
            maxWidth: responsive.isWide ? 1120 : responsive.contentMaxWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={t("accountType.title")}
          subtitle={t("accountType.subtitle")}
        />

        {!session ? (
          <Card title={t("accountType.authRequiredTitle")}>
            <Text style={styles.text}>{t("accountType.authRequiredText")}</Text>
            <View style={styles.authActions}>
              <Button
                title={t("accountType.createAccount")}
                onPress={() => router.push("/login?mode=signup" as any)}
              />
              <Button
                title={t("accountType.login")}
                variant="secondary"
                onPress={() => router.push("/login" as any)}
              />
            </View>
          </Card>
        ) : (
          <View style={styles.grid}>
            <Card
              title={t("accountType.personal.title")}
              style={[
                styles.card,
                { flexBasis: responsive.isMobile ? "100%" : 300 },
              ]}
            >
              <Text style={styles.text}>{t("onboardingIntent.personal.text")}</Text>
              <Button
                disabled={Boolean(submittingIntent)}
                title={
                  submittingIntent === "personal"
                    ? t("accountType.saving")
                    : t("accountType.personal.action")
                }
                onPress={() => void chooseOnboardingIntent("personal")}
              />
            </Card>

            <Card
              title={t("accountType.organization.title")}
              style={[
                styles.card,
                { flexBasis: responsive.isMobile ? "100%" : 300 },
              ]}
            >
              <Text style={styles.text}>
                {t("onboardingIntent.createOrganization.text")}
              </Text>
              <Button
                disabled={Boolean(submittingIntent)}
                title={
                  submittingIntent === "create_organization"
                    ? t("accountType.saving")
                    : t("accountType.organization.action")
                }
                onPress={() =>
                  void chooseOnboardingIntent("create_organization")
                }
              />
            </Card>
          </View>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={t("common.back")}
          variant="ghost"
          onPress={() => {
            router.replace((session ? "/engine" : "/") as any);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  card: {
    flexBasis: 300,
    flexGrow: 1,
  },
  authActions: {
    gap: Spacing.md,
  },
  text: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
