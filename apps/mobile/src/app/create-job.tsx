import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Spacing } from "@/theme";

export default function CreateJobScreen() {
    const router = useRouter();
    const { t } = useLanguage();

    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [payPerHour, setPayPerHour] = useState("");
    const [workersNeeded, setWorkersNeeded] = useState("");
    const [description, setDescription] = useState("");

    return (
        <RequireAuth>
            <Screen>
            <Header title={t("createJob.title")} subtitle={t("createJob.subtitle")} />

            <Card>
                <Input
                    label={t("createJob.jobTitle")}
                    placeholder={t("createJob.jobTitlePlaceholder")}
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label={t("common.city")}
                    placeholder={t("createJob.cityPlaceholder")}
                    value={city}
                    onChangeText={setCity}
                />

                <Input
                    label={t("createJob.payPerHour")}
                    placeholder={t("createJob.payPlaceholder")}
                    value={payPerHour}
                    onChangeText={setPayPerHour}
                    keyboardType="number-pad"
                />

                <Input
                    label={t("createJob.workersNeeded")}
                    placeholder={t("createJob.workersPlaceholder")}
                    value={workersNeeded}
                    onChangeText={setWorkersNeeded}
                    keyboardType="number-pad"
                />

                <Input
                    label={t("createJob.description")}
                    style={styles.bigInput}
                    placeholder={t("createJob.descriptionPlaceholder")}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
            </Card>

            <Button
                title={t("createJob.publish")}
                onPress={() => {
                    console.log("JOB CREAT:");
                    console.log("Titlu:", title);
                    console.log("Oras:", city);
                    console.log("Plata pe ora:", payPerHour);
                    console.log("Oameni cautati:", workersNeeded);
                    console.log("Descriere:", description);

                    router.push("/job-published" as any);
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
                        router.push("/business-dashboard" as any);
                    }
                }}
            />
            </Screen>
        </RequireAuth>
    );
}

const styles = StyleSheet.create({
    bigInput: {
        height: 90,
        textAlignVertical: "top",
    },

    backButton: {
        marginTop: Spacing.xxl,
    },
});
