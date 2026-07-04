import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AppButton from "../components/AppButton";
import AppCard from "../components/AppCard";

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

      <AppCard title="Rezumat final">
        <Text style={styles.item}>✓ Job publicat</Text>
        <Text style={styles.item}>✓ Lucrător acceptat</Text>
        <Text style={styles.item}>✓ Contract generat și trimis</Text>
        <Text style={styles.item}>✓ Check-in și check-out făcute</Text>
        <Text style={styles.item}>✓ Plata confirmată</Text>
        <Text style={styles.successItem}>✓ Rating finalizat</Text>
      </AppCard>

      <AppCard title="WAP MVP status">
        <Text style={styles.item}>Fluxul principal funcționează.</Text>
        <Text style={styles.item}>Următorul pas real: salvare date și backend.</Text>
      </AppCard>

      <AppButton
        title="Înapoi la început"
        onPress={() => {
          router.replace("/" as any);
        }}
      />

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