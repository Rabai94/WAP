import RequireAuth from "@/components/RequireAuth";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";

export default function ApplicationSentScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <RequireAuth>
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
      </Card>

      <Button
        title={t("common.ok")}
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
});
