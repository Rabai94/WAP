import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function ContractSentScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✍️</Text>

      <Text style={styles.title}>Contract trimis</Text>

      <Text style={styles.subtitle}>
        Contractul a fost trimis spre semnare către firmă și lucrător.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status semnare</Text>

        <Text style={styles.item}>✓ Contract generat</Text>
        <Text style={styles.item}>✓ Trimis către firmă</Text>
        <Text style={styles.item}>✓ Trimis către lucrător</Text>
        <Text style={styles.pendingItem}>⏳ Așteaptă semnăturile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>După semnare</Text>

        <Text style={styles.item}>✓ Jobul devine activ</Text>
        <Text style={styles.item}>✓ Lucrătorul poate începe munca</Text>
        <Text style={styles.item}>✓ Plata va fi urmărită în aplicație</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("SEMNARE COMPLETA - JOB ACTIV");
          router.replace("/job-active" as any);
        }}
      >
        <Text style={styles.buttonText}>Simulează semnare completă</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          router.replace("/business-dashboard" as any);
        }}
      >
        <Text style={styles.secondaryButtonText}>Înapoi la dashboard firmă</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/contract" as any);
        }}
      >
        <Text style={styles.backText}>Înapoi la contract</Text>
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