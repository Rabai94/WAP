import RequireAuth from "@/components/RequireAuth";
import {
  EmptyState,
  DefinitionList,
  ErrorState,
  IdentityHeader,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIBadge,
  RabAIButton,
  Section,
  type DefinitionListItem,
} from "@/components/ui";
import type { PersonalInterest } from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnWorkerProfile,
  type WorkerProfile,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function UnifiedProfileScreen() {
  return (
    <RequireAuth>
      <UnifiedProfileContent />
    </RequireAuth>
  );
}

function UnifiedProfileContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = user?.id;
  const missingValue = t("profileUnified.missing");
  const nameParts = useMemo(() => splitName(user?.fullName), [user?.fullName]);
  const profileName = getProfileName(profile, user?.fullName, user?.email);
  const interests = user?.interests ?? [];
  const languages = formatLanguages(
    profile?.preferred_language,
    user?.languages,
    user?.language,
    t
  );

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextProfile = await fetchOwnWorkerProfile(userId);
      setProfile(nextProfile);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("profileUnified.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadProfile]);

  const identityItems: DefinitionListItem[] = [
    {
      label: t("profileUnified.firstName"),
      value: profile?.first_name ?? nameParts.firstName ?? missingValue,
    },
    {
      label: t("profileUnified.lastName"),
      value: profile?.last_name ?? nameParts.lastName ?? missingValue,
    },
    {
      label: t("common.location"),
      value: formatWorkerLocation(profile) ?? user?.location ?? missingValue,
    },
    {
      label: t("profileUnified.nationality"),
      value: user?.nationality ?? missingValue,
    },
    {
      label: t("profileUnified.languages"),
      value: languages || missingValue,
    },
    {
      label: t("profileUnified.accountType"),
      value: t("accountType.personal.title"),
    },
  ];
  const professionalItems: DefinitionListItem[] = [
    {
      label: t("profileUnified.occupation"),
      value: profile?.occupation
        ? localizedName(profile.occupation, language)
        : missingValue,
    },
    {
      label: t("profileUnified.workExperience"),
      value: profile
        ? t("profileUnified.years").replace(
            "{count}",
            String(profile.experience_years)
          )
        : user?.experience ?? missingValue,
    },
    {
      label: t("profileUnified.education"),
      value: user?.education ?? missingValue,
    },
    {
      label: t("profileUnified.skills"),
      value: user?.skills ?? missingValue,
    },
    {
      label: t("profileUnified.qualifications"),
      value: user?.qualifications ?? missingValue,
    },
    {
      label: t("profileUnified.availability"),
      value: profile
        ? formatAvailability(profile.availability_status, t)
        : user?.availability ?? missingValue,
    },
    {
      label: t("profileUnified.jobPreferences"),
      value:
        user?.preferredWorkType ??
        (profile?.occupation
          ? localizedName(profile.occupation, language)
          : missingValue),
    },
    {
      label: t("profileUnified.servicePreferences"),
      value: user?.servicePreferences ?? missingValue,
    },
  ];

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
        actions={
          <RabAIButton
            onPress={() => router.push("/profile/edit" as never)}
            title={t("profileUnified.action.editProfile")}
          />
        }
        description={t("profileUnified.subtitle")}
        title={t("profileUnified.title")}
      />

      {loading ? (
        <LoadingState title={t("profileUnified.loading")} />
      ) : error ? (
        <ErrorState
          description={error}
          onRetry={() => void loadProfile()}
          retryLabel={getRetryLabel(language)}
          title={t("profileUnified.loadError")}
        />
      ) : (
        <>
          <IdentityHeader
            avatar={
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
              </View>
            }
            badges={
              <RabAIBadge
                label={t("accountType.personal.title")}
                tone="neutral"
              />
            }
            compact
            eyebrow={t("profileUnified.summaryTitle")}
            meta={
              <View style={styles.identityMeta}>
                <Text style={styles.profileMeta}>{user?.email ?? missingValue}</Text>
                <Text style={styles.profileMeta}>
                  {profile?.phone ?? user?.phone ?? missingValue}
                </Text>
              </View>
            }
            subtitle={
              profile?.occupation
                ? localizedName(profile.occupation, language)
                : formatWorkerLocation(profile) ?? user?.location ?? undefined
            }
            title={profileName}
          />

          <Section title={t("profileUnified.summaryTitle")}>
            <DefinitionList columns={2} items={identityItems} />
          </Section>

          <Section title={t("profileUnified.currentInterestsTitle")}>
          {interests.length > 0 ? (
            <>
              <View style={styles.chipRow}>
                {interests.map((interest) => (
                  <RabAIBadge
                    key={interest}
                    label={interestLabel(interest, t)}
                    tone="neutral"
                  />
                ))}
              </View>
              <RabAIButton
                onPress={() => router.push("/onboarding/interests" as any)}
                size="sm"
                style={styles.cardButton}
                title={t("profileUnified.chooseInterests")}
                variant="secondary"
              />
            </>
          ) : (
            <EmptyState
              actionLabel={t("profileUnified.chooseInterests")}
              compact
              onAction={() => router.push("/onboarding/interests" as any)}
              title={t("profileUnified.noInterests")}
            />
          )}
          </Section>

          <Section title={t("profileUnified.aboutTitle")}>
          {profile?.professional_summary ? (
              <Text selectable style={styles.summaryText}>{profile.professional_summary}</Text>
          ) : (
            <EmptyState compact title={t("profileUnified.summaryMissing")} />
          )}
          </Section>

          <Section title={t("profileUnified.professionalTitle")}>
            <DefinitionList columns={2} items={professionalItems} />
          </Section>

          <Section title={t("profileUnified.verificationTitle")}>
            <Text style={styles.mutedText}>{t("profileUnified.verificationNote")}</Text>
            <RabAIButton
              onPress={() => router.push("/profile/verification" as never)}
              size="sm"
              style={styles.cardButton}
              title={t("profileUnified.openVerification")}
              variant="secondary"
            />
          </Section>

          <Section title={t("profileUnified.quickActions")}>
          <View style={styles.actionGrid}>
            <ProfileAction label={t("profileUnified.action.viewJobs")} onPress={() => router.push("/jobs" as any)} />
            <ProfileAction label={t("profileUnified.action.viewTasks")} onPress={() => router.push("/tasks" as any)} />
            <ProfileAction label={t("profileUnified.action.verification")} onPress={() => router.push("/profile/verification" as any)} />
          </View>
          </Section>
        </>
      )}
    </PageContainer>
  );
}

function ProfileAction({
  disabled = false,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <RabAIButton
      disabled={disabled}
      onPress={onPress}
      size="sm"
      style={styles.actionButton}
      title={label}
      variant="outline"
    />
  );
}

function interestLabel(interest: PersonalInterest, t: (key: string) => string) {
  return t(`interest.${interest}`);
}

function localizedName(
  row: { name_ro: string; name_de: string; name_en: string },
  language: string
) {
  if (language === "de") {
    return row.name_de;
  }

  if (language === "en") {
    return row.name_en;
  }

  return row.name_ro;
}

function formatWorkerLocation(profile: WorkerProfile | null) {
  if (!profile) {
    return null;
  }

  if (profile.location) {
    const district = profile.location.district
      ? `-${profile.location.district}`
      : "";

    return `${profile.location.postal_code} ${profile.location.city}${district}, ${profile.location.state}`;
  }

  return [profile.postal_code, profile.city].filter(Boolean).join(" ") || null;
}

function formatAvailability(value: string, t: (key: string) => string) {
  return t(`profileUnified.availability.${value}`);
}

function splitName(fullName?: string) {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

function getProfileName(
  profile: WorkerProfile | null,
  fullName?: string,
  email?: string | null
) {
  if (profile) {
    return `${profile.first_name} ${profile.last_name}`.trim();
  }

  return fullName?.trim() || email || "RabAI";
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "R";
  }

  return parts
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatLanguages(
  preferredLanguage: string | undefined,
  languages: string[] | undefined,
  language: string | undefined,
  t: (key: string) => string
) {
  const values = [
    ...(preferredLanguage ? [preferredLanguage] : []),
    ...(languages ?? []),
    ...(language ? [language] : []),
  ];
  const uniqueValues = [...new Set(values.map((value) => value.trim()))].filter(
    Boolean
  );

  return uniqueValues
    .map((value) => t(`profile.language.${value}`))
    .join(", ");
}

function getRetryLabel(language: string) {
  if (language === "de") {
    return "Erneut versuchen";
  }

  if (language === "en") {
    return "Try again";
  }

  return "Reîncearcă";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.pill,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
  },
  identityMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
  },
  profileMeta: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  summaryText: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  cardButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.component,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  actionButton: {
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
  },
});
