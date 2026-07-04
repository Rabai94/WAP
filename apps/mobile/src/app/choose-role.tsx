import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function ChooseRoleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alege rolul</Text>

      <Text style={styles.subtitle}>
        Cum vrei să folosești WAP?
      </Text>

      <Pressable
        style={styles.card}
        onPress={() => {
          console.log("AI ALES WORKER");
        }}
      >
        <Text style={styles.cardTitle}>Sunt lucrător</Text>
        <Text style={styles.cardText}>
          Caut locuri de muncă, joburi scurte sau contracte legale.
        </Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          console.log("AI ALES BUSINESS");
        }}
      >
        <Text style={styles.cardTitle}>Sunt firmă</Text>
        <Text style={styles.cardText}>
          Vreau să găsesc oameni verificați pentru muncă.
        </Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/" as any);
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
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 17,
    color: "#444444",
    marginBottom: 28,
    textAlign: "center",
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },

  backButton: {
    marginTop: 12,
    alignItems: "center",
    padding: 12,
  },

  backText: {
    fontSize: 16,
    color: "#8B5A24",
    fontWeight: "700",
  },
});