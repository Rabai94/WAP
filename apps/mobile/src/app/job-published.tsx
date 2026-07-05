import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function JobPublishedScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        icon="✅"
        title={t("jobPublished.title")}
        subtitle={t("jobPublished.subtitle")}
        hero
      />

      <Card title={t("common.nextSteps")}>
        <Text style={styles.item}>✓ {t("jobPublished.item1")}</Text>
        <Text style={styles.item}>✓ {t("jobPublished.item2")}</Text>
        <Text style={styles.item}>✓ {t("jobPublished.item3")}</Text>
        <Text style={styles.item}>✓ {t("jobPublished.item4")}</Text>
      </Card>

      <Button
        title={t("common.backToDashboard")}
        onPress={() => {
          router.push("/business-dashboard" as any);
        }}
      />

      <Button
        title={t("common.backToJob")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/create-job" as any);
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

  backButton: {
    marginTop: Spacing.xxl,
  },
});
