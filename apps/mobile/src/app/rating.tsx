import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function RatingScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <RequireAuth>
            <Screen>
            <Header
                icon="⭐"
                title={t("rating.title")}
                subtitle={t("rating.subtitle")}
            />

            <Card title={t("rating.workerTitle")}>

                <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                <Text style={styles.item}>✓ {t("rating.workerItem1")}</Text>
                <Text style={styles.item}>✓ {t("rating.workerItem2")}</Text>
                <Text style={styles.item}>✓ {t("rating.workerItem3")}</Text>
            </Card>

            <Card title={t("rating.businessTitle")}>

                <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                <Text style={styles.item}>✓ {t("rating.businessItem1")}</Text>
                <Text style={styles.item}>✓ {t("rating.businessItem2")}</Text>
                <Text style={styles.item}>✓ {t("rating.businessItem3")}</Text>
            </Card>

            <Button
                title={t("rating.finish")}
                onPress={() => {
                    console.log("JOB FINALIZAT COMPLET");
                    router.push("/job-completed" as any);
                }}
            />

            <Button
                title={t("common.backToPayment")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/payment-confirmed" as any);
                    }
                }}
            />
            </Screen>
        </RequireAuth>
    );
}

const styles = StyleSheet.create({
    stars: {
        fontSize: Typography.headline,
        marginBottom: Spacing.xl,
    },

    item: {
        fontSize: Typography.body,
        color: Colors.textBody,
        marginBottom: Spacing.md,
    },

    backButton: {
        marginTop: Spacing.xxl,
    },
});
