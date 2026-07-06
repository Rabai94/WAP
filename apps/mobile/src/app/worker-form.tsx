import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Header, Input, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { mockWorkerProfile } from "@/domain/profile";
import { Spacing } from "@/theme";

export default function WorkerFormScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const profile = mockWorkerProfile;
  const profileName = `${profile.firstName} ${profile.lastName}`;
  const workPreferences = profile.workPreferences.map(t).join(", ");

  return (
    <Screen>
      <Header
        title={t("workerForm.title")}
        subtitle={t("workerForm.subtitle")}
      />

      <Input
        label={t("workerForm.name")}
        defaultValue={profileName}
        placeholder={t("workerForm.namePlaceholder")}
      />

      <Input
        label={t("workerForm.city")}
        defaultValue={profile.location}
        placeholder={t("workerForm.cityPlaceholder")}
      />

      <Input
        label={t("workerForm.workType")}
        defaultValue={workPreferences}
        placeholder={t("workerForm.workTypePlaceholder")}
      />

      <Input
        label={t("workerForm.availability")}
        defaultValue={t(profile.availability.label)}
        placeholder={t("workerForm.availabilityPlaceholder")}
      />

      <Button
        title={t("workerForm.save")}
        onPress={() => {
          router.push("/worker-dashboard" as any);
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
              router.push("/worker" as any);
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
