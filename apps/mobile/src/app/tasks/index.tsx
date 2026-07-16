import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import PublicHeader from "@/components/navigation/PublicHeader";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TasksScreen() {
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
        {session ? (
          <AuthenticatedHeader active="tasks" />
        ) : (
          <PublicHeader active="tasks" />
        )}

        <Header title={t("tasks.title")} subtitle={t("tasks.subtitle")} />

        <Card title={t("tasks.emptyTitle")}>
          <Text style={styles.bodyText}>{t("tasks.emptyText")}</Text>
          <View
            style={[
              styles.actions,
              !responsive.isMobile && styles.actionsWide,
            ]}
          >
            <Button
              title={t("tasks.createAction")}
              onPress={() =>
                router.push(
                  (session ? "/tasks/create" : buildLoginPath("/tasks/create")) as any
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
