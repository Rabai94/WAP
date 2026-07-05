import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "../i18n/LanguageProvider";

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("role.title")}</Text>

      <Text style={styles.subtitle}>{t("role.subtitle")}</Text>

      <Pressable
        style={styles.card}
        onPress={() => {
          router.push("/worker" as any);
        }}
      >
        <Text style={styles.cardText}>{t("role.worker")}</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => {
          router.push("/business" as any);
        }}
      >
        <Text style={styles.cardText}>{t("role.business")}</Text>
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
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#444444",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
  },
});