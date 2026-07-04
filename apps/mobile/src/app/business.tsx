import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function BusinessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil firmă</Text>

      <Text style={styles.subtitle}>
        Aici începe contul pentru firma care caută lucrători.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ce va avea firma?</Text>

        <Text style={styles.item}>✓ Postează joburi rapid</Text>
        <Text style={styles.item}>✓ Primește lucrători verificați</Text>
        <Text style={styles.item}>✓ Contracte legale în aplicație</Text>
        <Text style={styles.item}>✓ Plată și evidență organizată</Text>
        <Text style={styles.item}>✓ Rating pentru seriozitatea lucrătorilor</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("MERGEM LA FORMULAR FIRMA");
          router.replace("/business-form" as any);
        }}
      >
        <Text style={styles.buttonText}>Continuă</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/role" as any);
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

  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 17,
    color: "#444444",
    textAlign: "center",
    marginBottom: 28,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 14,
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