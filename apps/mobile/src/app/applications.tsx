import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import {
  listCompanyApplications,
  updateApplicationStatus,
  type CompanyApplication,
} from "@/services/worker/workerService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const statusActions = [
  { label: "Vazut", value: "viewed" },
  { label: "Selectat", value: "shortlisted" },
  { label: "Acceptat", value: "accepted" },
  { label: "Respins", value: "rejected" },
];

export default function ApplicationsScreen() {
  return (
    <RequireAuth requiredRole="business">
      <ApplicationsContent />
    </RequireAuth>
  );
}

function ApplicationsContent() {
  const router = useRouter();
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");

  const groupedApplications = useMemo(() => {
    const groups = new Map<string, CompanyApplication[]>();

    for (const application of applications) {
      const current = groups.get(application.job_id) ?? [];
      current.push(application);
      groups.set(application.job_id, current);
    }

    return Array.from(groups.entries()).map(([jobId, items]) => ({
      applications: items,
      jobId,
      jobTitle: items[0]?.job_title ?? "Job",
    }));
  }, [applications]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setApplications(await listCompanyApplications());
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadApplications();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadApplications]);

  async function handleStatusUpdate(applicationId: string, status: string) {
    setUpdatingApplicationId(applicationId);
    setError("");

    try {
      await updateApplicationStatus(applicationId, status);
      await loadApplications();
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setUpdatingApplicationId("");
    }
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/business-dashboard" as any)}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Dashboard business</Text>
          </Pressable>
        </View>

        <Header
          title="Aplicatii primite"
          subtitle="Candidatii sunt afisati doar pentru joburile companiei tale."
        />

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca aplicatiile...</Text>
          </Card>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!loading && groupedApplications.length === 0 ? (
          <Card title="Momentan nu exista aplicatii">
            <Text style={styles.emptyText}>
              Aplicatiile trimise de worker-i la joburile tale vor aparea aici.
            </Text>
          </Card>
        ) : null}

        {groupedApplications.map((group) => (
          <Card key={group.jobId} title={group.jobTitle}>
            <View style={styles.applicationList}>
              {group.applications.map((application) => (
                <View key={application.application_id} style={styles.applicationCard}>
                  <View style={styles.applicationHeader}>
                    <View style={styles.applicationTitleWrap}>
                      <Text style={styles.workerName}>
                        {application.worker_name}
                      </Text>
                      <Text style={styles.workerMeta}>
                        {application.occupation_name_ro} -{" "}
                        {application.experience_years} ani experienta
                      </Text>
                      <Text style={styles.workerMeta}>
                        {application.worker_location_label}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>
                        {formatApplicationStatus(application.status)}
                      </Text>
                    </View>
                  </View>

                  {application.message ? (
                    <Text style={styles.messageText}>{application.message}</Text>
                  ) : null}

                  <Text style={styles.applicationDate}>
                    Aplicat la {formatDate(application.created_at)}
                  </Text>

                  <View style={styles.actionRow}>
                    {statusActions.map((action) => {
                      const disabled =
                        updatingApplicationId === application.application_id ||
                        application.status === "withdrawn";

                      return (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{
                            disabled,
                            selected: application.status === action.value,
                          }}
                          disabled={disabled}
                          key={action.value}
                          onPress={() =>
                            handleStatusUpdate(
                              application.application_id,
                              action.value
                            )
                          }
                          style={[
                            styles.actionButton,
                            application.status === action.value &&
                              styles.actionButtonActive,
                            disabled && styles.disabledAction,
                          ]}
                        >
                          <Text
                            style={[
                              styles.actionButtonText,
                              application.status === action.value &&
                                styles.actionButtonTextActive,
                            ]}
                          >
                            {action.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Button
          title="Inapoi la dashboard"
          variant="ghost"
          onPress={() => router.replace("/business-dashboard" as any)}
        />
      </ScrollView>
    </Screen>
  );
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
    : "Nu am putut incarca aplicatiile.";
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
    flexBasis: 260,
    flexGrow: 1,
  },
  workerName: {
    color: Colors.text,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
  },
  workerMeta: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  statusPill: {
    backgroundColor: "#EAF1FF",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusPillText: {
    color: "#145CFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  messageText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 24,
    marginTop: Spacing.md,
  },
  applicationDate: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  actionButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actionButtonTextActive: {
    color: "#145CFF",
  },
  disabledAction: {
    opacity: 0.5,
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
