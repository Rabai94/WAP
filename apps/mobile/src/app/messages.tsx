import RequireAuth from "@/components/RequireAuth";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { Spacing } from "@/theme";
import { StyleSheet } from "react-native";

const unavailableCopy: Record<LanguageCode, string> = {
  de: "Der Nachrichtendienst ist in dieser Version noch nicht mit einem aktiven Backend verbunden. RabAI zeigt keine simulierten Unterhaltungen an.",
  en: "Messaging is not connected to an active backend in this version yet. RabAI does not show simulated conversations.",
  ro: "Mesageria nu este conectată încă la un backend activ în această versiune. RabAI nu afișează conversații simulate.",
};

export default function MessagesScreen() {
  return (
    <RequireAuth>
      <MessagesContent />
    </RequireAuth>
  );
}

function MessagesContent() {
  const { language, t } = useLanguage();

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
        description={t("messages.subtitle")}
        title={t("messages.title")}
      />
      <EmptyState
        description={unavailableCopy[language]}
        title={t("messages.emptyTitle")}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
});
