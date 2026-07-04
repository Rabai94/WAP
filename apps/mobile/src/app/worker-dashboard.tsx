import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function WorkerDashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard lucrător</Text>

      <Text style={styles.subtitle}>
        Profilul tău a fost creat. Aici vei vedea joburi disponibile.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Următorii pași</Text>

        <Text style={styles.item}>✓ Verificare identitate</Text>
        <Text style={styles.item}>✓ Alegere tipuri de muncă</Text>
        <Text style={styles.item}>✓ Setare disponibilitate</Text>
        <Text style={styles.item}>✓ Primire oferte de job</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Joburi recomandate</Text>

        <Text style={styles.emptyText}>
          Ai joburi demo disponibile. Intră în lista de joburi pentru a aplica.
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("MERGEM LA JOBURI");
          router.replace("/jobs" as any);
        }}
      >
        <Text style={styles.buttonText}>Vezi joburi</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/worker-form" as any);
        }}
      >
        <Text style={styles.backText}>Înapoi la formular</Text>
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

  emptyText: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#8B5A24",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
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