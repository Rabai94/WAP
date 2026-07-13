import RequireAuth from "@/components/RequireAuth";
import { mockBusinessProfile } from "@/domain/profile";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, Header, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const profile = mockBusinessProfile;
  const hiringNeeds = profile.hiringNeeds.roles.map(t).join(", ");
  const verificationStatus = t(
    `profile.verification.${profile.verificationStatus}`
  );
  const recommendedNextStep =
    profile.verificationStatus === "verified"
      ? t("profile.next.businessJob")
      : t("profile.next.businessVerification");

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <RequireAuth requiredRole="business">
      <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/engine" as any)} style={styles.homeButton}>
          <Text style={styles.homeButtonText}>{t("common.home")}</Text>
        </Pressable>
      </View>
      <Header
        title={t("businessDashboard.title")}
        subtitle={t("businessDashboard.subtitle")}
      />

      <Card title={t("profile.businessProfileTitle")}>
        <Text style={styles.profileName}>{profile.companyName}</Text>
        <Text style={styles.item}>
          {t("profile.location")}: {profile.location}
        </Text>
        <Text style={styles.item}>
          {t("profile.profileCompletion")}: {profile.profileCompletion}%
        </Text>
        <Text style={styles.item}>
          {t("profile.hiringNeeds")}: {hiringNeeds}
        </Text>
        <Text style={styles.item}>
          {t("profile.verificationStatus")}: {verificationStatus}
        </Text>
        <Text style={styles.item}>
          {t("profile.recommendedNextStep")}: {recommendedNextStep}
        </Text>
      </Card>

      <Card title={t("businessDashboard.jobStatusTitle")}>
        <Text style={styles.item}>✓ {t("businessDashboard.jobStatusPublished")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.jobStatusApplicants")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.jobStatusNext")}</Text>
      </Card>

      <Card title={t("common.nextSteps")}>
        <Text style={styles.item}>✓ {t("businessDashboard.item1")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item2")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item3")}</Text>
        <Text style={styles.item}>✓ {t("businessDashboard.item4")}</Text>
      </Card>

      <Card title={t("businessDashboard.jobsTitle")}>
        <Text style={styles.emptyText}>{t("businessDashboard.empty")}</Text>
      </Card>

      <Button
        title={t("businessDashboard.createJob")}
        onPress={() => {
          console.log("MERGEM LA CREARE JOB");
          router.push("/create-job" as any);
        }}
      />

      <Button
        title={t("businessDashboard.viewApplications")}
        variant="secondary"
        style={styles.secondaryButton}
        onPress={() => {
          console.log("MERGEM LA APLICARI");
          router.push("/applications" as any);
        }}
      />

      <Button
        title={`${t("businessDashboard.editCompanyProfile")} · ${t("common.soon")}`}
        variant="secondary"
        disabled
        style={styles.editButton}
      />

        <Button
          title={t("common.logout")}
          variant="ghost"
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  homeButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  homeButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
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

  secondaryButton: {
    marginTop: Spacing.xl,
  },

  editButton: {
    marginTop: Spacing.xxl,
  },

  logoutButton: {
    marginTop: Spacing.xl,
  },
});
