import RequireAuth from "@/components/RequireAuth";
import {
  DefinitionList,
  PageContainer,
  PageHeader,
  RabAIButton,
  Section,
  StatusBadge,
  type DefinitionListItem,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Spacing } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function JobPublishedScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const nextSteps: DefinitionListItem[] = [
    { label: "1", value: t("jobPublished.item1") },
    { label: "2", value: t("jobPublished.item2") },
    { label: "3", value: t("jobPublished.item3") },
  ];

  return (
    <RequireAuth>
      <PageContainer contentStyle={styles.content} maxWidth="form" scroll>
        <PageHeader
          actions={
            <StatusBadge
              label={t("jobPublished.title")}
              status="completed"
            />
          }
          description={t("jobPublished.subtitle")}
          title={t("jobPublished.title")}
        />
        <Section title={t("jobPublished.cardTitle")}>
          <DefinitionList items={nextSteps} />
        </Section>
        <View style={styles.actions}>
          <RabAIButton
            onPress={() => router.replace("/engine")}
            title={t("common.ok")}
          />
        </View>
      </PageContainer>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
});
