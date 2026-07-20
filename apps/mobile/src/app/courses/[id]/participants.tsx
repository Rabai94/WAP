import CredentialConfirmDialog from "@/components/credentials/CredentialConfirmDialog";
import CredentialStatusBadge from "@/components/credentials/CredentialStatusBadge";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  finalizeCourseEnrollment,
  generateCourseCredential,
  listCourseParticipantsForIssuer,
  listCredentialAudit,
  revokeCredential,
  updateEnrollmentStatusForIssuer,
  type CompletionOutcome,
  type CredentialAuditEvent,
  type IssuerCourseParticipant,
} from "@/services/credentials/credentialService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ActionKind =
  | "accept"
  | "abandoned"
  | "failed"
  | "issue"
  | "passed"
  | "reissue"
  | "reject"
  | "revoke";

type PendingAction = {
  kind: ActionKind;
  participant: IssuerCourseParticipant;
};

const enrollmentFilters = [
  "all",
  "submitted",
  "viewed",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export default function CourseParticipantsScreen() {
  return (
    <RequireAuth>
      <CourseParticipantsContent />
    </RequireAuth>
  );
}

function CourseParticipantsContent() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<IssuerCourseParticipant[]>([]);
  const [filter, setFilter] = useState<(typeof enrollmentFilters)[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auditCredentialId, setAuditCredentialId] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<CredentialAuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const submittingRef = useRef(false);

  const loadParticipants = useCallback(async () => {
    if (!courseId) {
      setError(t("credentials.participants.invalidCourse"));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setParticipants(await listCourseParticipantsForIssuer(courseId));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.participants.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }, [courseId, t]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadParticipants();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadParticipants]);

  const filteredParticipants = useMemo(
    () => participants.filter(
      (participant) => filter === "all" || participant.enrollment_status === filter,
    ),
    [filter, participants],
  );

  function openAction(kind: ActionKind, participant: IssuerCourseParticipant) {
    setError("");
    setSuccess("");
    setScore(participant.completion_score?.toString() ?? "");
    setNotes(participant.completion_notes ?? "");
    setReason("");
    setPendingAction({ kind, participant });
  }

  function closeAction() {
    if (!submittingRef.current) {
      setPendingAction(null);
    }
  }

  async function confirmAction() {
    if (!pendingAction || submittingRef.current) {
      return;
    }

    const parsedScore = score.trim() ? Number(score) : null;
    if (
      isCompletionAction(pendingAction.kind)
      && parsedScore !== null
      && (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100)
    ) {
      setError(t("credentials.participants.scoreError"));
      return;
    }

    if (pendingAction.kind === "revoke" && reason.trim().length < 5) {
      setError(t("credentials.participants.reasonError"));
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const participant = pendingAction.participant;
      switch (pendingAction.kind) {
        case "accept":
          await updateEnrollmentStatusForIssuer(participant.enrollment_id, "accepted");
          break;
        case "reject":
          await updateEnrollmentStatusForIssuer(participant.enrollment_id, "rejected");
          break;
        case "passed":
        case "failed":
        case "abandoned":
          await finalizeCourseEnrollment({
            enrollmentId: participant.enrollment_id,
            notes: notes.trim() || null,
            outcome: pendingAction.kind as CompletionOutcome,
            score: parsedScore,
          });
          break;
        case "issue":
          if (!participant.completion_id) {
            throw new Error(t("credentials.participants.missingCompletion"));
          }
          await generateCourseCredential({ completionId: participant.completion_id });
          break;
        case "revoke":
          if (!participant.credential_id) {
            throw new Error(t("credentials.participants.missingCredential"));
          }
          await revokeCredential(participant.credential_id, reason.trim());
          break;
        case "reissue":
          if (!participant.credential_id) {
            throw new Error(t("credentials.participants.missingCredential"));
          }
          await generateCourseCredential({
            replacesCredentialId: participant.credential_id,
          });
          break;
      }

      setPendingAction(null);
      setSuccess(t("credentials.participants.actionSuccess"));
      await loadParticipants();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.participants.actionError"),
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  async function toggleAudit(credentialId: string) {
    if (auditCredentialId === credentialId) {
      setAuditCredentialId(null);
      setAuditEvents([]);
      return;
    }

    setAuditCredentialId(credentialId);
    setAuditLoading(true);
    setError("");
    try {
      setAuditEvents(await listCredentialAudit(credentialId));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.participants.auditError"),
      );
      setAuditEvents([]);
    } finally {
      setAuditLoading(false);
    }
  }

  const dialogCopy = pendingAction
    ? getDialogCopy(pendingAction.kind, t)
    : null;

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
          { maxWidth: responsive.contentMaxWidth },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          subtitle={t("credentials.participants.subtitle")}
          title={t("credentials.participants.title")}
        />

        <View style={styles.toolbar}>
          <Button
            onPress={() => router.push("/credentials/issuer" as never)}
            title={t("credentials.participants.back")}
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={() => void loadParticipants()}
            title={t("common.refresh")}
            variant="ghost"
          />
        </View>

        <View accessibilityRole="tablist" style={styles.filters}>
          {enrollmentFilters.map((status) => (
            <Button
              accessibilityLabel={t(`credentials.enrollment.${status}`)}
              key={status}
              onPress={() => setFilter(status)}
              style={styles.filterButton}
              title={t(`credentials.enrollment.${status}`)}
              variant={filter === status ? "primary" : "secondary"}
            />
          ))}
        </View>

        {loading ? <Card><Text style={styles.muted}>{t("common.loading")}</Text></Card> : null}
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        {success ? <Text accessibilityRole="alert" style={styles.success}>{success}</Text> : null}

        {!loading && filteredParticipants.length === 0 ? (
          <Card><Text style={styles.muted}>{t("credentials.participants.empty")}</Text></Card>
        ) : null}

        {filteredParticipants.map((participant) => (
          <Card key={participant.enrollment_id}>
            <View style={styles.participantHeader}>
              <View style={styles.participantTitleBlock}>
                <Text style={styles.participantName}>
                  {participant.participant_display_name || t("credentials.participants.unnamed")}
                </Text>
                <Text style={styles.meta}>
                  {`${t("credentials.participants.enrolledAt")}: ${formatDate(participant.enrolled_at)}`}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {t(`credentials.enrollment.${participant.enrollment_status}`)}
                </Text>
              </View>
            </View>

            {participant.completion_outcome ? (
              <View style={styles.completionPanel}>
                <Text style={styles.sectionTitle}>{t("credentials.participants.completion")}</Text>
                <Text style={styles.meta}>
                  {t(`credentials.outcome.${participant.completion_outcome}`)}
                  {participant.completion_score !== null
                    ? ` · ${t("credentials.participants.score")}: ${participant.completion_score}`
                    : ""}
                </Text>
                {participant.completion_notes ? (
                  <Text style={styles.notes}>{participant.completion_notes}</Text>
                ) : null}
              </View>
            ) : null}

            {participant.credential_number && participant.credential_status ? (
              <View style={styles.credentialPanel}>
                <View style={styles.credentialHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>{participant.credential_number}</Text>
                    <Text style={styles.meta}>{t("credentials.participants.credential")}</Text>
                  </View>
                  <View style={styles.badges}>
                    <CredentialStatusBadge
                      label={t(`credentials.status.${participant.credential_status}`)}
                      status={participant.credential_status}
                    />
                    {participant.credential_document_status ? (
                      <CredentialStatusBadge
                        label={t(`credentials.document.${participant.credential_document_status}`)}
                        status={participant.credential_document_status}
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.actions}>
              {participant.enrollment_status === "submitted"
              || participant.enrollment_status === "viewed" ? (
                <>
                  <Button
                    onPress={() => openAction("accept", participant)}
                    style={styles.actionButton}
                    title={t("credentials.participants.accept")}
                    variant="success"
                  />
                  <Button
                    onPress={() => openAction("reject", participant)}
                    style={styles.actionButton}
                    title={t("credentials.participants.reject")}
                    variant="danger"
                  />
                </>
              ) : null}

              {participant.enrollment_status === "accepted" && !participant.completion_id ? (
                <>
                  <Button
                    onPress={() => openAction("passed", participant)}
                    style={styles.actionButton}
                    title={t("credentials.outcome.passed")}
                    variant="success"
                  />
                  <Button
                    onPress={() => openAction("failed", participant)}
                    style={styles.actionButton}
                    title={t("credentials.outcome.failed")}
                    variant="danger"
                  />
                  <Button
                    onPress={() => openAction("abandoned", participant)}
                    style={styles.actionButton}
                    title={t("credentials.outcome.abandoned")}
                    variant="secondary"
                  />
                </>
              ) : null}

              {participant.completion_outcome === "passed" && !participant.credential_id ? (
                <Button
                  onPress={() => openAction("issue", participant)}
                  style={styles.actionButton}
                  title={t("credentials.participants.issue")}
                />
              ) : null}

              {participant.credential_id && participant.credential_status === "valid" ? (
                <Button
                  onPress={() => openAction("revoke", participant)}
                  style={styles.actionButton}
                  title={t("credentials.participants.revoke")}
                  variant="danger"
                />
              ) : null}

              {participant.credential_id && participant.credential_status === "revoked" ? (
                <Button
                  onPress={() => openAction("reissue", participant)}
                  style={styles.actionButton}
                  title={t("credentials.participants.reissue")}
                />
              ) : null}

              {participant.credential_id ? (
                <Button
                  onPress={() => void toggleAudit(participant.credential_id!)}
                  style={styles.actionButton}
                  title={t("credentials.participants.audit")}
                  variant="ghost"
                />
              ) : null}
            </View>

            {participant.credential_id === auditCredentialId ? (
              <View style={styles.auditPanel}>
                <Text style={styles.sectionTitle}>{t("credentials.participants.audit")}</Text>
                {auditLoading ? <Text style={styles.muted}>{t("common.loading")}</Text> : null}
                {!auditLoading && auditEvents.length === 0 ? (
                  <Text style={styles.muted}>{t("credentials.participants.auditEmpty")}</Text>
                ) : null}
                {auditEvents.map((event) => (
                  <View key={event.event_id} style={styles.auditEvent}>
                    <Text style={styles.auditTitle}>
                      {t(`credentials.audit.${event.event_type}`)}
                    </Text>
                    <Text style={styles.meta}>
                      {`${formatDateTime(event.created_at)} · ${t(`credentials.actor.${event.actor_role}`)}`}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        ))}
      </ScrollView>

      <CredentialConfirmDialog
        cancelLabel={t("common.cancel")}
        confirmLabel={dialogCopy?.confirm ?? t("common.confirm")}
        danger={pendingAction?.kind === "revoke" || pendingAction?.kind === "reject"}
        loading={submitting}
        message={dialogCopy?.message ?? ""}
        onCancel={closeAction}
        onConfirm={() => void confirmAction()}
        title={dialogCopy?.title ?? ""}
        visible={Boolean(pendingAction)}
      >
        {pendingAction && isCompletionAction(pendingAction.kind) ? (
          <View style={styles.formFields}>
            <Text style={styles.label}>{t("credentials.participants.scoreOptional")}</Text>
            <TextInput
              accessibilityLabel={t("credentials.participants.scoreOptional")}
              keyboardType="decimal-pad"
              onChangeText={setScore}
              placeholder="0–100"
              style={styles.input}
              value={score}
            />
            <Text style={styles.label}>{t("credentials.participants.notesOptional")}</Text>
            <TextInput
              accessibilityLabel={t("credentials.participants.notesOptional")}
              maxLength={2000}
              multiline
              onChangeText={setNotes}
              style={[styles.input, styles.textArea]}
              value={notes}
            />
          </View>
        ) : null}

        {pendingAction?.kind === "revoke" ? (
          <View style={styles.formFields}>
            <Text style={styles.label}>{t("credentials.participants.reason")}</Text>
            <TextInput
              accessibilityLabel={t("credentials.participants.reason")}
              maxLength={1000}
              multiline
              onChangeText={setReason}
              style={[styles.input, styles.textArea]}
              value={reason}
            />
          </View>
        ) : null}
      </CredentialConfirmDialog>
    </Screen>
  );
}

function isCompletionAction(kind: ActionKind) {
  return kind === "passed" || kind === "failed" || kind === "abandoned";
}

function getDialogCopy(kind: ActionKind, t: (key: string) => string) {
  return {
    title: t(`credentials.dialog.${kind}.title`),
    message: t(`credentials.dialog.${kind}.message`),
    confirm: t(`credentials.dialog.${kind}.confirm`),
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    minWidth: 112,
  },
  participantHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  participantTitleBlock: {
    flex: 1,
    minWidth: 190,
  },
  participantName: {
    color: Colors.text,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statusPill: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  statusText: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  completionPanel: {
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  credentialPanel: {
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  credentialHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  badges: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  notes: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 140,
  },
  auditPanel: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  auditEvent: {
    borderBottomColor: Colors.borderMuted,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
  },
  auditTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  formFields: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    fontSize: Typography.body,
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  muted: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  success: {
    color: Colors.success,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
});
