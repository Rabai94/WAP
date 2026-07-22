import RequireAuth from "@/components/RequireAuth";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Spacing } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function TaskCreateScreen() {
  return (
    <RequireAuth>
      <TaskCreateContent />
    </RequireAuth>
  );
}

function TaskCreateContent() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <PageContainer contentStyle={styles.content} maxWidth="form" scroll>
      <PageHeader
        backLabel={t("common.back")}
        description={t("tasks.createSubtitle")}
        onBack={() => router.replace("/tasks")}
        title={t("tasks.createTitle")}
      />
      <EmptyState
        description={t("tasks.preparedText")}
        title={t("tasks.preparedTitle")}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
});
