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
import type { LanguageCode } from "@/i18n/translations";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
import { Spacing } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

const confirmationCopy: Record<
  LanguageCode,
  { reference: string; sent: string }
> = {
  de: { reference: "Bewerbungs-ID", sent: "Gesendet" },
  en: { reference: "Application ID", sent: "Submitted" },
  ro: { reference: "ID aplicare", sent: "Trimisă" },
};

export default function ApplicationSentScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const copy = confirmationCopy[language];
  const params = useLocalSearchParams<{
    applicationId?: string | string[];
    jobId?: string | string[];
  }>();
  const applicationId = readParam(params.applicationId);
  const jobId = readParam(params.jobId);
  const nextSteps: DefinitionListItem[] = [
    { label: "1", value: t("applicationSent.item1") },
    { label: "2", value: t("applicationSent.item2") },
    { label: "3", value: t("applicationSent.item3") },
  ];

  if (applicationId) {
    nextSteps.push({ label: copy.reference, value: applicationId });
  }

  return (
    <RequireAuth>
      <PageContainer contentStyle={styles.content} maxWidth="form" scroll>
        <PageHeader
          actions={<StatusBadge label={copy.sent} status="submitted" />}
          description={t("applicationSent.subtitle")}
          title={t("applicationSent.title")}
        />
        <Section title={t("applicationSent.cardTitle")}>
          <DefinitionList items={nextSteps} />
        </Section>
        <View style={styles.actions}>
          <RabAIButton
            onPress={() => router.replace("/profile")}
            title={t("common.profile")}
          />
          {jobId ? (
            <RabAIButton
              onPress={() =>
                router.replace(buildJobDetailsPath(jobId, "/profile") as never)
              }
              title={t("common.backToJob")}
              variant="secondary"
            />
          ) : null}
        </View>
      </PageContainer>
    </RequireAuth>
  );
}

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
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
