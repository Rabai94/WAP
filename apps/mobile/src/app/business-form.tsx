import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function BusinessFormScreen() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [workType, setWorkType] = useState("");
  const [workersNeeded, setWorkersNeeded] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date firmă</Text>

      <Text style={styles.subtitle}>
        Completează informațiile de bază pentru firma ta.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nume firmă</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: WAP Logistics GmbH"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Text style={styles.label}>Oraș</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Augsburg"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Tip muncă oferită</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: depozit, livrări, curățenie"
          value={workType}
          onChangeText={setWorkType}
        />

        <Text style={styles.label}>Câți oameni caută?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3"
          value={workersNeeded}
          onChangeText={setWorkersNeeded}
          keyboardType="number-pad"
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          console.log("FORMULAR FIRMA:");
          console.log("Firma:", companyName);
          console.log("Oras:", city);
          console.log("Munca:", workType);
          console.log("Oameni cautati:", workersNeeded);

          router.replace("/business-dashboard" as any);
        }}
      >
        <Text style={styles.buttonText}>Salvează firma</Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/business" as any);
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

  form: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
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