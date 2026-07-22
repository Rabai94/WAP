import PublicHeader from "@/components/navigation/PublicHeader";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Spacing } from "@/theme";
import { StyleSheet } from "react-native";

export default function ServicesScreen() {
  const { t } = useLanguage();
  const { loading: authLoading, session } = useAuth();

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      {!authLoading && !session ? <PublicHeader active="services" /> : null}
      <PageHeader
        description={t("services.subtitle")}
        title={t("services.title")}
      />
      <EmptyState
        description={t("services.preparedText")}
        title={t("services.preparedTitle")}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
});
