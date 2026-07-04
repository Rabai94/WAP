import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function JobsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Joburi disponibile</Text>

      <Text style={styles.subtitle}>
        Aici lucrătorul va vedea joburile publicate de firme.
      </Text>

      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>Lucrător depozit</Text>
        <Text style={styles.jobInfo}>📍 Augsburg</Text>
        <Text style={styles.jobInfo}>💶 15 €/oră</Text>
        <Text style={styles.jobInfo}>👥 4 oameni căutați</Text>

        <Text style={styles.jobDescription}>
          Sortare pachete, muncă în depozit, program flexibil.
        </Text>

        <Pressable
          style={styles.applyButton}
          onPress={() => {
            console.log("APLICA LA JOB: Lucrător depozit");
            router.replace("/application-sent" as any);
          }}
        >
          <Text style={styles.applyButtonText}>Aplică</Text>
        </Pressable>
      </View>

      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>Curățenie birouri</Text>
        <Text style={styles.jobInfo}>📍 München</Text>
        <Text style={styles.jobInfo}>💶 14 €/oră</Text>
        <Text style={styles.jobInfo}>👥 2 oameni căutați</Text>

        <Text style={styles.jobDescription}>
          Curățenie în birouri, seara, contract legal prin aplicație.
        </Text>

        <Pressable
          style={styles.applyButton}
          onPress={() => {
            console.log("APLICA LA JOB: Curățenie birouri");
            router.replace("/application-sent" as any);
          }}
        >
          <Text style={styles.applyButtonText}>Aplică</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.backButton}
        onPress={() => {
          router.replace("/worker-dashboard" as any);
        }}
      >
        <Text style={styles.backText}>Înapoi la dashboard</Text>
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

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  jobTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 10,
  },

  jobInfo: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },

  jobDescription: {
    fontSize: 15,
    color: "#555555",
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 14,
  },

  applyButton: {
    backgroundColor: "#8B5A24",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  backButton: {
    marginTop: 8,
    alignItems: "center",
    padding: 12,
  },

  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5A24",
  },
});