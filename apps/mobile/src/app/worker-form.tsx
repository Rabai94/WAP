import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function WorkerFormScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [workType, setWorkType] = useState("");
  const [availability, setAvailability] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date lucrător</Text>

      <Text style={styles.subtitle}>
        Completează informațiile de bază pentru profilul tău.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nume</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mihai Popescu"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Oraș</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Augsburg"
          value={city}
          onChangeText={setCity}
        />

        <Text style={styles.label}>Ce muncă cauți?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: depozit, curățenie, livrări"
          value={workType}
          onChangeText={setWorkType}
        />

        <Text style={styles.label}>Disponibilitate</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: luni-vineri, weekend, seara"
          value={availability}
          onChangeText={setAvailability}
        />
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
           console.log("FORMULAR LUCRATOR:");
           console.log("Nume:", name);
           console.log("Oras:", city);
           console.log("Munca:", workType);
           console.log("Disponibilitate:", availability);

          router.replace("/worker-dashboard" as any);
          }}
          >
         <Text style={styles.buttonText}>Salvează profilul</Text>
       </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/worker" as any);
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