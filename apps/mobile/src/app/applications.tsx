import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function ApplicationsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header title={t("applications.title")} subtitle={t("applications.subtitle")} />

      <Card>
        <Text style={styles.workerName}>{t("demo.worker.ion")}</Text>

        <Text style={styles.info}>
          {t("applications.appliedTo")}: {t("jobs.warehouseTitle")}
        </Text>
        <Text style={styles.info}>
          {t("common.city")}: {t("demo.city.augsburg")}
        </Text>
        <Text style={styles.info}>
          {t("applications.availability")}: {t("applications.ionAvailability")}
        </Text>
        <Text style={styles.status}>
          {t("common.status")}: {t("applications.pending")}
        </Text>

        <View style={styles.buttonRow}>
          <Button
            title={t("applications.accept")}
            variant="success"
            style={styles.rowButton}
            onPress={() => {
              console.log("ACCEPTAT: Ion Popescu");
              router.push("/worker-accepted" as any);
            }}
          />

          <Button
            title={t("applications.reject")}
            variant="danger"
            style={styles.rowButton}
            onPress={() => {
              console.log("RESPINS: Ion Popescu");
            }}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.workerName}>{t("demo.worker.maria")}</Text>

        <Text style={styles.info}>
          {t("applications.appliedTo")}: {t("jobs.cleaningTitle")}
        </Text>
        <Text style={styles.info}>
          {t("common.city")}: {t("demo.city.munich")}
        </Text>
        <Text style={styles.info}>
          {t("applications.availability")}: {t("applications.mariaAvailability")}
        </Text>
        <Text style={styles.status}>
          {t("common.status")}: {t("applications.pending")}
        </Text>

        <View style={styles.buttonRow}>
          <Button
            title={t("applications.accept")}
            variant="success"
            style={styles.rowButton}
            onPress={() => {
              console.log("ACCEPTAT: Maria Ionescu");
              router.push("/worker-accepted" as any);
            }}
          />

          <Button
            title={t("applications.reject")}
            variant="danger"
            style={styles.rowButton}
            onPress={() => {
              console.log("RESPINS: Maria Ionescu");
            }}
          />
        </View>
      </Card>

      <Button
        title={t("common.backToBusinessDashboard")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/business-dashboard" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  workerName: {
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  info: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.detail,
  },

  status: {
    fontSize: Typography.body,
    color: Colors.brand,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },

  buttonRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },

  rowButton: {
    flex: 1,
    paddingVertical: Spacing.xl,
  },

  backButton: {
    marginTop: Spacing.md,
  },
});
