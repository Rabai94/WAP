import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function ApplicationsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aplicări primite</Text>

      <Text style={styles.subtitle}>
        Aici firma vede lucrătorii care au aplicat la joburi.
      </Text>

      <View style={styles.applicationCard}>
        <Text style={styles.workerName}>Ion Popescu</Text>

        <Text style={styles.info}>A aplicat la: Lucrător depozit</Text>
        <Text style={styles.info}>Oraș: Augsburg</Text>
        <Text style={styles.info}>Disponibilitate: Weekend și seara</Text>
        <Text style={styles.status}>Status: În așteptare</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.acceptButton}
            onPress={() => {
              console.log("ACCEPTAT: Ion Popescu");
              router.replace("/worker-accepted" as any);
            }}
          >
            <Text style={styles.actionText}>Acceptă</Text>
          </Pressable>

          <Pressable
            style={styles.rejectButton}
            onPress={() => {
              console.log("RESPINS: Ion Popescu");
            }}
          >
            <Text style={styles.actionText}>Respinge</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.applicationCard}>
        <Text style={styles.workerName}>Maria Ionescu</Text>

        <Text style={styles.info}>A aplicat la: Curățenie birouri</Text>
        <Text style={styles.info}>Oraș: München</Text>
        <Text style={styles.info}>Disponibilitate: Luni-vineri seara</Text>
        <Text style={styles.status}>Status: În așteptare</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.acceptButton}
            onPress={() => {
              console.log("ACCEPTAT: Maria Ionescu");
              router.replace("/worker-accepted" as any);
            }}
          >
            <Text style={styles.actionText}>Acceptă</Text>
          </Pressable>

          <Pressable
            style={styles.rejectButton}
            onPress={() => {
              console.log("RESPINS: Maria Ionescu");
            }}
          >
            <Text style={styles.actionText}>Respinge</Text>
          </Pressable>
        </View>
      </View>

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

  applicationCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  workerName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 10,
  },

  info: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },

  status: {
    fontSize: 16,
    color: "#8B5A24",
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#B3261E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  actionText: {
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