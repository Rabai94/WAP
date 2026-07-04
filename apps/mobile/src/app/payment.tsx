import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function PaymentScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>💶</Text>

            <Text style={styles.title}>Plată pregătită</Text>

            <Text style={styles.subtitle}>
                Orele au fost calculate. Plata este pregătită pentru procesare.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Calcul plată</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Ore lucrate</Text>
                    <Text style={styles.value}>8</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Plată/oră</Text>
                    <Text style={styles.value}>15 €</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total brut</Text>
                    <Text style={styles.value}>120 €</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>Taxă WAP lucrător</Text>
                    <Text style={styles.value}>4 €</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Taxă WAP firmă</Text>
                    <Text style={styles.value}>4 €</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.totalLabel}>Total estimat lucrător</Text>
                    <Text style={styles.totalValue}>116 €</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Status plată</Text>

                <Text style={styles.item}>✓ Ore calculate</Text>
                <Text style={styles.item}>✓ Taxe WAP calculate</Text>
                <Text style={styles.item}>✓ Plata pregătită</Text>
                <Text style={styles.pendingItem}>⏳ Așteaptă confirmarea firmei</Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("PLATA CONFIRMATA");
                    router.replace("/payment-confirmed" as any);
                }}
            >
                <Text style={styles.buttonText}>Confirmă plata</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/check-out" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi la check-out</Text>
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

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    label: {
        fontSize: 16,
        color: "#333333",
    },

    value: {
        fontSize: 16,
        color: "#000000",
        fontWeight: "700",
    },

    divider: {
        height: 1,
        backgroundColor: "#E6D8BC",
        marginVertical: 8,
    },

    totalLabel: {
        fontSize: 17,
        color: "#000000",
        fontWeight: "800",
    },

    totalValue: {
        fontSize: 18,
        color: "#2E7D32",
        fontWeight: "800",
    },

    item: {
        fontSize: 16,
        color: "#333333",
        marginBottom: 8,
    },

    pendingItem: {
        fontSize: 16,
        color: "#8B5A24",
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