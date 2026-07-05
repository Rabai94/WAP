import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { languages } from "../i18n/translations";
import { Colors, Radius, Spacing, Typography } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  return (
    <Screen>
      <View style={styles.languageRow}>
        {languages.map((item) => (
          <Pressable
            key={item.code}
            style={[
              styles.languageButton,
              language === item.code && styles.activeLanguageButton,
            ]}
            onPress={() => {
              setLanguage(item.code);
            }}
          >
            <Text
              style={[
                styles.languageText,
                language === item.code && styles.activeLanguageText,
              ]}
            >
              {item.code.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.logo}>{t("home.title")}</Text>

      <Text style={styles.title}>{t("home.subtitle")}</Text>

      <Text style={styles.subtitle}>{t("home.description")}</Text>

      <View style={styles.grid}>
        <Card style={styles.homeCard}>
          <Text style={styles.cardText}>{t("home.card.jobs")}</Text>
        </Card>

        <Card style={styles.homeCard}>
          <Text style={styles.cardText}>{t("home.card.career")}</Text>
        </Card>

        <Card style={styles.homeCard}>
          <Text style={styles.cardText}>{t("home.card.services")}</Text>
        </Card>

        <Card style={styles.homeCard}>
          <Text style={styles.cardText}>{t("home.card.business")}</Text>
        </Card>

        <Card style={styles.homeCard}>
          <Text style={styles.cardText}>{t("home.card.ai")}</Text>
        </Card>
      </View>

      <Button
        title={t("home.start")}
        onPress={() => {
          router.push("/role" as any);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.screen,
  },
  languageButton: {
    borderWidth: 1,
    borderColor: Colors.brand,
    borderRadius: Radius.round,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    backgroundColor: Colors.white,
  },
  activeLanguageButton: {
    backgroundColor: Colors.brand,
  },
  languageText: {
    color: Colors.brand,
    fontWeight: Typography.fontWeight.extraBold,
  },
  activeLanguageText: {
    color: Colors.white,
  },
  logo: {
    fontSize: Typography.logo,
    fontWeight: Typography.fontWeight.black,
    color: Colors.brand,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.seven,
    lineHeight: Typography.lineHeight.subtitle,
  },
  grid: {
    marginBottom: Spacing.seven,
  },
  homeCard: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    marginBottom: Spacing.xl,
  },
  cardText: {
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
  },
});
