import { StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { mockWorkerProfile } from "@/domain/profile";
import { Colors, Spacing, Typography } from "@/theme";

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const profile = mockWorkerProfile;
  const profileName = `${profile.firstName} ${profile.lastName}`;
  const mainSkills = profile.skills.slice(0, 3).map(t).join(", ");
  const documentsStatus = getWorkerDocumentsStatus(profile, t);
  const recommendedNextStep =
    profile.profileCompletion < 100
      ? t("profile.next.workerDocuments")
      : t("profile.next.workerJobs");

  return (
    <Screen>
      <Header
        title={t("workerDashboard.title")}
        subtitle={t("workerDashboard.subtitle")}
      />

      <Card title={t("profile.workerProfileTitle")}>
        <Text style={styles.profileName}>{profileName}</Text>
        <Text style={styles.item}>
          {t("profile.location")}: {profile.location}
        </Text>
        <Text style={styles.item}>
          {t("profile.profileCompletion")}: {profile.profileCompletion}%
        </Text>
        <Text style={styles.item}>
          {t("profile.mainSkills")}: {mainSkills}
        </Text>
        <Text style={styles.item}>
          {t("profile.documentsStatus")}: {documentsStatus}
        </Text>
        <Text style={styles.item}>
          {t("profile.recommendedNextStep")}: {recommendedNextStep}
        </Text>
      </Card>

      <Card title={t("common.nextSteps")}>
        <Text style={styles.item}>✓ {t("workerDashboard.item1")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item2")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item3")}</Text>
        <Text style={styles.item}>✓ {t("workerDashboard.item4")}</Text>
      </Card>

      <Card title={t("workerDashboard.jobsTitle")}>
        <Text style={styles.emptyText}>{t("workerDashboard.empty")}</Text>
      </Card>

      <Button
        title={t("workerDashboard.viewJobs")}
        onPress={() => {
          console.log("MERGEM LA JOBURI");
          router.push("/jobs" as any);
        }}
      />

      <Button
        title={t("common.backToForm")}
        variant="ghost"
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push("/worker-form" as any);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileName: {
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  item: {
    fontSize: Typography.body,
    color: Colors.textBody,
    marginBottom: Spacing.md,
  },

  emptyText: {
    fontSize: Typography.body,
    color: Colors.textMuted,
    lineHeight: Typography.lineHeight.subtitle,
  },

  backButton: {
    marginTop: Spacing.xxl,
  },
});

function getWorkerDocumentsStatus(
  profile: typeof mockWorkerProfile,
  t: (key: string) => string
) {
  const statuses = Object.values(profile.documentsStatus);

  if (statuses.every((status) => status === "verified")) {
    return t("profile.documents.ready");
  }

  if (statuses.some((status) => status === "missing")) {
    return t("profile.documents.needsAction");
  }

  return t("profile.documents.inReview");
}
