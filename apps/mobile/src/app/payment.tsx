import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function PaymentScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <RequireAuth>
            <Screen>
            <Header
                icon="💶"
                title={t("payment.title")}
                subtitle={t("payment.subtitle")}
            />

            <Card title={t("payment.calculation")}>
                <View style={styles.row}>
                    <Text style={styles.label}>{t("checkOut.hours")}</Text>
                    <Text style={styles.value}>{t("demo.hours.eight")}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("common.payPerHour")}</Text>
                    <Text style={styles.value}>{t("demo.amount.pay15")}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("payment.grossTotal")}</Text>
                    <Text style={styles.value}>{t("demo.amount.grossTotal")}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>{t("payment.workerFee")}</Text>
                    <Text style={styles.value}>{t("demo.amount.businessFee")}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>{t("payment.businessFee")}</Text>
                    <Text style={styles.value}>{t("demo.amount.businessFee")}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.totalLabel}>{t("payment.workerTotal")}</Text>
                    <Text style={styles.totalValue}>{t("demo.amount.workerTotal")}</Text>
                </View>
            </Card>

            <Card title={t("payment.statusTitle")}>
                <Text style={styles.item}>✓ {t("payment.item1")}</Text>
                <Text style={styles.item}>✓ {t("payment.item2")}</Text>
                <Text style={styles.item}>✓ {t("payment.item3")}</Text>
                <Text style={styles.pendingItem}>⏳ {t("payment.pending")}</Text>
            </Card>

            <Button
                title={t("payment.confirm")}
                onPress={() => {
                    console.log("PLATA CONFIRMATA");
                    router.push("/payment-confirmed" as any);
                }}
            />

            <Button
                title={t("common.backToCheckOut")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/check-out" as any);
                    }
                }}
            />
            </Screen>
        </RequireAuth>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: Spacing.lg,
    },

    label: {
        fontSize: Typography.body,
        color: Colors.textBody,
    },

    value: {
        fontSize: Typography.body,
        color: Colors.text,
        fontWeight: Typography.fontWeight.bold,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },

    totalLabel: {
        fontSize: Typography.button,
        color: Colors.text,
        fontWeight: Typography.fontWeight.extraBold,
    },

    totalValue: {
        fontSize: Typography.total,
        color: Colors.success,
        fontWeight: Typography.fontWeight.extraBold,
    },

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

    backButton: {
        marginTop: Spacing.xxl,
    },
});
