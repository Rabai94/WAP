import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        title={t("businessDashboard.title")}
        subtitle={t("businessDashboard.subtitle")}
      />

      <Card title={t("common.nextSteps")}>
        <Text style={styles.item}>✓ {t("businessDashboard.item1")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item2")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item3")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item4")}</Text>
      </Card>

      <Card title={t("businessDashboard.jobsTitle")}>
        <Text style={styles.emptyText}>{t("businessDashboard.empty")}</Text>
      </Card>

      <Button
        title={t("businessDashboard.createJob")}
        onPress={() => {
          console.log("MERGEM LA CREARE JOB");
          router.push("/create-job" as any);
        }}
      />

      <Button
        title={t("businessDashboard.viewApplications")}
        variant="secondary"
        style={styles.secondaryButton}
        onPress={() => {
          console.log("MERGEM LA APLICARI");
          router.push("/applications" as any);
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
            router.push("/business-form" as any);
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

  secondaryButton: {
    marginTop: Spacing.xl,
  },

  backButton: {
    marginTop: Spacing.xxl,
  },
});
