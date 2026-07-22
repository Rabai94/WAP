import RequireAuth from "@/components/RequireAuth";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Spacing } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";

export default function ServiceCreateScreen() {
  return (
    <RequireAuth>
      <ServiceCreateContent />
    </RequireAuth>
  );
}

function ServiceCreateContent() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <PageContainer contentStyle={styles.content} maxWidth="form" scroll>
      <PageHeader
        backLabel={t("common.back")}
        description={t("services.createSubtitle")}
        onBack={() => router.replace("/services")}
        title={t("services.createTitle")}
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
