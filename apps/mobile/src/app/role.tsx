import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function RoleScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alege rolul</Text>

      <Text style={styles.subtitle}>
        Spune-ne cum vrei să folosești WAP.
      </Text>

      <Pressable
        style={styles.card}
        onPress={() => {
          console.log("MERGEM LA LUCRATOR");
          router.replace("/worker" as any);
        }}
      >
        <Text style={styles.cardIcon}>👷</Text>
        <Text style={styles.cardTitle}>Sunt lucrător</Text>
        <Text style={styles.cardText}>
          Caut joburi, muncă pe ore, contracte legale și plată sigură.
        </Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          console.log("MERGEM LA FIRMA");
          router.replace("/business" as any);
        }}
      >
        <Text style={styles.cardIcon}>🏢</Text>
        <Text style={styles.cardTitle}>Sunt firmă</Text>
        <Text style={styles.cardText}>
          Caut oameni verificați pentru muncă rapidă, legală și organizată.
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
    marginBottom: 16,
  },

  cardIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 23,
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