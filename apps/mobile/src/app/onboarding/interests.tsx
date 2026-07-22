import RequireAuth from "@/components/RequireAuth";
import { EmptyState, PageContainer, PageHeader } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useRouter } from "expo-router";

type InterestsUnavailableCopy = {
  action: string;
  description: string;
  subtitle: string;
  title: string;
};

const unavailableCopy = {
  ro: {
    action: "Înapoi la profil",
    description:
      "Serviciul de profil nu salvează încă interesele profesionale. RabAI nu va simula o selecție care nu poate fi păstrată.",
    subtitle:
      "Interesele vor putea fi editate după conectarea lor la serviciul de profil.",
    title: "Editarea intereselor nu este disponibilă încă",
  },
  en: {
    action: "Back to profile",
    description:
      "The profile service does not save professional interests yet. RabAI will not simulate a selection that cannot be retained.",
    subtitle:
      "Interests can be edited after they are connected to the profile service.",
    title: "Interest editing is not available yet",
  },
  de: {
    action: "Zurück zum Profil",
    description:
      "Der Profildienst speichert berufliche Interessen noch nicht. RabAI simuliert keine Auswahl, die nicht erhalten werden kann.",
    subtitle:
      "Interessen können bearbeitet werden, sobald sie mit dem Profildienst verbunden sind.",
    title: "Interessen können noch nicht bearbeitet werden",
  },
} satisfies Record<LanguageCode, InterestsUnavailableCopy>;

export default function InterestsOnboardingScreen() {
  return (
    <RequireAuth>
      <InterestsOnboardingContent />
    </RequireAuth>
  );
}

function InterestsOnboardingContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const copy = unavailableCopy[language];

  return (
    <PageContainer maxWidth="form" scroll>
      <PageHeader
        backLabel={t("common.back")}
        description={copy.subtitle}
        onBack={() => router.replace("/profile" as never)}
        title={copy.title}
      />
      <EmptyState
        actionLabel={copy.action}
        description={copy.description}
        onAction={() => router.replace("/profile" as never)}
        title={copy.title}
      />
    </PageContainer>
  );
}
