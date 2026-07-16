import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import type { PersonalInterest } from "@/domain/account";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnWorkerProfile,
  type WorkerProfile,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function UnifiedProfileScreen() {
  return (
    <RequireAuth>
      <UnifiedProfileContent />
    </RequireAuth>
  );
}

function UnifiedProfileContent() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
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
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: responsive.isMobile ? Spacing.sm : Spacing.md,
            maxWidth: responsive.contentMaxWidth,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AuthenticatedHeader active="profile" />

        <Header
          title={t("profileUnified.title")}
          subtitle={t("profileUnified.subtitle")}
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>{t("profileUnified.loading")}</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Card title={t("profileUnified.summaryTitle")}>
          <View style={styles.summaryHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profileName)}</Text>
            </View>
            <View>
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
        </Card>

        <Card title={t("profileUnified.currentInterestsTitle")}>
          {interests.length > 0 ? (
            <View style={styles.chipRow}>
              {interests.map((interest) => (
                <Chip key={interest} label={interestLabel(interest, t)} />
              ))}
            </View>
          ) : (
            <Text style={styles.mutedText}>{t("profileUnified.noInterests")}</Text>
          )}
          <Button
            title={t("profileUnified.chooseInterests")}
            variant="secondary"
            style={styles.cardButton}
            onPress={() => router.push("/onboarding/interests" as any)}
          />
        </Card>

        <Card title={t("profileUnified.aboutTitle")}>
          {profile?.professional_summary ? (
            <Text style={styles.summaryText}>{profile.professional_summary}</Text>
          ) : (
            <Text style={styles.mutedText}>{t("profileUnified.summaryMissing")}</Text>
          )}
        </Card>

        <Card title={t("profileUnified.professionalTitle")}>
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
        </Card>

        <Card title={t("profileUnified.verificationTitle")}>
          <View style={styles.infoGrid}>
            <InfoItem label={t("verification.level0.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level1.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level2.short")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level3.title")} value={t("verification.status.notStarted")} />
            <InfoItem label={t("verification.level4.title")} value={t("verification.status.notStarted")} />
          </View>
          <Text style={styles.mutedText}>{t("profileUnified.verificationNote")}</Text>
          <Button
            title={t("profileUnified.openVerification")}
            variant="secondary"
            style={styles.cardButton}
            onPress={() => router.push("/profile/verification" as any)}
          />
        </Card>

        <Card title={t("profileUnified.digitalVaultTitle")}>
          <Text style={styles.mutedText}>{t("profileUnified.digitalVaultText")}</Text>
          <View style={styles.vaultGrid}>
            {vaultItems.map((item) => (
              <View key={item.label} style={styles.vaultItem}>
                <Text style={styles.vaultLabel}>{item.label}</Text>
                <Text style={styles.vaultStatus}>{item.status}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card title={t("profileUnified.quickActions")}>
          <View style={styles.actionGrid}>
            <ActionButton label={t("profileUnified.action.viewJobs")} onPress={() => router.push("/jobs" as any)} />
            <ActionButton label={t("profileUnified.action.viewTasks")} onPress={() => router.push("/tasks" as any)} />
            <ActionButton disabled label={t("profileUnified.action.offerServices")} onPress={() => router.push("/services/create" as any)} />
            <ActionButton label={t("profileUnified.action.editProfile")} onPress={() => router.push("/profile/edit" as any)} />
            <ActionButton label={t("profileUnified.action.verification")} onPress={() => router.push("/profile/verification" as any)} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
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

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.round,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarText: {
    color: Colors.brandOn,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  profileName: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  profileMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    marginTop: Spacing.xs,
  },
  statusPill: {
    backgroundColor: "#E8F8F2",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  statusPillText: {
    color: Colors.success,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  infoItem: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.lg,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: "#EAF1FF",
    borderColor: "#BFD2FF",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipText: {
    color: "#145CFF",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  cardButton: {
    marginTop: Spacing.lg,
  },
  vaultGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  vaultItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  vaultLabel: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.xs,
  },
  vaultStatus: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionButtonText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
});
