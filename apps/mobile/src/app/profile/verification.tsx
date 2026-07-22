import RequireAuth from "@/components/RequireAuth";
import {
  EmptyState,
  ListingRow,
  PageContainer,
  PageHeader,
  Section,
} from "@/components/ui";
import { getVerificationActions } from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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
    <PageContainer maxWidth="content" scroll>
      <PageHeader
        backLabel={t("verification.backToProfile")}
        description={t("verification.subtitle")}
        onBack={() => router.replace("/profile" as never)}
        title={t("verification.title")}
      />

      <Section title={t("verification.actionBasedTitle")}>
        <Text style={styles.body}>{t("verification.actionBasedText")}</Text>
        <Text style={styles.supporting}>{t("verification.noKycClaim")}</Text>
      </Section>

      <Section
        description={t("verification.actionsDisclaimer")}
        title={t("verification.actionsTitle")}
      >
        <View style={styles.list}>
          {verificationActions.map((item) => (
            <ListingRow
              description={item.requirements
                .map((requirement) => t(requirement.titleKey))
                .join(" · ")}
              key={item.actionKey}
              subtitle={t(item.descriptionKey)}
              title={t(item.titleKey)}
            />
          ))}
        </View>
      </Section>

      <EmptyState
        description={t("verification.statusUnavailableText")}
        title={t("verification.statusUnavailableTitle")}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  supporting: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.control,
  },
  list: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
});
