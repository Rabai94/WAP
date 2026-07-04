import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WAP</Text>

      <Text style={styles.subtitle}>Your Career Starts Here</Text>

      <View style={styles.card}>
        <Text style={styles.item}>✓ Jobs</Text>
        <Text style={styles.item}>✓ Career</Text>
        <Text style={styles.item}>✓ Services</Text>
        <Text style={styles.item}>✓ Business</Text>
        <Text style={styles.item}>✓ Wapy AI</Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("BUTON APASAT");
          console.log("MERGEM LA ROLE");
          router.replace("/role" as any);
        }}
      >
        <Text style={styles.buttonText}>Începe</Text>
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
    fontSize: 36,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    marginBottom: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },

  item: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 6,
  },

  button: {
    backgroundColor: "#8B5A24",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});