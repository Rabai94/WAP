import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        title={t("workerDashboard.title")}
        subtitle={t("workerDashboard.subtitle")}
      />

      <Card title={t("common.nextSteps")}>
        <Text style={styles.item}>✓ {t("workerDashboard.item1")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item2")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item3")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item4")}</Text>
      </Card>

      <Card title={t("workerDashboard.jobsTitle")}>
        <Text style={styles.emptyText}>{t("workerDashboard.empty")}</Text>
      </Card>

      <Button
        title={t("workerDashboard.viewJobs")}
        onPress={() => {
          console.log("MERGEM LA JOBURI");
          router.push("/jobs" as any);
        }}
      />

      <Button
        title={t("common.backToForm")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/worker-form" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.md,
  },

  emptyText: {
    fontSize: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeight.subtitle,
  },

  backButton: {
    marginTop: Spacing.xxl,
  },
});
