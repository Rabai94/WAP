import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import PublicHeader from "@/components/navigation/PublicHeader";
import {
  ErrorState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
} from "@/components/ui";
import type { OnboardingIntent } from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useState } from "react";

export default function AccountTypeScreen() {
  const router = useRouter();
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
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
        {!session ? <PublicHeader /> : null}
        <PageHeader
          backLabel={t("common.back")}
          description={t("accountType.subtitle")}
          onBack={() => router.replace((session ? "/engine" : "/") as never)}
          title={t("accountType.title")}
        />

        {!session ? (
          <RabAICard title={t("accountType.authRequiredTitle")} variant="filled">
            <Text style={styles.text}>{t("accountType.authRequiredText")}</Text>
            <View style={styles.authActions}>
              <RabAIButton
                title={t("accountType.createAccount")}
                onPress={() => router.push("/login?mode=signup" as any)}
              />
              <RabAIButton
                title={t("accountType.login")}
                variant="secondary"
                onPress={() => router.push("/login" as any)}
              />
            </View>
          </RabAICard>
        ) : (
          <View style={styles.grid}>
            <RabAICard
              title={t("accountType.personal.title")}
              style={styles.card}
              variant="filled"
            >
              <Text style={styles.text}>{t("onboardingIntent.personal.text")}</Text>
              <RabAIButton
                loading={submittingIntent === "personal"}
                disabled={Boolean(submittingIntent && submittingIntent !== "personal")}
                title={
                  submittingIntent === "personal"
                    ? t("accountType.saving")
                    : t("accountType.personal.action")
                }
                onPress={() => void chooseOnboardingIntent("personal")}
              />
            </RabAICard>

            <RabAICard
              title={t("accountType.organization.title")}
              style={styles.card}
              variant="filled"
            >
              <Text style={styles.text}>
                {t("onboardingIntent.createOrganization.text")}
              </Text>
              <RabAIButton
                loading={submittingIntent === "create_organization"}
                disabled={Boolean(submittingIntent && submittingIntent !== "create_organization")}
                title={
                  submittingIntent === "create_organization"
                    ? t("accountType.saving")
                    : t("accountType.organization.action")
                }
                onPress={() =>
                  void chooseOnboardingIntent("create_organization")
                }
              />
            </RabAICard>
          </View>
        )}

        {error ? (
          <ErrorState description={error} title={t("accountType.saveError")} />
        ) : null}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
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
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  text: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.component,
  },
});
