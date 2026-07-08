import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function ContractScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <Screen>
            <Header
                icon="📄"
                title={t("contract.title")}
                subtitle={t("contract.subtitle")}
            />

            <Card title={t("contract.details")}>
                <Text style={styles.item}>{t("common.worker")}: {t("demo.worker.ion")}</Text>
                <Text style={styles.item}>{t("common.company")}: {t("demo.company.rabaiLogistics")}</Text>
                <Text style={styles.item}>{t("common.job")}: {t("jobs.warehouseTitle")}</Text>
                <Text style={styles.item}>{t("common.city")}: {t("demo.city.augsburg")}</Text>
                <Text style={styles.item}>{t("common.pay")}: {t("demo.pay15PerHour")}</Text>
                <Text style={styles.item}>
                    {t("common.status")}: {t("contract.readyStatus")}
                </Text>
            </Card>

            <Card variant="warning">
                <Text style={styles.warningTitle}>{t("contract.noteTitle")}</Text>

                <Text style={styles.warningText}>{t("contract.noteText")}</Text>
            </Card>

            <Button
                title={t("contract.send")}
                onPress={() => {
                    console.log("CONTRACT TRIMIS SPRE SEMNARE");
                    router.push("/contract-sent" as any);
                }}
            />

            <Button
                title={t("common.back")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/worker-accepted" as any);
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

    warningTitle: {
        fontSize: Typography.total,
        fontWeight: Typography.fontWeight.extraBold,
        color: Colors.text,
        marginBottom: Spacing.md,
    },

    warningText: {
        fontSize: Typography.label,
        color: Colors.textSecondary,
        lineHeight: Typography.lineHeight.body,
    },

    backButton: {
        marginTop: Spacing.xxl,
    },
});
