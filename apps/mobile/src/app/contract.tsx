import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function ContractScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>📄</Text>

            <Text style={styles.title}>Contract generat</Text>

            <Text style={styles.subtitle}>
                Contractul demo a fost pregătit pentru semnare.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Detalii contract</Text>

                <Text style={styles.item}>Lucrător: Ion Popescu</Text>
                <Text style={styles.item}>Firmă: WAP Logistics GmbH</Text>
                <Text style={styles.item}>Job: Lucrător depozit</Text>
                <Text style={styles.item}>Oraș: Augsburg</Text>
                <Text style={styles.item}>Plată: 15 €/oră</Text>
                <Text style={styles.item}>Status: Pregătit pentru semnare</Text>
            </View>

            <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>Notă MVP</Text>

                <Text style={styles.warningText}>
                    Acesta este doar un contract demo pentru aplicație. Contractele reale
                    trebuie verificate juridic înainte de folosire.
                </Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("CONTRACT TRIMIS SPRE SEMNARE");
                    router.replace("/contract-sent" as any);
                }}
            >
                <Text style={styles.buttonText}>Trimite spre semnare</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/worker-accepted" as any);
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

    icon: {
        fontSize: 54,
        textAlign: "center",
        marginBottom: 12,
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
        lineHeight: 22,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E6D8BC",
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 21,
        fontWeight: "800",
        color: "#000000",
        marginBottom: 12,
    },

    item: {
        fontSize: 16,
        color: "#333333",
        marginBottom: 8,
    },

    warningCard: {
        backgroundColor: "#FFF8E8",
        borderWidth: 1,
        borderColor: "#D9B56D",
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
    },

    warningTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#000000",
        marginBottom: 8,
    },

    warningText: {
        fontSize: 15,
        color: "#444444",
        lineHeight: 21,
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