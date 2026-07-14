import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import {
  deactivateOwnJob,
  fetchOwnCompany,
  fetchOwnCompanyJobs,
  type CompanyDashboardJob,
  type CompanyProfile,
} from "@/services/company/companyService";
import { buildJobDetailsPath } from "@/services/jobs/jobNavigation";
import {
  listCompanyApplications,
  type CompanyApplication,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type JobApplicationStats = {
  newCount: number;
  totalCount: number;
};

export default function BusinessDashboardScreen() {
  return (
    <RequireAuth requiredRole="business">
      <BusinessDashboardContent />
    </RequireAuth>
  );
}

function BusinessDashboardContent() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const userId = user?.id;
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<CompanyDashboardJob[]>([]);
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deactivatingJobId, setDeactivatingJobId] = useState("");
  const [dashboardNow, setDashboardNow] = useState(0);

  const canPublishJobs =
    company?.status === "active" &&
    company.verification_status === "verified";

  const loadDashboard = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextCompany = await fetchOwnCompany(userId);
      let nextJobs: CompanyDashboardJob[] = [];
      let nextApplications: CompanyApplication[] = [];

      if (nextCompany) {
        [nextJobs, nextApplications] = await Promise.all([
          fetchOwnCompanyJobs(nextCompany.id),
          listCompanyApplications(),
        ]);
      }

      setCompany(nextCompany);
      setJobs(nextJobs);
      setApplications(nextApplications);
      setDashboardNow(Date.now());
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

  const applicationStatsByJob = useMemo(() => {
    const stats = new Map<string, JobApplicationStats>();

    for (const application of applications) {
      const current = stats.get(application.job_id) ?? {
        newCount: 0,
        totalCount: 0,
      };

      current.totalCount += 1;

      if (application.status === "submitted") {
        current.newCount += 1;
      }

      stats.set(application.job_id, current);
    }

    return stats;
  }, [applications]);

  const kpis = useMemo(() => {
    const acceptedWorkerIds = new Set(
      applications
        .filter((application) => application.status === "accepted")
        .map((application) => application.worker_profile_id)
    );

    return {
      acceptedWorkers: acceptedWorkerIds.size,
      activeJobs: jobs.filter((job) => isActiveJob(job, dashboardNow)).length,
      expiredJobs: jobs.filter((job) => isExpiredJob(job, dashboardNow)).length,
      newApplications: applications.filter(
        (application) => application.status === "submitted"
      ).length,
      totalApplications: applications.length,
    };
  }, [applications, dashboardNow, jobs]);

  const newApplications = useMemo(
    () =>
      applications
        .filter((application) => application.status === "submitted")
        .slice(0, 6),
    [applications]
  );

  async function handleDeactivate(job: CompanyDashboardJob) {
    if (!canDeactivateJob(job)) {
      return;
    }

    setDeactivatingJobId(job.id);
    setError("");
    setNotice("");

    try {
      await deactivateOwnJob(job.id);
      setNotice(`Jobul "${job.title}" a fost dezactivat.`);
      await loadDashboard();
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setDeactivatingJobId("");
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/engine" as any)}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Acasa</Text>
          </Pressable>
        </View>

        <Header
          title="Dashboard companie"
          subtitle="Administreaza profilul firmei, joburile si aplicatiile primite."
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca centrul companiei...</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}

        {!loading && !company ? (
          <Card title="Compania ta">
            <Text style={styles.emptyText}>
              Nu exista inca o companie asociata contului tau. Creeaza profilul
              companiei pentru a putea publica joburi si primi aplicatii.
            </Text>
            <Button
              title="Creeaza compania"
              style={styles.cardButton}
              onPress={() => router.push("/business-form" as any)}
            />
          </Card>
        ) : null}

        {company ? (
          <>
            <View style={styles.summaryGrid}>
              <Card title="Companie">
                <Text style={styles.companyName}>{company.name}</Text>
                <View style={styles.companyInfoGrid}>
                  <InfoPill
                    label="Verificare"
                    tone={company.verification_status === "verified" ? "success" : "warning"}
                    value={formatVerificationStatus(company.verification_status)}
                  />
                  <InfoPill label="Oras" value={company.city || "Necompletat"} />
                  <InfoPill
                    label="Industrie"
                    value={company.industry || "Necompletat"}
                  />
                  <InfoPill
                    label="Status"
                    value={formatCompanyStatus(company.status)}
                  />
                </View>
              </Card>

              <Card title="Actiuni rapide">
                <View style={styles.quickActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canPublishJobs }}
                    disabled={!canPublishJobs}
                    onPress={() => router.push("/create-job" as any)}
                    style={[
                      styles.quickActionPrimary,
                      !canPublishJobs && styles.actionDisabled,
                    ]}
                  >
                    <Text style={styles.quickActionPrimaryText}>
                      Publica job
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/business-form" as any)}
                    style={styles.quickActionSecondary}
                  >
                    <Text style={styles.quickActionSecondaryText}>
                      Editeaza compania
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(`/companies?companyId=${company.id}` as any)
                    }
                    style={styles.quickActionSecondary}
                  >
                    <Text style={styles.quickActionSecondaryText}>
                      Vezi profil public
                    </Text>
                  </Pressable>
                </View>
                {!canPublishJobs ? (
                  <Text style={styles.hintText}>
                    Publicarea joburilor este disponibila doar pentru companii
                    active si verificate.
                  </Text>
                ) : null}
              </Card>
            </View>

            <View style={styles.kpiGrid}>
              <KpiCard label="Joburi active" value={kpis.activeJobs} />
              <KpiCard label="Joburi expirate" value={kpis.expiredJobs} />
              <KpiCard label="Aplicatii totale" value={kpis.totalApplications} />
              <KpiCard label="Aplicatii noi" value={kpis.newApplications} />
              <KpiCard label="Muncitori acceptati" value={kpis.acceptedWorkers} />
            </View>

            <Card title="Joburile companiei">
              {jobs.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nu ai joburi publicate inca. Foloseste actiunea rapida
                  Publica job pentru a crea primul anunt.
                </Text>
              ) : (
                <View style={styles.jobList}>
                  {jobs.map((job) => {
                    const stats = applicationStatsByJob.get(job.id) ?? {
                      newCount: 0,
                      totalCount: 0,
                    };
                    const deactivating = deactivatingJobId === job.id;
                    const canDeactivate = canDeactivateJob(job);

                    return (
                      <View key={job.id} style={styles.jobRow}>
                        <View style={styles.jobMain}>
                          <Text style={styles.jobTitle}>{job.title}</Text>
                          <Text style={styles.jobMeta}>
                            {formatLocation(job)} - publicat la{" "}
                            {formatDate(job.created_at)}
                          </Text>
                          <View style={styles.jobMetaRow}>
                            <StatusPill status={job.status} />
                            <Text style={styles.jobApplications}>
                              {stats.totalCount} aplicatii
                              {stats.newCount > 0
                                ? ` (${stats.newCount} noi)`
                                : ""}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.jobActions}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              router.push(
                                buildJobDetailsPath(
                                  job.id,
                                  "/business-dashboard"
                                ) as any
                              )
                            }
                            style={styles.jobActionButton}
                          >
                            <Text style={styles.jobActionText}>Vezi jobul</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              router.push(`/create-job?jobId=${job.id}` as any)
                            }
                            style={styles.jobActionButton}
                          >
                            <Text style={styles.jobActionText}>Edit</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              router.push(`/applications?jobId=${job.id}` as any)
                            }
                            style={styles.jobActionButton}
                          >
                            <Text style={styles.jobActionText}>
                              Vezi aplicatii
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{
                              disabled: !canDeactivate || deactivating,
                            }}
                            disabled={!canDeactivate || deactivating}
                            onPress={() => handleDeactivate(job)}
                            style={[
                              styles.jobDangerButton,
                              (!canDeactivate || deactivating) &&
                                styles.actionDisabled,
                            ]}
                          >
                            <Text style={styles.jobDangerText}>
                              {deactivating ? "Se dezactiveaza..." : "Dezactiveaza"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>

            <Card title="Aplicatii noi">
              {newApplications.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nu exista aplicatii noi. Aplicatiile cu status trimisa vor
                  aparea aici.
                </Text>
              ) : (
                <View style={styles.applicationList}>
                  {newApplications.map((application) => (
                    <View
                      key={application.application_id}
                      style={styles.applicationRow}
                    >
                      <View style={styles.applicationMain}>
                        <Text style={styles.applicationWorker}>
                          {application.worker_name}
                        </Text>
                        <Text style={styles.applicationMeta}>
                          {application.job_title} - {application.worker_location_label}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          router.push(
                            `/applications?jobId=${application.job_id}` as any
                          )
                        }
                        style={styles.applicationButton}
                      >
                        <Text style={styles.applicationButtonText}>
                          Gestioneaza
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        ) : null}

        <Button
          title="Logout"
          variant="ghost"
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>
    </Screen>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function InfoPill({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "success" | "warning";
  value: string;
}) {
  return (
    <View
      style={[
        styles.infoPill,
        tone === "success" && styles.infoPillSuccess,
        tone === "warning" && styles.infoPillWarning,
      ]}
    >
      <Text style={styles.infoPillLabel}>{label}</Text>
      <Text style={styles.infoPillValue}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const active = status === "published";

  return (
    <View style={[styles.statusPill, active && styles.statusPillActive]}>
      <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>
        {formatJobStatus(status)}
      </Text>
    </View>
  );
}

function canDeactivateJob(job: CompanyDashboardJob) {
  return job.status === "published" || job.status === "draft";
}

function isActiveJob(job: CompanyDashboardJob, now: number) {
  return job.status === "published" && !isExpiredJob(job, now);
}

function isExpiredJob(job: CompanyDashboardJob, now: number) {
  if (job.status === "expired") {
    return true;
  }

  return job.expires_at ? new Date(job.expires_at).getTime() <= now : false;
}

function formatVerificationStatus(value: string) {
  if (value === "verified") {
    return "verificata";
  }

  if (value === "rejected") {
    return "respinsa";
  }

  return "in asteptare";
}

function formatCompanyStatus(value: string) {
  if (value === "active") {
    return "activa";
  }

  if (value === "suspended") {
    return "suspendata";
  }

  if (value === "archived") {
    return "arhivata";
  }

  if (value === "inactive") {
    return "inactiva";
  }

  return value;
}

function formatJobStatus(value: string) {
  if (value === "published") {
    return "activ";
  }

  if (value === "paused") {
    return "dezactivat";
  }

  if (value === "expired") {
    return "expirat";
  }

  if (value === "archived") {
    return "arhivat";
  }

  return value;
}

function formatLocation(job: CompanyDashboardJob) {
  const location = job.location;

  if (!location) {
    return "Locatie nespecificata";
  }

  const district = location.district ? `-${location.district}` : "";

  return `${location.postal_code} ${location.city}${district}, ${location.state}`;
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
    : "Nu am putut incarca dashboard-ul companiei.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
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
  summaryGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  companyName: {
    color: Colors.text,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.lg,
  },
  companyInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  infoPill: {
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 170,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  infoPillSuccess: {
    backgroundColor: "#E8F8F2",
    borderColor: "#BEEBD7",
  },
  infoPillWarning: {
    backgroundColor: "#FFF7E8",
    borderColor: "#F6D7A8",
  },
  infoPillLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  infoPillValue: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickActionPrimary: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  quickActionPrimaryText: {
    color: Colors.brandOn,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  quickActionSecondary: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  quickActionSecondaryText: {
    color: Colors.brand,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  kpiCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 170,
    flexGrow: 1,
    padding: Spacing.three,
  },
  kpiValue: {
    color: Colors.text,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  kpiLabel: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  jobList: {
    gap: Spacing.md,
  },
  jobRow: {
    alignItems: "flex-start",
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  jobMain: {
    flexBasis: 300,
    flexGrow: 1,
  },
  jobTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
  },
  jobMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  jobMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  jobApplications: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  statusPill: {
    backgroundColor: "#EEF2F8",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusPillActive: {
    backgroundColor: "#E8F8F2",
  },
  statusPillText: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statusPillTextActive: {
    color: Colors.success,
  },
  jobActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  jobActionButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  jobActionText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  jobDangerButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  jobDangerText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  applicationList: {
    gap: Spacing.md,
  },
  applicationRow: {
    alignItems: "center",
    backgroundColor: "#F7F9FD",
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  applicationMain: {
    flexBasis: 260,
    flexGrow: 1,
  },
  applicationWorker: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  applicationMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  applicationButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.brand,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  applicationButtonText: {
    color: Colors.brand,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  cardButton: {
    marginTop: Spacing.lg,
  },
  emptyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 24,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    marginTop: Spacing.md,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  noticeText: {
    color: Colors.success,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
