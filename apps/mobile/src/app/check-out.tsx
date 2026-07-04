import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function CheckOutScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>🏁</Text>

            <Text style={styles.title}>Check-out făcut</Text>

            <Text style={styles.subtitle}>
                Munca a fost încheiată. Orele lucrate au fost calculate.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Rezumat muncă</Text>

                <Text style={styles.item}>Lucrător: Ion Popescu</Text>
                <Text style={styles.item}>Job: Lucrător depozit</Text>
                <Text style={styles.item}>Locație: Augsburg</Text>
                <Text style={styles.item}>Ore lucrate: 8</Text>
                <Text style={styles.item}>Plată/oră: 15 €</Text>
                <Text style={styles.total}>Plată estimată: 120 €</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Ce urmează?</Text>

                <Text style={styles.item}>✓ Firma confirmă orele</Text>
                <Text style={styles.item}>✓ Plata este pregătită</Text>
                <Text style={styles.item}>✓ Lucrătorul primește banii</Text>
                <Text style={styles.item}>✓ Ambele părți pot da rating</Text>
            </View>

            <Pressable
                style={styles.button}
                onPress={() => {
                    console.log("MERGEM LA PLATA");
                    router.replace("/payment" as any);
                }}
            >
                <Text style={styles.buttonText}>Continuă spre plată</Text>
            </Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/check-in" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi la check-in</Text>
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