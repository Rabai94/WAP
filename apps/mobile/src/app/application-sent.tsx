import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function ApplicationSentScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        icon="✅"
        title={t("applicationSent.title")}
        subtitle={t("applicationSent.subtitle")}
        hero
      />

      <Card title={t("applicationSent.cardTitle")}>
        <Text style={styles.item}>✓ {t("applicationSent.item1")}</Text>
        <Text style={styles.item}>✓ {t("applicationSent.item2")}</Text>
        <Text style={styles.item}>✓ {t("applicationSent.item3")}</Text>
        <Text style={styles.item}>✓ {t("applicationSent.item4")}</Text>
      </Card>

      <Button
        title={t("common.backToJobs")}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/jobs" as any);
          }
        }}
      />

      <Button
        title={t("common.dashboardWorker")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          router.push("/worker-dashboard" as any);
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

  backButton: {
    marginTop: Spacing.xxl,
  },
});
