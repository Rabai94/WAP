import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function JobsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header title={t("jobs.title")} subtitle={t("jobs.subtitle")} />

      <Card>
        <Text style={styles.jobTitle}>{t("jobs.warehouseTitle")}</Text>
        <Text style={styles.jobInfo}>📍 {t("demo.city.augsburg")}</Text>
        <Text style={styles.jobInfo}>💶 {t("demo.pay15PerHour")}</Text>
        <Text style={styles.jobInfo}>{t("jobs.warehousePeople")}</Text>

        <Text style={styles.jobDescription}>{t("jobs.warehouseDescription")}</Text>

        <Button
          title={t("common.apply")}
          onPress={() => {
            console.log("APLICA LA JOB: Lucrător depozit");
            router.push("/application-sent" as any);
          }}
        />
      </Card>

      <Card>
        <Text style={styles.jobTitle}>{t("jobs.cleaningTitle")}</Text>
        <Text style={styles.jobInfo}>📍 {t("demo.city.munich")}</Text>
        <Text style={styles.jobInfo}>💶 {t("demo.pay14PerHour")}</Text>
        <Text style={styles.jobInfo}>{t("jobs.cleaningPeople")}</Text>

        <Text style={styles.jobDescription}>{t("jobs.cleaningDescription")}</Text>

        <Button
          title={t("common.apply")}
          onPress={() => {
            console.log("APLICA LA JOB: Curățenie birouri");
            router.push("/application-sent" as any);
          }}
        />
      </Card>

      <Button
        title={t("common.backToDashboard")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/worker-dashboard" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  jobTitle: {
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  jobInfo: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.detail,
  },

  jobDescription: {
    fontSize: Typography.label,
    color: Colors.textSubtle,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },

  backButton: {
    marginTop: Spacing.md,
  },
});
