import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function PaymentConfirmedScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>✅</Text>

            <Text style={styles.title}>Plată confirmată</Text>

            <Text style={styles.subtitle}>
                Firma a confirmat orele și plata. Lucrătorul va primi banii.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Rezumat final</Text>

                <Text style={styles.item}>Lucrător: Ion Popescu</Text>
                <Text style={styles.item}>Firmă: WAP Logistics GmbH</Text>
                <Text style={styles.item}>Job: Lucrător depozit</Text>
                <Text style={styles.item}>Ore lucrate: 8</Text>
                <Text style={styles.item}>Total brut: 120 €</Text>
                <Text style={styles.total}>Plată lucrător: 116 €</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Status</Text>

                <Text style={styles.item}>✓ Munca a fost finalizată</Text>
                <Text style={styles.item}>✓ Orele au fost confirmate</Text>
                <Text style={styles.item}>✓ Plata a fost confirmată</Text>
                <Text style={styles.successItem}>✓ Job finalizat cu succes</Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("MERGEM LA RATING");
                    router.replace("/rating" as any);
                }}
            >
                <Text style={styles.buttonText}>Continuă spre rating</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/business-dashboard" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi la dashboard firmă</Text>
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

    total: {
        fontSize: 18,
        color: "#2E7D32",
        fontWeight: "800",
        marginTop: 6,
    },

    successItem: {
        fontSize: 16,
        color: "#2E7D32",
        fontWeight: "800",
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