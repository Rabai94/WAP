import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function TaskCreateScreen() {
  return (
    <RequireAuth>
      <TaskCreateContent />
    </RequireAuth>
  );
}

function TaskCreateContent() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();

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
        <Header title={t("tasks.createTitle")} subtitle={t("tasks.createSubtitle")} />

        <Card title={t("tasks.preparedTitle")} variant="warning">
          <Text style={styles.bodyText}>{t("tasks.preparedText")}</Text>
        </Card>

        <Card title={t("tasks.requestDetails")}>
          <Input
            editable={false}
            label={t("tasks.fieldTitle")}
            placeholder={t("tasks.fieldTitlePlaceholder")}
            value=""
          />
          <Input
            editable={false}
            label={t("common.location")}
            placeholder={t("tasks.fieldLocationPlaceholder")}
            value=""
          />
          <Input
            editable={false}
            label={t("tasks.fieldDescription")}
            multiline
            placeholder={t("tasks.fieldDescriptionPlaceholder")}
            style={styles.bigInput}
            value=""
          />
        </Card>

        <Button
          disabled
          title={t("tasks.publishDisabled")}
          onPress={() => undefined}
        />
        <Button
          title={t("common.back")}
          variant="ghost"
          onPress={() => router.replace("/tasks" as any)}
        />
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
  bigInput: {
    height: 120,
    textAlignVertical: "top",
  },
});
