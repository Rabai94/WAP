import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function MessagesScreen() {
  return (
    <RequireAuth>
      <MessagesContent />
    </RequireAuth>
  );
}

function MessagesContent() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title={t("messages.title")} subtitle={t("messages.subtitle")} />

        <Card title={t("messages.emptyTitle")}>
          <Text style={styles.bodyText}>{t("messages.emptyText")}</Text>
        </Card>

        <Button
          title={t("common.backToDashboard")}
          variant="ghost"
          onPress={() => router.replace("/engine" as any)}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    maxWidth: 900,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
});
