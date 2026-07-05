import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function ContractSentScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header
        icon="✍️"
        title={t("contractSent.title")}
        subtitle={t("contractSent.subtitle")}
      />

      <Card title={t("contractSent.signStatus")}>
        <Text style={styles.item}>✓ {t("contractSent.item1")}</Text>
        <Text style={styles.item}>✓ {t("contractSent.item2")}</Text>
        <Text style={styles.item}>✓ {t("contractSent.item3")}</Text>
        <Text style={styles.pendingItem}>⏳ {t("contractSent.pending")}</Text>
      </Card>

      <Card title={t("contractSent.afterTitle")}>
        <Text style={styles.item}>✓ {t("contractSent.after1")}</Text>
        <Text style={styles.item}>✓ {t("contractSent.after2")}</Text>
        <Text style={styles.item}>✓ {t("contractSent.after3")}</Text>
      </Card>

      <Button
        title={t("contractSent.simulate")}
        onPress={() => {
          console.log("SEMNARE COMPLETA - JOB ACTIV");
          router.push("/job-active" as any);
        }}
      />

      <Button
        title={t("common.backToBusinessDashboard")}
        variant="secondary"
        style={styles.secondaryButton}
        onPress={() => {
          router.push("/business-dashboard" as any);
        }}
      />

      <Button
        title={t("common.backToContract")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/contract" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.md,
  },

  pendingItem: {
    fontSize: Typography.body,
    color: Colors.brand,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },

  secondaryButton: {
    marginTop: Spacing.xl,
  },

  backButton: {
    marginTop: Spacing.xxl,
  },
});
