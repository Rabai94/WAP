import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import type { PersonalInterest } from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const interestOptions: PersonalInterest[] = [
  "find_jobs",
  "find_tasks",
  "offer_services",
  "request_service",
  "find_courses",
  "explore_only",
];

export default function InterestsOnboardingScreen() {
  return (
    <RequireAuth>
      <InterestsOnboardingContent />
    </RequireAuth>
  );
}

function InterestsOnboardingContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedInterests, setSelectedInterests] = useState<
    PersonalInterest[]
  >([]);

  const selectedCountLabel = useMemo(
    () =>
      t("interests.selectedCount").replace(
        "{count}",
        String(selectedInterests.length)
      ),
    [selectedInterests.length, t]
  );

  function toggleInterest(interest: PersonalInterest) {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      return [...current, interest];
    });
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title={t("interests.title")} subtitle={t("interests.subtitle")} />

        <Card title={t("interests.cardTitle")}>
          <Text style={styles.text}>{t("interests.storageNote")}</Text>
          <View style={styles.optionGrid}>
            {interestOptions.map((interest) => {
              const active = selectedInterests.includes(interest);

              return (
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[styles.optionButton, active && styles.optionButtonActive]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      active && styles.optionTextActive,
                    ]}
                  >
                    {t(`interest.${interest}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.selectedText}>{selectedCountLabel}</Text>
        </Card>

        <Button
          title={t("common.continue")}
          onPress={() => {
            router.replace("/profile" as any);
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    maxWidth: 860,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  text: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.three,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  optionButton: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  optionText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  optionTextActive: {
    color: "#145CFF",
  },
  selectedText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.three,
  },
});
