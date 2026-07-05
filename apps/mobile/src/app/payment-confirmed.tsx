import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function PaymentConfirmedScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <Screen>
            <Header
                icon="✅"
                title={t("paymentConfirmed.title")}
                subtitle={t("paymentConfirmed.subtitle")}
            />

            <Card title={t("paymentConfirmed.summary")}>
                <Text style={styles.item}>{t("common.worker")}: {t("demo.worker.ion")}</Text>
                <Text style={styles.item}>{t("common.company")}: {t("demo.company.wapLogistics")}</Text>
                <Text style={styles.item}>{t("common.job")}: {t("jobs.warehouseTitle")}</Text>
                <Text style={styles.item}>{t("checkOut.hours")}: {t("demo.hours.eight")}</Text>
                <Text style={styles.item}>{t("payment.grossTotal")}: {t("demo.amount.grossTotal")}</Text>
                <Text style={styles.total}>{t("paymentConfirmed.workerPay")}: {t("demo.amount.workerTotal")}</Text>
            </Card>

            <Card title={t("paymentConfirmed.statusTitle")}>
                <Text style={styles.item}>✓ {t("paymentConfirmed.item1")}</Text>
                <Text style={styles.item}>✓ {t("paymentConfirmed.item2")}</Text>
                <Text style={styles.item}>✓ {t("paymentConfirmed.item3")}</Text>
                <Text style={styles.successItem}>✓ {t("paymentConfirmed.success")}</Text>
            </Card>

            <Button
                title={t("paymentConfirmed.continueRating")}
                onPress={() => {
                    console.log("MERGEM LA RATING");
                    router.push("/rating" as any);
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

    total: {
        fontSize: Typography.total,
        color: Colors.success,
        fontWeight: Typography.fontWeight.extraBold,
        marginTop: Spacing.sm,
    },

    successItem: {
        fontSize: Typography.body,
        color: Colors.success,
        fontWeight: Typography.fontWeight.extraBold,
        marginBottom: Spacing.md,
    },

    backButton: {
        marginTop: Spacing.xxl,
    },
});
