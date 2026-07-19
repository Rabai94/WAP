import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function ServiceCreateScreen() {
  return (
    <RequireAuth>
      <ServiceCreateContent />
    </RequireAuth>
  );
}

function ServiceCreateContent() {
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
        <Header
          title={t("services.createTitle")}
          subtitle={t("services.createSubtitle")}
        />

        <Card title={t("services.preparedTitle")} variant="warning">
          <Text style={styles.bodyText}>{t("services.preparedText")}</Text>
        </Card>

        <Card title={t("services.offerDetails")}>
          <Input
            editable={false}
            label={t("services.fieldTitle")}
            placeholder={t("services.fieldTitlePlaceholder")}
            value=""
          />
          <Input
            editable={false}
            label={t("services.fieldCategory")}
            placeholder={t("services.fieldCategoryPlaceholder")}
            value=""
          />
          <Input
            editable={false}
            label={t("services.fieldDescription")}
            multiline
            placeholder={t("services.fieldDescriptionPlaceholder")}
            style={styles.bigInput}
            value=""
          />
        </Card>

        <Button
          disabled
          title={t("services.publishDisabled")}
          onPress={() => undefined}
        />
        <Button
          title={t("common.back")}
          variant="ghost"
          onPress={() => router.replace("/services" as any)}
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
