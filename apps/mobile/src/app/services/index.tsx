import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ServicesScreen() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const { session } = useAuth();

  return (
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: responsive.isMobile ? Spacing.sm : Spacing.md,
            maxWidth: responsive.isWide ? 1120 : responsive.contentMaxWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {session ? <AuthenticatedHeader active="services" /> : null}

        <Header title={t("services.title")} subtitle={t("services.subtitle")} />

        <Card title={t("services.emptyTitle")}>
          <Text style={styles.bodyText}>{t("services.emptyText")}</Text>
          <View
            style={[
              styles.actions,
              !responsive.isMobile && styles.actionsWide,
            ]}
          >
            <Button
              title={t("services.createAction")}
              onPress={() =>
                router.push(
                  (session
                    ? "/services/create"
                    : buildLoginPath("/services/create")) as any
                )
              }
            />
            {!session ? (
              <Button
                title={t("common.login")}
                variant="secondary"
                onPress={() => router.push("/login" as any)}
              />
            ) : null}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionsWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
