import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function JobCompletedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🏆</Text>

      <Text style={styles.title}>Job finalizat</Text>

      <Text style={styles.subtitle}>
        Jobul a fost încheiat complet. Contractul, plata și ratingul au fost
        procesate.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rezumat final</Text>

        <Text style={styles.item}>✓ Job publicat</Text>
        <Text style={styles.item}>✓ Lucrător acceptat</Text>
        <Text style={styles.item}>✓ Contract generat și trimis</Text>
        <Text style={styles.item}>✓ Check-in și check-out făcute</Text>
        <Text style={styles.item}>✓ Plata confirmată</Text>
        <Text style={styles.successItem}>✓ Rating finalizat</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>WAP MVP status</Text>

        <Text style={styles.item}>Fluxul principal funcționează.</Text>
        <Text style={styles.item}>Următorul pas real: salvare date și backend.</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          router.replace("/" as any);
        }}
      >
        <Text style={styles.buttonText}>Înapoi la început</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/business-dashboard" as any);
        }}
      >
        <Text style={styles.backText}>Dashboard firmă</Text>
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