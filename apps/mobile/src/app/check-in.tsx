import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function CheckInScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <Screen>
            <Header
                icon="📍"
                title={t("checkIn.title")}
                subtitle={t("checkIn.subtitle")}
            />

            <Card title={t("checkIn.timeTitle")}>
                <Text style={styles.item}>{t("common.worker")}: {t("demo.worker.ion")}</Text>
                <Text style={styles.item}>{t("common.job")}: {t("jobs.warehouseTitle")}</Text>
                <Text style={styles.item}>{t("common.location")}: {t("demo.city.augsburg")}</Text>
                <Text style={styles.item}>{t("common.startTime")}: {t("checkIn.startNow")}</Text>
                <Text style={styles.activeStatus}>
                    {t("common.status")}: {t("checkIn.inProgress")}
                </Text>
            </Card>

            <Card title={t("common.nextSteps")}>
                <Text style={styles.item}>✓ {t("checkIn.item1")}</Text>
                <Text style={styles.item}>✓ {t("checkIn.item2")}</Text>
                <Text style={styles.item}>✓ {t("checkIn.item3")}</Text>
                <Text style={styles.item}>✓ {t("checkIn.item4")}</Text>
            </Card>

            <Button
                title={t("checkIn.checkOut")}
                onPress={() => {
                    console.log("MERGEM LA CHECK-OUT");
                    router.push("/check-out" as any);
                }}
            />

            <Button
                title={t("common.backToActiveJob")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/job-active" as any);
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
