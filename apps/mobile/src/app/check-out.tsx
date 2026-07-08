import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function CheckOutScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <RequireAuth>
            <Screen>
            <Header
                icon="🏁"
                title={t("checkOut.title")}
                subtitle={t("checkOut.subtitle")}
            />

            <Card title={t("checkOut.summary")}>
                <Text style={styles.item}>{t("common.worker")}: {t("demo.worker.ion")}</Text>
                <Text style={styles.item}>{t("common.job")}: {t("jobs.warehouseTitle")}</Text>
                <Text style={styles.item}>{t("common.location")}: {t("demo.city.augsburg")}</Text>
                <Text style={styles.item}>{t("checkOut.hours")}: {t("demo.hours.eight")}</Text>
                <Text style={styles.item}>{t("common.payPerHour")}: {t("demo.amount.pay15")}</Text>
                <Text style={styles.total}>{t("checkOut.estimatedPay")}: {t("demo.amount.grossTotal")}</Text>
            </Card>

            <Card title={t("common.nextSteps")}>
                <Text style={styles.item}>✓ {t("checkOut.item1")}</Text>
                <Text style={styles.item}>✓ {t("checkOut.item2")}</Text>
                <Text style={styles.item}>✓ {t("checkOut.item3")}</Text>
                <Text style={styles.item}>✓ {t("checkOut.item4")}</Text>
            </Card>

            <Button
                title={t("checkOut.continuePayment")}
                onPress={() => {
                    console.log("MERGEM LA PLATA");
                    router.push("/payment" as any);
                }}
            />

            <Button
                title={t("common.backToCheckIn")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/check-in" as any);
                    }
                }}
            />
            </Screen>
        </RequireAuth>
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

    backButton: {
        marginTop: Spacing.xxl,
    },
});
