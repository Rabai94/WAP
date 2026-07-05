import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function BusinessScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header title={t("business.title")} subtitle={t("business.subtitle")} />

      <Card title={t("business.card.title")}>
        <Text style={styles.item}>✓ {t("business.card.item1")}</Text>
        <Text style={styles.item}>✓ {t("business.card.item2")}</Text>
        <Text style={styles.item}>✓ {t("business.card.item3")}</Text>
        <Text style={styles.item}>✓ {t("business.card.item4")}</Text>
      </Card>

      <Button
        title={t("business.continue")}
        onPress={() => {
          router.push("/business-form" as any);
        }}
      />

      <View style={styles.backButton}>
        <Button
          title={t("common.back")}
          variant="secondary"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/role" as any);
            }
          }}
        />
      </View>
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
    marginTop: Spacing.xl,
  },
});
