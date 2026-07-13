import RequireAuth from "@/components/RequireAuth";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";

export default function JobCompletedScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <RequireAuth>
      <Screen>
      <Header
        icon="🏆"
        title={t("jobCompleted.title")}
        subtitle={t("jobCompleted.subtitle")}
      />

      <Card title={t("jobCompleted.summary")}>
        <Text style={styles.item}>✓ {t("jobCompleted.item1")}</Text>
        <Text style={styles.item}>✓ {t("jobCompleted.item2")}</Text>
        <Text style={styles.item}>✓ {t("jobCompleted.item3")}</Text>
        <Text style={styles.item}>✓ {t("jobCompleted.item4")}</Text>
        <Text style={styles.item}>✓ {t("jobCompleted.item5")}</Text>
        <Text style={styles.successItem}>✓ {t("jobCompleted.item6")}</Text>
      </Card>

      <Card title={t("jobCompleted.mvpTitle")}>
        <Text style={styles.item}>{t("jobCompleted.mvp1")}</Text>
        <Text style={styles.item}>{t("jobCompleted.mvp2")}</Text>
      </Card>

      <Button
        title="Înapoi la RabAI"
        onPress={() => {
          router.replace("/engine" as any);
        }}
      />

      <Button
        title="Acasă"
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          router.replace("/engine" as any);
        }}
      />
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  item: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.md,
  },

  successItem: {
    fontSize: Typography.body,
    color: Colors.success,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },

  backButton: {
    marginTop: Spacing.xxl,
  },
});
