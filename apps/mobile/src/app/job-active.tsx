import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function JobActiveScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🟢</Text>

      <Text style={styles.title}>Job activ</Text>

      <Text style={styles.subtitle}>
        Contractul a fost semnat. Lucrătorul poate începe munca.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Detalii job</Text>

        <Text style={styles.item}>Lucrător: Ion Popescu</Text>
        <Text style={styles.item}>Firmă: WAP Logistics GmbH</Text>
        <Text style={styles.item}>Job: Lucrător depozit</Text>
        <Text style={styles.item}>Oraș: Augsburg</Text>
        <Text style={styles.item}>Plată: 15 €/oră</Text>
        <Text style={styles.activeStatus}>Status: Activ</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Următorul pas</Text>

        <Text style={styles.item}>✓ Lucrătorul ajunge la locație</Text>
        <Text style={styles.item}>✓ Face check-in în aplicație</Text>
        <Text style={styles.item}>✓ Timpul de muncă este urmărit</Text>
        <Text style={styles.item}>✓ Plata se calculează după ore</Text>
      </View>

      <Pressable
  style={styles.button}
  onPress={() => {
    console.log("MERGEM LA CHECK-IN");
    router.replace("/check-in" as any);
  }}
>
  <Text style={styles.buttonText}>Check-in lucrător</Text>
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

  activeStatus: {
    fontSize: 16,
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