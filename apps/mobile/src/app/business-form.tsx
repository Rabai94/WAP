import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Header, Input, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Spacing } from "@/theme";

export default function BusinessFormScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        title={t("businessForm.title")}
        subtitle={t("businessForm.subtitle")}
      />

      <Input
        label={t("businessForm.companyName")}
        placeholder={t("businessForm.companyNamePlaceholder")}
      />

      <Input
        label={t("businessForm.city")}
        placeholder={t("businessForm.cityPlaceholder")}
      />

      <Input
        label={t("businessForm.workType")}
        placeholder={t("businessForm.workTypePlaceholder")}
      />

      <Input
        label={t("businessForm.workersNeeded")}
        placeholder={t("businessForm.workersNeededPlaceholder")}
        keyboardType="numeric"
      />

      <Button
        title={t("businessForm.save")}
        onPress={() => {
          router.push("/business-dashboard" as any);
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
              router.push("/business" as any);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginTop: Spacing.xl,
  },
});
