import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function CreateJobScreen() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [city, setCity] = useState("");
    const [payPerHour, setPayPerHour] = useState("");
    const [workersNeeded, setWorkersNeeded] = useState("");
    const [description, setDescription] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Creează job</Text>

            <Text style={styles.subtitle}>
                Completează detaliile jobului pe care vrei să îl postezi.
            </Text>

            <View style={styles.form}>
                <Text style={styles.label}>Titlu job</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Lucrător depozit"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Oraș</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Augsburg"
                    value={city}
                    onChangeText={setCity}
                />

                <Text style={styles.label}>Plată pe oră</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 15"
                    value={payPerHour}
                    onChangeText={setPayPerHour}
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Câți oameni cauți?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: 4"
                    value={workersNeeded}
                    onChangeText={setWorkersNeeded}
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Descriere job</Text>
                <TextInput
                    style={[styles.input, styles.bigInput]}
                    placeholder="Ex: Muncă în depozit, sortare pachete, program flexibil."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("JOB CREAT:");
                    console.log("Titlu:", title);
                    console.log("Oras:", city);
                    console.log("Plata pe ora:", payPerHour);
                    console.log("Oameni cautati:", workersNeeded);
                    console.log("Descriere:", description);

                    router.replace("/job-published" as any);
                }}
            >
                <Text style={styles.buttonText}>Publică jobul</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/business-dashboard" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF3D8",
        padding: 24,
        justifyContent: "center",
    },

    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#000000",
        textAlign: "center",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: "#444444",
        textAlign: "center",
        marginBottom: 24,
    },

    form: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E6D8BC",
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
    },

    label: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 6,
    },

    input: {
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
        marginBottom: 14,
    },

    bigInput: {
        height: 90,
        textAlignVertical: "top",
    },

    button: {
        backgroundColor: "#8B5A24",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "800",
    },

    backButton: {
        marginTop: 14,
        alignItems: "center",
        padding: 12,
    },

    backText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#8B5A24",
    },
});