import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function ChooseRoleScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen plain>
      <Header
        title={t("chooseRole.title")}
        subtitle={t("chooseRole.subtitle")}
      />

      <Pressable
        onPress={() => {
          console.log("AI ALES WORKER");
        }}
      >
        <Card variant="muted">
          <Text style={styles.cardTitle}>{t("chooseRole.workerTitle")}</Text>
          <Text style={styles.cardText}>{t("chooseRole.workerDescription")}</Text>
        </Card>
      </Pressable>

      <Pressable
        onPress={() => {
          console.log("AI ALES BUSINESS");
        }}
      >
        <Card variant="muted">
          <Text style={styles.cardTitle}>{t("chooseRole.businessTitle")}</Text>
          <Text style={styles.cardText}>{t("chooseRole.businessDescription")}</Text>
        </Card>
      </Pressable>

      <Button
        title={t("common.back")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  cardText: {
    fontSize: Typography.body,
    color: Colors.textBody,
    lineHeight: Typography.lineHeight.subtitle,
  },

  backButton: {
    marginTop: Spacing.xl,
  },
});
