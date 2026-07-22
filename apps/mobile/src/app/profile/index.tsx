import RequireAuth from "@/components/RequireAuth";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
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
  const vaultItems = useMemo(
    () => [
      {
        label: t("profileUnified.vault.id"),
        status: t("profileUnified.status.toUpload"),
      },
      {
        label: t("profileUnified.vault.iban"),
        status: t("profileUnified.status.toComplete"),
      },
      {
        label: t("profileUnified.vault.drivingLicense"),
        status: t("profileUnified.status.optional"),
      },
      {
        label: t("profileUnified.vault.workPermit"),
        status: profile
          ? formatWorkAuthorization(profile.work_authorization_status, t)
          : t("profileUnified.status.toComplete"),
      },
      {
        label: t("profileUnified.vault.forkliftCertificate"),
        status: t("profileUnified.status.optional"),
      },
      {
        label: t("profileUnified.vault.certificates"),
        status: t("profileUnified.status.toUpload"),
      },
      {
        label: t("profileUnified.vault.contracts"),
        status: t("profileUnified.status.comingSoon"),
      },
    ],
    [profile, t]
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

  return (
    <PageContainer contentStyle={styles.content} maxWidth="content" scroll>
      <PageHeader
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
        <RabAICard title={t("profileUnified.summaryTitle")}>
          <View style={styles.summaryHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.profileName}>{profileName}</Text>
              <Text style={styles.profileMeta}>{user?.email ?? missingValue}</Text>
              <Text style={styles.profileMeta}>
                {profile?.phone ?? user?.phone ?? missingValue}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {t("accountType.personal.title")}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem
              label={t("profileUnified.firstName")}
              value={profile?.first_name ?? nameParts.firstName ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.lastName")}
              value={profile?.last_name ?? nameParts.lastName ?? missingValue}
            />
            <InfoItem
              label={t("common.location")}
              value={formatWorkerLocation(profile) ?? user?.location ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.nationality")}
              value={user?.nationality ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.languages")}
              value={languages || missingValue}
            />
            <InfoItem
              label={t("profileUnified.accountType")}
              value={t("accountType.personal.title")}
            />
            <InfoItem
              label={t("profileUnified.verificationLevel")}
              value={`${t("verification.level0.short")} - ${missingValue}`}
            />
          </View>
        </RabAICard>

        <RabAICard title={t("profileUnified.currentInterestsTitle")}>
          {interests.length > 0 ? (
            <>
              <View style={styles.chipRow}>
                {interests.map((interest) => (
                  <Chip key={interest} label={interestLabel(interest, t)} />
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
        </RabAICard>

        <RabAICard title={t("profileUnified.aboutTitle")}>
          {profile?.professional_summary ? (
            <Text style={styles.summaryText}>{profile.professional_summary}</Text>
          ) : (
            <EmptyState compact title={t("profileUnified.summaryMissing")} />
          )}
        </RabAICard>

        <RabAICard title={t("profileUnified.professionalTitle")}>
          <View style={styles.infoGrid}>
            <InfoItem
              label={t("profileUnified.occupation")}
              value={
                profile?.occupation
                  ? localizedName(profile.occupation, language)
                  : missingValue
              }
            />
            <InfoItem
              label={t("profileUnified.workExperience")}
              value={
                profile
                  ? t("profileUnified.years").replace(
                      "{count}",
                      String(profile.experience_years)
                    )
                  : user?.experience ?? missingValue
              }
            />
            <InfoItem
              label={t("profileUnified.education")}
              value={user?.education ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.skills")}
              value={user?.skills ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.qualifications")}
              value={user?.qualifications ?? missingValue}
            />
            <InfoItem
              label={t("profileUnified.availability")}
              value={
                profile
                  ? formatAvailability(profile.availability_status, t)
                  : user?.availability ?? missingValue
              }
            />
            <InfoItem
              label={t("profileUnified.jobPreferences")}
              value={
                user?.preferredWorkType ??
                (profile?.occupation
                  ? localizedName(profile.occupation, language)
                  : missingValue)
              }
            />
            <InfoItem
              label={t("profileUnified.servicePreferences")}
              value={user?.servicePreferences ?? missingValue}
            />
          </View>
        </RabAICard>

        <RabAICard title={t("profileUnified.verificationTitle")}>
          <View style={styles.infoGrid}>
            <InfoItem label={t("verification.level0.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level1.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level2.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level3.title")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level4.title")} value={t("verification.status.notStarted")} />
          </View>
          <Text style={styles.mutedText}>{t("profileUnified.verificationNote")}</Text>
          <RabAIButton
            onPress={() => router.push("/profile/verification" as any)}
            size="sm"
            style={styles.cardButton}
            title={t("profileUnified.openVerification")}
            variant="secondary"
          />
        </RabAICard>

        <RabAICard title={t("profileUnified.digitalVaultTitle")}>
          <Text style={styles.mutedText}>{t("profileUnified.digitalVaultText")}</Text>
          <View style={styles.vaultGrid}>
            {vaultItems.map((item) => (
              <View key={item.label} style={styles.vaultItem}>
                <Text style={styles.vaultLabel}>{item.label}</Text>
                <Text style={styles.vaultStatus}>{item.status}</Text>
              </View>
            ))}
          </View>
        </RabAICard>

        <RabAICard title={t("profileUnified.quickActions")}>
          <View style={styles.actionGrid}>
            <ActionButton label={t("profileUnified.action.viewJobs")} onPress={() => router.push("/jobs" as any)} />
            <ActionButton label={t("profileUnified.action.viewTasks")} onPress={() => router.push("/tasks" as any)} />
            <ActionButton disabled label={t("profileUnified.action.offerServices")} onPress={() => router.push("/services/create" as any)} />
            <ActionButton label={t("profileUnified.action.editProfile")} onPress={() => router.push("/profile/edit" as any)} />
            <ActionButton label={t("profileUnified.action.verification")} onPress={() => router.push("/profile/verification" as any)} />
          </View>
        </RabAICard>
        </>
      )}
    </PageContainer>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function ActionButton({
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

function formatWorkAuthorization(value: string, t: (key: string) => string) {
  return t(`profileUnified.workAuthorization.${value}`);
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
  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.component,
    marginBottom: Spacing.component,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: Colors.onPrimary,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  summaryCopy: {
    flex: 1,
    flexBasis: 160,
    minWidth: 0,
  },
  profileName: {
    color: Colors.textPrimary,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  profileMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginTop: Spacing.compact,
  },
  statusPill: {
    backgroundColor: Colors.successSurface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.inline,
    paddingVertical: Spacing.control,
  },
  statusPillText: {
    color: Colors.success,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  infoItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.control,
    flexBasis: 200,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.inline,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.compact,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  chip: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.informationBorder,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.inline,
    paddingVertical: Spacing.control,
  },
  chipText: {
    color: Colors.primaryPressed,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  cardButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.component,
  },
  vaultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginTop: Spacing.component,
  },
  vaultItem: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.control,
    flexBasis: 200,
    flexGrow: 1,
    minWidth: 0,
    padding: Spacing.inline,
  },
  vaultLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.compact,
  },
  vaultStatus: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
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
