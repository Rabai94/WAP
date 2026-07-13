import RequireAuth from "@/components/RequireAuth";
import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

function formatLabel(value: string | null | undefined, missingLabel: string) {
  return value && value.trim() ? value.trim() : missingLabel;
}

function getInitials(name?: string | null) {
  const normalized = (name ?? "").trim();

  if (!normalized) {
    return "R";
  }

  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function calculateCompletion(user: ReturnType<typeof useAuth>["user"]) {
  const checks = [
    Boolean(user?.fullName?.trim()),
    Boolean(user?.email?.trim()),
    Boolean(user?.phone?.trim()),
    Boolean(user?.location?.trim() || user?.language?.trim()),
    Boolean(user?.skills?.trim() || user?.workCategory?.trim()),
    Boolean(user?.experience?.trim()),
  ];

  const completedCount = checks.filter(Boolean).length;
  return Math.round((completedCount / checks.length) * 100);
}

export default function WorkerDashboardScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const missingLabel = t("common.missing");
  const profileName = user?.fullName?.trim() || user?.email?.trim() || missingLabel;
  const initials = getInitials(user?.fullName);
  const completion = calculateCompletion(user);
  const contactLabel = formatLabel(user?.phone, missingLabel);
  const nationalityLabel = missingLabel;
  const locationLabel = formatLabel(user?.location, missingLabel);
  const languageLabel = formatLabel(user?.language, missingLabel);
  const skillsLabel = formatLabel(user?.skills, missingLabel);
  const categoryLabel = formatLabel(user?.workCategory, missingLabel);
  const experienceLabel = formatLabel(user?.experience, missingLabel);
  const availabilityLabel = formatLabel(user?.availability, missingLabel);
  const workTypeLabel = formatLabel(user?.preferredWorkType, missingLabel);
  const rateLabel = formatLabel(user?.hourlyRate, missingLabel);
  const emailVerificationLabel = user?.email
    ? user.emailVerified
      ? t("common.verified")
      : t("common.unverified")
    : missingLabel;
  const phoneVerificationLabel = user?.phone?.trim()
    ? t("common.toVerify")
    : missingLabel;

  return (
    <RequireAuth requiredRole="worker">
      <View style={styles.screen}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AuthenticatedHeader active="profile" />

          <View style={styles.topBar}>
            <View style={styles.topBarTextWrap}>
              <Text style={styles.topBarTitle}>{t("workerDashboard.headerTitle")}</Text>
              <Text style={styles.topBarCaption}>{t("workerDashboard.headerCaption")}</Text>
            </View>
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔎</Text>
              <TextInput
                placeholder={t("workerDashboard.searchPlaceholder")}
                placeholderTextColor={Colors.textMuted}
                style={styles.searchInput}
              />
            </View>
            <View style={styles.headerUserWrap}>
              <View style={styles.userChip}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>{initials}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{profileName}</Text>
                  <Text style={styles.userRole}>{t("workerDashboard.roleWorker")}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroMain}>
              <View style={styles.heroAvatarLarge}>
                <Text style={styles.heroAvatarText}>{initials}</Text>
              </View>
              <View style={styles.heroInfo}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{t("workerDashboard.roleWorker")}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{t("workerDashboard.profileActive")}</Text>
                  </View>
                </View>
                <Text style={styles.heroName}>{profileName}</Text>
                <Text style={styles.heroSubtitle}>{t("workerDashboard.heroSubtitle")}</Text>
                <View style={styles.heroMetaGrid}>
                  <HeroMetaItem label={t("common.email")} value={formatLabel(user?.email, missingLabel)} />
                  <HeroMetaItem label={t("common.phone")} value={contactLabel} />
                  <HeroMetaItem label={t("common.location")} value={locationLabel} />
                  <HeroMetaItem label={t("common.nationality")} value={nationalityLabel} />
                  <HeroMetaItem label={t("workerDashboard.emailStatus")} value={emailVerificationLabel} />
                  <HeroMetaItem label={t("workerDashboard.phoneStatus")} value={phoneVerificationLabel} />
                </View>
              </View>
            </View>
            <View style={styles.heroSide}>
              <ProgressRing percent={completion} />
              <Pressable accessibilityRole="button" disabled style={styles.editButton}>
                <Text style={styles.editButtonText}>{t("workerDashboard.editProfileSoon")}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>{t("workerDashboard.completionTitle")}</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>{completion}% {t("workerDashboard.completionSuffix")}</Text>
              </View>
            </View>
            <Text style={styles.sectionText}>
              {t("workerDashboard.completionText")}
            </Text>
            <View style={styles.completionLayout}>
              <ProgressRing percent={completion} size={92} />
              <View style={styles.checklist}>
                <ChecklistRow label={t("workerDashboard.check.name")} done={Boolean(user?.fullName?.trim())} />
                <ChecklistRow label={t("common.email")} done={Boolean(user?.email?.trim())} />
                <ChecklistRow label={t("common.phone")} done={Boolean(user?.phone?.trim())} />
                <ChecklistRow label={t("workerDashboard.check.nationalityLocation")} done={Boolean(user?.location?.trim() || user?.language?.trim())} />
                <ChecklistRow label={t("workerDashboard.check.skillsCategories")} done={Boolean(user?.skills?.trim() || user?.workCategory?.trim())} />
                <ChecklistRow label={t("workerDashboard.check.experience")} done={Boolean(user?.experience?.trim())} />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("workerDashboard.professionalInfo")}</Text>
            <View style={styles.infoGrid}>
              <InfoRow label={t("workerDashboard.field.workDomains")} value={categoryLabel} />
              <InfoRow label={t("workerDashboard.field.skills")} value={skillsLabel} />
              <InfoRow label={t("workerDashboard.field.experience")} value={experienceLabel} />
              <InfoRow label={t("workerDashboard.field.availability")} value={availabilityLabel} />
              <InfoRow label={t("workerDashboard.field.preferredWorkType")} value={workTypeLabel} />
              <InfoRow label={t("workerDashboard.field.hourlyRate")} value={rateLabel} />
              <InfoRow label={t("workerDashboard.field.languages")} value={languageLabel} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.vaultHeading}>
              <View style={styles.vaultIconWrap}>
                <Text style={styles.vaultIcon}>🛡️</Text>
              </View>
              <View style={styles.vaultHeadingText}>
                <Text style={styles.sectionTitle}>{t("workerDashboard.digitalVault")}</Text>
                <Text style={styles.sectionText}>
                  {t("workerDashboard.digitalVaultText")}
                </Text>
              </View>
            </View>
            <View style={styles.documentGrid}>
              <DocumentCard title={t("workerDashboard.document.id")} status={t("common.toUpload")} />
              <DocumentCard title={t("workerDashboard.document.iban")} status={missingLabel} />
              <DocumentCard title={t("workerDashboard.document.driverLicense")} status={t("common.optional")} />
              <DocumentCard title={t("workerDashboard.document.workPermit")} status={t("common.ifNeeded")} />
              <DocumentCard title={t("workerDashboard.document.forklift")} status={t("common.optional")} />
              <DocumentCard title={t("workerDashboard.document.certificates")} status={t("common.optional")} />
              <DocumentCard title={t("workerDashboard.document.contracts")} status={t("common.soon")} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("workerDashboard.sharingAgreements")}</Text>
            <Text style={styles.sectionText}>
              {t("workerDashboard.sharingText")}
            </Text>
            <View style={styles.flowList}>
              <FlowStep title={t("workerDashboard.flow.applyTitle")} text={t("workerDashboard.flow.applyText")} />
              <FlowStep title={t("workerDashboard.flow.companyTitle")} text={t("workerDashboard.flow.companyText")} />
              <FlowStep title={t("workerDashboard.flow.requestTitle")} text={t("workerDashboard.flow.requestText")} />
              <FlowStep title={t("workerDashboard.flow.approveTitle")} text={t("workerDashboard.flow.approveText")} />
            </View>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>{t("workerDashboard.noDocumentRequests")}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable accessibilityRole="button" onPress={() => router.push("/jobs" as any)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t("workerDashboard.viewJobs")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t("workerDashboard.myApplications")} · {t("common.soon")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t("workerDashboard.completeProfile")} · {t("common.soon")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>{t("workerDashboard.myDigitalVault")} · {t("common.soon")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

function ChecklistRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkDot, done && styles.checkDotDone]} />
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DocumentCard({ title, status }: { title: string; status: string }) {
  return (
    <View style={styles.documentCard}>
      <Text style={styles.documentTitle}>{title}</Text>
      <Text style={styles.documentStatus}>{status}</Text>
    </View>
  );
}

function FlowStep({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.flowItem}>
      <Text style={styles.flowTitle}>{title}</Text>
      <Text style={styles.flowText}>{text}</Text>
    </View>
  );
}

function HeroMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.heroMetaItem}>
      <Text style={styles.heroMetaLabel}>{label}</Text>
      <Text style={styles.heroMetaValue}>{value}</Text>
    </View>
  );
}

function ProgressRing({ percent, size = 88 }: { percent: number; size?: number }) {
  const ringSize = size;

  return (
    <View style={[styles.progressRingWrap, { width: ringSize, height: ringSize }]}>
      <View style={[styles.progressRingTrack, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]} />
      <View style={[styles.progressRing, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]} />
      <View style={[styles.progressRingInner, { width: ringSize - 24, height: ringSize - 24, borderRadius: (ringSize - 24) / 2 }]}>
        <Text style={styles.progressRingValue}>{percent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  content: {
    alignSelf: "center",
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    width: "100%",
    maxWidth: 1160,
  },
  topBar: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    marginTop: Spacing.md,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  topBarTextWrap: {
    minWidth: 150,
  },
  topBarTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  topBarCaption: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: 2,
  },
  searchWrap: {
    alignItems: "center",
    backgroundColor: "#F6F9FF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minWidth: 260,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    color: Colors.text,
    flex: 1,
    fontSize: Typography.body,
  },
  headerUserWrap: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  userChip: {
    alignItems: "center",
    backgroundColor: "#F4F8FF",
    borderRadius: Radius.round,
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  avatarSmall: {
    alignItems: "center",
    backgroundColor: "#145CFF",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  avatarSmallText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  userName: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  userRole: {
    color: Colors.textMuted,
    fontSize: Typography.small,
  },
  heroCard: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.xxl,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 4,
  },
  heroMain: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  heroAvatarLarge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  heroAvatarText: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: Typography.fontWeight.extraBold,
  },
  heroInfo: {
    flex: 1,
    minWidth: 260,
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  rolePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rolePillText: {
    color: Colors.white,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  statusPill: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusPillText: {
    color: Colors.white,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  heroName: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: Typography.body,
    marginTop: 4,
  },
  heroMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  heroMetaItem: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: Radius.lg,
    minWidth: 140,
    padding: Spacing.sm,
  },
  heroMetaLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: Typography.small,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  heroMetaValue: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  heroSide: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
    minWidth: 220,
  },
  editButton: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    borderColor: "#E6ECF7",
    borderWidth: 1,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  sectionText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    marginTop: Spacing.sm,
  },
  completionLayout: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  progressBadge: {
    backgroundColor: "#EAF1FF",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  progressText: {
    color: "#145CFF",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  checklist: {
    flex: 1,
    gap: Spacing.sm,
    minWidth: 240,
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  checkDot: {
    backgroundColor: "#DDE5F2",
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  checkDotDone: {
    backgroundColor: "#145CFF",
  },
  checkLabel: {
    color: Colors.textBody,
    fontSize: Typography.body,
  },
  infoGrid: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  infoItem: {
    backgroundColor: "#FAFBFF",
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  vaultHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.md,
  },
  vaultHeadingText: {
    flex: 1,
  },
  vaultIconWrap: {
    alignItems: "center",
    backgroundColor: "#F1F5FF",
    borderRadius: Radius.xl,
    height: 54,
    justifyContent: "center",
    minWidth: 54,
  },
  vaultIcon: {
    fontSize: 24,
  },
  documentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  documentCard: {
    backgroundColor: "#FAFBFF",
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: "#E6ECF7",
    flexGrow: 1,
    minWidth: 160,
    padding: Spacing.md,
  },
  documentTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  documentStatus: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: 6,
  },
  flowList: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  flowItem: {
    backgroundColor: "#FAFBFF",
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  flowTitle: {
    color: "#145CFF",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 4,
  },
  flowText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 22,
  },
  emptyState: {
    backgroundColor: "#F7FAFF",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  emptyStateTitle: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#F3F7FF",
    borderRadius: Radius.lg,
    opacity: 0.7,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  secondaryButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  progressRingWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressRing: {
    borderColor: "#E7EEFB",
    borderWidth: 8,
    position: "absolute",
  },
  progressRingInner: {
    alignItems: "center",
    backgroundColor: Colors.white,
    justifyContent: "center",
  },
  progressRingOverlay: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressRingTrack: {
    borderColor: "#DDE7FF",
    borderWidth: 8,
    position: "absolute",
  },
  progressRingValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
