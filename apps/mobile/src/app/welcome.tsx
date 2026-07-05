import { SafeAreaView, StyleSheet, View } from "react-native";

import Button from "@/components/Button";
import AppText from "@/components/AppText";

import { Colors, Spacing } from "@/theme";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <AppText variant="h1">
          {t("welcome.title")}
        </AppText>

        <AppText variant="title">
          {t("welcome.subtitle")}
        </AppText>

        <AppText variant="body">
          {t("welcome.description")}
        </AppText>

        <Button title={t("welcome.start")} />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
});
