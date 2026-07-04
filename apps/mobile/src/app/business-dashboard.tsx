import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function BusinessDashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard firmă</Text>

      <Text style={styles.subtitle}>
        Profilul firmei a fost creat. Aici vei gestiona joburile și lucrătorii.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Următorii pași</Text>

        <Text style={styles.item}>✓ Verificare firmă</Text>
        <Text style={styles.item}>✓ Creare primul job</Text>
        <Text style={styles.item}>✓ Selectare lucrători</Text>
        <Text style={styles.item}>✓ Contract și plată prin aplicație</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Joburi postate</Text>

        <Text style={styles.emptyText}>
          Momentan firma nu are joburi salvate real. Avem doar flow demo pentru
          MVP.
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("MERGEM LA CREARE JOB");
          router.replace("/create-job" as any);
        }}
      >
        <Text style={styles.buttonText}>Creează job</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          console.log("MERGEM LA APLICARI");
          router.replace("/applications" as any);
        }}
      >
        <Text style={styles.secondaryButtonText}>Vezi aplicări</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/business-form" as any);
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

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#8B5A24",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#8B5A24",
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