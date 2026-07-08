import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function WorkerAcceptedScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <RequireAuth>
            <Screen>
            <Header
                icon="🤝"
                title={t("workerAccepted.title")}
                subtitle={t("workerAccepted.subtitle")}
            />

            <Card title={t("common.nextSteps")}>
                <Text style={styles.item}>✓ {t("workerAccepted.item1")}</Text>
                <Text style={styles.item}>✓ {t("workerAccepted.item2")}</Text>
                <Text style={styles.item}>✓ {t("workerAccepted.item3")}</Text>
                <Text style={styles.item}>✓ {t("workerAccepted.item4")}</Text>
            </Card>

            <Button
                title={t("workerAccepted.generateContract")}
                onPress={() => {
                    console.log("MERGEM LA CONTRACT");
                    router.push("/contract" as any);
                }}
            />

            <Button
                title={t("common.backToApplications")}
                variant="ghost"
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push("/applications" as any);
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

    backButton: {
        marginTop: Spacing.xxl,
    },
});
