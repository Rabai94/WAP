import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import {
  getVerificationActions,
  type VerificationLevel,
  type VerificationStatus,
} from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const levels: {
  level: VerificationLevel;
  status: VerificationStatus;
  titleKey: string;
  textKey: string;
}[] = [
  {
    level: 0,
    status: "verified",
    titleKey: "verification.level0.title",
    textKey: "verification.level0.text",
  },
  {
    level: 1,
    status: "not_started",
    titleKey: "verification.level1.title",
    textKey: "verification.level1.text",
  },
  {
    level: 2,
    status: "not_started",
    titleKey: "verification.level2.title",
    textKey: "verification.level2.text",
  },
  {
    level: 3,
    status: "not_started",
    titleKey: "verification.level3.title",
    textKey: "verification.level3.text",
  },
  {
    level: 4,
    status: "required_for_action",
    titleKey: "verification.level4.title",
    textKey: "verification.level4.text",
  },
];

const verificationActions = getVerificationActions();

export default function ProfileVerificationScreen() {
  return (
    <RequireAuth>
      <ProfileVerificationContent />
    </RequireAuth>
  );
}

function ProfileVerificationContent() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title={t("verification.title")} subtitle={t("verification.subtitle")} />

        <Card title={t("verification.actionBasedTitle")}>
          <Text style={styles.text}>{t("verification.actionBasedText")}</Text>
          <Text style={styles.text}>{t("verification.noKycClaim")}</Text>
        </Card>

        <Card title={t("verification.actionsTitle")}>
          <View style={styles.actionGrid}>
            {verificationActions.map((item) => (
              <View key={item.actionKey} style={styles.actionCard}>
                <Text style={styles.actionTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.actionText}>{t(item.descriptionKey)}</Text>
                <View style={styles.requirementList}>
                  {item.requirements.map((requirement) => (
                    <View key={requirement.id} style={styles.requirementItem}>
                      <Text style={styles.requirementTitle}>
                        {t(requirement.titleKey)}
                      </Text>
                      <Text style={styles.requirementText}>
                        {t(requirement.descriptionKey)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {levels.map((item) => (
          <Card key={item.level} title={t(item.titleKey)}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelNumber}>
                {t("verification.levelLabel").replace("{level}", String(item.level))}
              </Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{statusLabel(item.status, t)}</Text>
              </View>
            </View>
            <Text style={styles.text}>{t(item.textKey)}</Text>
          </Card>
        ))}

        <Button
          title={t("verification.backToProfile")}
          variant="secondary"
          onPress={() => router.replace("/profile" as any)}
        />
      </ScrollView>
    </Screen>
  );
}

function statusLabel(status: VerificationStatus, t: (key: string) => string) {
  return t(`verification.status.${status}`);
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    maxWidth: 960,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  text: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.sm,
  },
  levelHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  levelNumber: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statusPill: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusText: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actionGrid: {
    gap: Spacing.md,
  },
  actionCard: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  actionTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.xs,
  },
  actionText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },
  requirementList: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  requirementItem: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  requirementTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  requirementText: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.xs,
  },
});
