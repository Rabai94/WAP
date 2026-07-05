import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AppButton from "../components/AppButton";
import { useLanguage } from "../i18n/LanguageProvider";
import { languages } from "../i18n/translations";

export default function HomeScreen() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.languageRow}>
        {languages.map((item) => (
          <Pressable
            key={item.code}
            style={[
              styles.languageButton,
              language === item.code && styles.activeLanguageButton,
            ]}
            onPress={() => {
              setLanguage(item.code);
            }}
          >
            <Text
              style={[
                styles.languageText,
                language === item.code && styles.activeLanguageText,
              ]}
            >
              {item.code.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.logo}>{t("home.title")}</Text>

      <Text style={styles.title}>{t("home.subtitle")}</Text>

      <Text style={styles.subtitle}>{t("home.description")}</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardText}>{t("home.card.jobs")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>{t("home.card.career")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>{t("home.card.services")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>{t("home.card.business")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>{t("home.card.ai")}</Text>
        </View>
      </View>

      <AppButton
        title={t("home.start")}
        onPress={() => {
          router.push("/role" as any);
        }}
      />
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
  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  languageButton: {
    borderWidth: 1,
    borderColor: "#8B5A24",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  activeLanguageButton: {
    backgroundColor: "#8B5A24",
  },
  languageText: {
    color: "#8B5A24",
    fontWeight: "800",
  },
  activeLanguageText: {
    color: "#FFFFFF",
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#8B5A24",
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#444444",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  grid: {
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D8BC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000000",
  },
});