import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
import {
  fetchOwnWorkerProfile,
  listWorkerApplications,
  withdrawApplication,
  type WorkerApplication,
  type WorkerProfile,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function WorkerDashboardScreen() {
  return (
    <RequireAuth requiredRole="worker">
      <WorkerDashboardContent />
    </RequireAuth>
  );
}

function WorkerDashboardContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");
  const userId = user?.id;

  const loadDashboard = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [nextProfile, nextApplications] = await Promise.all([
        fetchOwnWorkerProfile(userId),
        listWorkerApplications(),
      ]);

      setProfile(nextProfile);
      setApplications(nextApplications);
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadDashboard]);

  async function handleWithdraw(applicationId: string) {
    setUpdatingApplicationId(applicationId);
    setActionError("");

    try {
      await withdrawApplication(applicationId);
      await loadDashboard();
    } catch (nextError) {
      setActionError(readError(nextError));
    } finally {
      setUpdatingApplicationId("");
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthenticatedHeader active="profile" />

        <Header
          title="Dashboard worker"
          subtitle="Profilul tau si aplicatiile trimise catre companii."
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca dashboard-ul...</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

        {profile ? (
          <Card title="Profil worker">
            <View style={styles.profileHeader}>
              <View>
                <Text style={styles.profileName}>
                  {profile.first_name} {profile.last_name}
                </Text>
                <Text style={styles.profileMeta}>
                  {profile.occupation
                    ? localizedName(profile.occupation, "ro")
                    : "Ocupatie nedefinita"}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {formatProfileStatus(profile.profile_status)}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <InfoLine label="Locatie" value={formatWorkerLocation(profile)} />
              <InfoLine label="Telefon" value={profile.phone} />
              <InfoLine
                label="Experienta"
                value={`${profile.experience_years} ani`}
              />
              <InfoLine
                label="Disponibilitate"
                value={formatAvailability(profile.availability_status)}
              />
              <InfoLine
                label="Drept de munca"
                value={formatWorkAuthorization(profile.work_authorization_status)}
              />
              <InfoLine
                label="Limba preferata"
                value={formatLanguage(profile.preferred_language)}
              />
            </View>

            {profile.professional_summary ? (
              <Text style={styles.summaryText}>{profile.professional_summary}</Text>
            ) : null}
          </Card>
        ) : !loading ? (
          <Card title="Profil worker">
            <Text style={styles.emptyText}>
              Nu exista inca un profil worker complet. Creeaza profilul pentru a
              putea aplica la joburi.
            </Text>
            <Button
              title="Creeaza profil worker"
              style={styles.cardButton}
              onPress={() => router.push("/worker-form" as any)}
            />
          </Card>
        ) : null}

        <Card title="Aplicatii recente">
          {applications.length === 0 ? (
            <Text style={styles.emptyText}>
              Nu ai aplicatii trimise inca. Cauta joburi si aplica atunci cand
              profilul tau este complet.
            </Text>
          ) : (
            <View style={styles.applicationList}>
              {applications.map((application) => (
                <View key={application.application_id} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <View style={styles.applicationTitleWrap}>
                      <Text style={styles.applicationTitle}>
                        {application.job_title}
                      </Text>
                      <Text style={styles.applicationMeta}>
                        {application.company_name} - {application.location_label}
                      </Text>
                    </View>
                    <View style={styles.applicationStatusPill}>
                      <Text style={styles.applicationStatusText}>
                        {formatApplicationStatus(application.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.applicationDate}>
                    Aplicat la {formatDate(application.created_at)}
                  </Text>

                  <View style={styles.applicationActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push(
                          buildJobDetailsPath(
                            application.job_id,
                            "/worker-dashboard"
                          ) as any
                        )
                      }
                      style={styles.secondaryAction}
                    >
                      <Text style={styles.secondaryActionText}>Vezi jobul</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled:
                          application.status === "withdrawn" ||
                          updatingApplicationId === application.application_id,
                      }}
                      disabled={
                        application.status === "withdrawn" ||
                        updatingApplicationId === application.application_id
                      }
                      onPress={() => handleWithdraw(application.application_id)}
                      style={[
                        styles.withdrawAction,
                        (application.status === "withdrawn" ||
                          updatingApplicationId === application.application_id) &&
                          styles.disabledAction,
                      ]}
                    >
                      <Text style={styles.withdrawActionText}>
                        {updatingApplicationId === application.application_id
                          ? "Se retrage..."
                          : "Retrage"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.actions}>
          <Button
            title="Editeaza profilul"
            variant="secondary"
            onPress={() => router.push("/worker-form" as any)}
          />
          <Button
            title="Cauta joburi"
            onPress={() => router.push("/jobs" as any)}
          />
          <Button
            title={t("common.logout")}
            variant="ghost"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Necompletat"}</Text>
    </View>
  );
}

function formatWorkerLocation(profile: WorkerProfile) {
  if (profile.location) {
    const district = profile.location.district
      ? `-${profile.location.district}`
      : "";

    return `${profile.location.postal_code} ${profile.location.city}${district}, ${profile.location.state}`;
  }

  if (profile.postal_code || profile.city) {
    return [profile.postal_code, profile.city].filter(Boolean).join(" ");
  }

  return null;
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

function formatProfileStatus(value: string) {
  if (value === "active") {
    return "activ";
  }

  if (value === "suspended") {
    return "suspendat";
  }

  return "inactiv";
}

function formatAvailability(value: string) {
  if (value === "available") {
    return "Disponibil acum";
  }

  if (value === "soon") {
    return "Disponibil in curand";
  }

  if (value === "employed") {
    return "Angajat momentan";
  }

  return "Indisponibil";
}

function formatWorkAuthorization(value: string) {
  if (value === "eu_citizen") {
    return "Cetatean UE";
  }

  if (value === "work_permit") {
    return "Permis de munca";
  }

  if (value === "needs_permit") {
    return "Are nevoie de permis";
  }

  return "De clarificat";
}

function formatLanguage(value: string) {
  if (value === "ro") {
    return "Romana";
  }

  if (value === "en") {
    return "Engleza";
  }

  return "Germana";
}

function formatApplicationStatus(value: string) {
  if (value === "viewed") {
    return "vazuta";
  }

  if (value === "shortlisted") {
    return "selectata";
  }

  if (value === "accepted") {
    return "acceptata";
  }

  if (value === "rejected") {
    return "respinsa";
  }

  if (value === "withdrawn") {
    return "retrasa";
  }

  return "trimisa";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca dashboard-ul worker.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  profileHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
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
    lineHeight: 24,
    marginTop: Spacing.lg,
  },
  applicationList: {
    gap: Spacing.md,
  },
  applicationCard: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  applicationHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  applicationTitleWrap: {
    flexBasis: 240,
    flexGrow: 1,
  },
  applicationTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
  },
  applicationMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  applicationStatusPill: {
    backgroundColor: "#EAF1FF",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  applicationStatusText: {
    color: "#145CFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  applicationDate: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.md,
  },
  applicationActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  secondaryAction: {
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  secondaryActionText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  withdrawAction: {
    backgroundColor: Colors.white,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  withdrawActionText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  disabledAction: {
    opacity: 0.5,
  },
  actions: {
    gap: Spacing.md,
  },
  cardButton: {
    marginTop: Spacing.lg,
  },
  emptyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 24,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  mutedText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
