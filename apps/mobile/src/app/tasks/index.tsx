import PublicHeader from "@/components/navigation/PublicHeader";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Spacing } from "@/theme";
import { StyleSheet } from "react-native";

export default function TasksScreen() {
  const { t } = useLanguage();
  const { loading: authLoading, session } = useAuth();

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      {!authLoading && !session ? <PublicHeader active="tasks" /> : null}
      <PageHeader description={t("tasks.subtitle")} title={t("tasks.title")} />
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
