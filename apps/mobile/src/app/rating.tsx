import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function RatingScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>⭐</Text>

            <Text style={styles.title}>Rating final</Text>

            <Text style={styles.subtitle}>
                Jobul a fost finalizat. Acum ambele părți pot evalua colaborarea.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Evaluare lucrător</Text>

                <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                <Text style={styles.item}>✓ Punctualitate bună</Text>
                <Text style={styles.item}>✓ Muncă finalizată</Text>
                <Text style={styles.item}>✓ Comportament profesional</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Evaluare firmă</Text>

                <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

                <Text style={styles.item}>✓ Firmă serioasă</Text>
                <Text style={styles.item}>✓ Plată confirmată</Text>
                <Text style={styles.item}>✓ Contract respectat</Text>
            </View>

      <Pressable
  style={styles.button}
  onPress={() => {
    console.log("JOB FINALIZAT COMPLET");
    router.replace("/job-completed" as any);
  }}
>
  <Text style={styles.buttonText}>Finalizează jobul</Text>
</Pressable>

            <Pressable
                style={styles.backButton}
                onPress={() => {
                    router.replace("/payment-confirmed" as any);
                }}
            >
                <Text style={styles.backText}>Înapoi la plată</Text>
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
        marginBottom: 10,
    },

    stars: {
        fontSize: 28,
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