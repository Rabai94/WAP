import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function JobActiveScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <Screen>
            <Header
                icon="🟢"
                title={t("jobActive.title")}
                subtitle={t("jobActive.subtitle")}
            />

            <Card title={t("jobActive.details")}>
                <Text style={styles.item}>{t("common.worker")}: {t("demo.worker.ion")}</Text>
                <Text style={styles.item}>{t("common.company")}: {t("demo.company.wapLogistics")}</Text>
                <Text style={styles.item}>{t("common.job")}: {t("jobs.warehouseTitle")}</Text>
                <Text style={styles.item}>{t("common.city")}: {t("demo.city.augsburg")}</Text>
                <Text style={styles.item}>{t("common.pay")}: {t("demo.pay15PerHour")}</Text>
                <Text style={styles.activeStatus}>
                    {t("common.status")}: {t("jobActive.active")}
                </Text>
            </Card>

            <Card title={t("jobActive.nextTitle")}>
                <Text style={styles.item}>✓ {t("jobActive.item1")}</Text>
                <Text style={styles.item}>✓ {t("jobActive.item2")}</Text>
                <Text style={styles.item}>✓ {t("jobActive.item3")}</Text>
                <Text style={styles.item}>✓ {t("jobActive.item4")}</Text>
            </Card>

            <Button
                title={t("jobActive.checkIn")}
                onPress={() => {
                    console.log("MERGEM LA CHECK-IN");
                    router.push("/check-in" as any);
                }}
            />

            <Button
                title={t("common.backToBusinessDashboard")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    router.push("/business-dashboard" as any);
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

    activeStatus: {
        fontSize: Typography.body,
        color: Colors.success,
        fontWeight: Typography.fontWeight.extraBold,
        marginTop: Spacing.sm,
    },

    backButton: {
        marginTop: Spacing.xxl,
    },
});
