import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen>
      <Header title={t("role.title")} subtitle={t("role.subtitle")} />

      <Pressable
        onPress={() => {
          router.push("/worker" as any);
        }}
      >
        <Card>
          <Text style={styles.cardText}>{t("role.worker")}</Text>
        </Card>
      </Pressable>

      <Pressable
        onPress={() => {
          router.push("/business" as any);
        }}
      >
        <Card>
          <Text style={styles.cardText}>{t("role.business")}</Text>
        </Card>
      </Pressable>

      <View style={styles.backButton}>
        <Button
          title={t("common.back")}
          variant="secondary"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/" as any);
            }
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardText: {
    fontSize: Typography.roleCard,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    textAlign: "center",
  },
  backButton: {
    marginTop: Spacing.xs,
  },
});
