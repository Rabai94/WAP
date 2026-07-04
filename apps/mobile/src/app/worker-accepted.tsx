import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function WorkerAcceptedScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🤝</Text>

            <Text style={styles.title}>Lucrător acceptat</Text>

            <Text style={styles.subtitle}>
                Firma a acceptat lucrătorul. Următorul pas este generarea contractului.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Ce urmează?</Text>

                <Text style={styles.item}>✓ Confirmare identitate lucrător</Text>
                <Text style={styles.item}>✓ Confirmare date firmă</Text>
                <Text style={styles.item}>✓ Generare contract legal</Text>
                <Text style={styles.item}>✓ Stabilire oră, locație și plată</Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("MERGEM LA CONTRACT");
                    router.replace("/contract" as any);
                }}
            >
                <Text style={styles.buttonText}>Generează contract</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/applications" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi la aplicări</Text>
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
        marginBottom: 22,
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