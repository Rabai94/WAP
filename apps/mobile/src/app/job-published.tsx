import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function JobPublishedScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <RequireAuth>
      <Screen>
      <Header
        icon="✅"
        title={t("jobPublished.title")}
        subtitle={t("jobPublished.subtitle")}
        hero
      />

      <Card title={t("jobPublished.cardTitle")}>
        <Text style={styles.item}>✓ {t("jobPublished.item1")}</Text>
        <Text style={styles.item}>✓ {t("jobPublished.item2")}</Text>
        <Text style={styles.item}>✓ {t("jobPublished.item3")}</Text>
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
