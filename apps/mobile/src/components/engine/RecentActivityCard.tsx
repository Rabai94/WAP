import {
  listProviderCourseEnrollments,
  type ProviderCourseEnrollment,
  type UserCourseEnrollment,
} from "@/services/courses/courseService";
import {
  fetchCachedCourseEnrollments,
  type CourseEnrollmentSnapshot,
} from "@/components/courses/quick-view/courseQuickViewData";
import { useCourseEnrollmentMap } from "@/components/courses/quick-view/useCourseEnrollmentMap";
import { RabAIButton } from "@/components/ui";
import {
  listCompanyApplications,
  listWorkerApplications,
  type CompanyApplication,
  type WorkerApplication,
} from "@/services/worker/workerService";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  Colors,
  ControlHeight,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const maximumVisibleItems = 5;
const activitySourceCount = 4;

type ActivityContextKey = "candidate" | "company" | "participant" | "provider";
type ActivityTypeKey =
  | "companyApplication"
  | "providerEnrollment"
  | "userEnrollment"
  | "workerApplication";

type ActivityCopy = {
  activityTypes: Record<ActivityTypeKey, string>;
  contexts: Record<ActivityContextKey, string>;
  dateUnavailable: string;
  emptyText: string;
  emptyTitle: string;
  error: string;
  loading: string;
  partialError: string;
  retry: string;
  statuses: Record<string, string>;
  subtitle: string;
  title: string;
  unspecifiedStatus: string;
};

const copyByLanguage = {
  ro: {
    activityTypes: {
      companyApplication: "Candidatură primită",
      providerEnrollment: "Înscriere primită",
      userEnrollment: "Înscriere la curs",
      workerApplication: "Candidatură trimisă",
    },
    contexts: {
      candidate: "Candidat",
      company: "Companie",
      participant: "Participant",
      provider: "Furnizor",
    },
    dateUnavailable: "Dată indisponibilă",
    emptyText:
      "Aplicațiile și înscrierile tale vor apărea aici când există date disponibile.",
    emptyTitle: "Nu există activitate recentă",
    error: "Activitatea nu a putut fi încărcată momentan.",
    loading: "Se încarcă activitatea recentă...",
    partialError: "Unele surse de activitate nu au putut fi încărcate.",
    retry: "Încearcă din nou",
    statuses: {
      accepted: "Acceptată",
      active: "Activă",
      approved: "Aprobată",
      cancelled: "Anulată",
      completed: "Finalizată",
      confirmed: "Confirmată",
      declined: "Refuzată",
      enrolled: "Înscrisă",
      pending: "În așteptare",
      rejected: "Respinsă",
      submitted: "Trimisă",
      viewed: "Vizualizată",
      withdrawn: "Retrasă",
    },
    subtitle: "Aplicații și înscrieri asociate contului tău",
    title: "Activitate recentă",
    unspecifiedStatus: "Nespecificat",
  },
  en: {
    activityTypes: {
      companyApplication: "Application received",
      providerEnrollment: "Enrollment received",
      userEnrollment: "Course enrollment",
      workerApplication: "Application sent",
    },
    contexts: {
      candidate: "Candidate",
      company: "Company",
      participant: "Participant",
      provider: "Provider",
    },
    dateUnavailable: "Date unavailable",
    emptyText:
      "Your applications and enrollments will appear here when data is available.",
    emptyTitle: "No recent activity",
    error: "Activity could not be loaded right now.",
    loading: "Loading recent activity...",
    partialError: "Some activity sources could not be loaded.",
    retry: "Try again",
    statuses: {
      accepted: "Accepted",
      active: "Active",
      approved: "Approved",
      cancelled: "Cancelled",
      completed: "Completed",
      confirmed: "Confirmed",
      declined: "Declined",
      enrolled: "Enrolled",
      pending: "Pending",
      rejected: "Rejected",
      submitted: "Submitted",
      viewed: "Viewed",
      withdrawn: "Withdrawn",
    },
    subtitle: "Applications and enrollments associated with your account",
    title: "Recent activity",
    unspecifiedStatus: "Unspecified",
  },
  de: {
    activityTypes: {
      companyApplication: "Bewerbung erhalten",
      providerEnrollment: "Anmeldung erhalten",
      userEnrollment: "Kursanmeldung",
      workerApplication: "Bewerbung gesendet",
    },
    contexts: {
      candidate: "Bewerber",
      company: "Unternehmen",
      participant: "Teilnehmer",
      provider: "Anbieter",
    },
    dateUnavailable: "Datum nicht verfügbar",
    emptyText:
      "Deine Bewerbungen und Anmeldungen erscheinen hier, sobald Daten verfügbar sind.",
    emptyTitle: "Keine aktuelle Aktivität",
    error: "Die Aktivität konnte derzeit nicht geladen werden.",
    loading: "Aktuelle Aktivität wird geladen...",
    partialError: "Einige Aktivitätsquellen konnten nicht geladen werden.",
    retry: "Erneut versuchen",
    statuses: {
      accepted: "Angenommen",
      active: "Aktiv",
      approved: "Genehmigt",
      cancelled: "Storniert",
      completed: "Abgeschlossen",
      confirmed: "Bestätigt",
      declined: "Abgelehnt",
      enrolled: "Angemeldet",
      pending: "Ausstehend",
      rejected: "Abgelehnt",
      submitted: "Eingereicht",
      viewed: "Angesehen",
      withdrawn: "Zurückgezogen",
    },
    subtitle: "Bewerbungen und Anmeldungen, die mit deinem Konto verknüpft sind",
    title: "Aktuelle Aktivität",
    unspecifiedStatus: "Nicht angegeben",
  },
} satisfies Record<LanguageCode, ActivityCopy>;

const localeByLanguage = {
  ro: "ro-RO",
  en: "en-US",
  de: "de-DE",
} satisfies Record<LanguageCode, string>;

type RecentActivityCardProps = {
  style?: StyleProp<ViewStyle>;
};

type RecentActivityItem = {
  context: { key: ActivityContextKey; value: string } | null;
  courseId: string | null;
  id: string;
  status: string;
  timestamp: string;
  title: string | null;
  type: ActivityTypeKey;
};

export default function RecentActivityCard({
  style,
}: RecentActivityCardProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const enrollmentMap = useCourseEnrollmentMap(userId);
  const copy = copyByLanguage[language];
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [failedSourceCount, setFailedSourceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const activityRequestId = useRef(0);

  const loadActivity = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setFailedSourceCount(0);
      setLoading(false);
      return;
    }

    const activeUserId = userId;
    const requestId = ++activityRequestId.current;
    setLoading(true);
    setFailedSourceCount(0);

    try {
      const results = await Promise.allSettled([
        listWorkerApplications(),
        listCompanyApplications(),
        fetchCachedCourseEnrollments(activeUserId),
        listProviderCourseEnrollments(),
      ]);

      if (activityRequestId.current !== requestId) {
        return;
      }

      const [
        workerApplications,
        companyApplications,
        userEnrollments,
        providerEnrollments,
      ] = results;
      const normalizedItems = [
        ...collectFulfilled(workerApplications, normalizeWorkerApplication),
        ...collectFulfilled(companyApplications, normalizeCompanyApplication),
        ...collectFulfilled(userEnrollments, normalizeUserEnrollment),
        ...collectFulfilled(providerEnrollments, normalizeProviderEnrollment),
      ].sort(compareActivityDescending);

      setItems(normalizedItems);
      setFailedSourceCount(
        results.filter((result) => result.status === "rejected").length
      );
    } catch {
      if (activityRequestId.current === requestId) {
        setItems([]);
        setFailedSourceCount(activitySourceCount);
      }
    } finally {
      if (activityRequestId.current === requestId) {
        setLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadActivity();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      activityRequestId.current += 1;
    };
  }, [loadActivity]);

  const visibleItems = useMemo(
    () => {
      const synchronizedItems = items.map((item) => {
          if (item.type !== "userEnrollment" || !item.courseId) {
            return item;
          }

          const enrollment = enrollmentMap.get(item.courseId);

          if (!enrollment || enrollment.status === item.status) {
            return item;
          }

          return {
            ...item,
            status: enrollment.status,
            timestamp: enrollment.updated_at ?? item.timestamp,
          };
        });
      const visibleIds = new Set(synchronizedItems.map((item) => item.id));

      for (const enrollment of enrollmentMap.values()) {
        const itemId = `user-enrollment:${enrollment.enrollment_id}`;

        if (visibleIds.has(itemId)) {
          continue;
        }

        const newItem = normalizeEnrollmentSnapshot(enrollment);

        if (newItem) {
          synchronizedItems.push(newItem);
        }
      }

      return synchronizedItems
        .sort(compareActivityDescending)
        .slice(0, maximumVisibleItems);
    },
    [enrollmentMap, items]
  );

  const allSourcesFailed = failedSourceCount === activitySourceCount;
  const hasPartialError =
    failedSourceCount > 0 && failedSourceCount < activitySourceCount;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.headingWrap}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <View accessibilityLiveRegion="polite" style={styles.stateContainer}>
          <ActivityIndicator color={Colors.brand} size="small" />
          <Text style={styles.stateText}>{copy.loading}</Text>
        </View>
      ) : allSourcesFailed ? (
        <View accessibilityLiveRegion="polite" style={styles.errorContainer}>
          <Text style={styles.errorText}>{copy.error}</Text>
          <RabAIButton
            onPress={() => void loadActivity()}
            size="sm"
            title={copy.retry}
            variant="outline"
          />
        </View>
      ) : (
        <>
          {hasPartialError ? (
            <View
              accessibilityLiveRegion="polite"
              style={styles.warningContainer}
            >
              <Text style={styles.warningText}>{copy.partialError}</Text>
              <RabAIButton
                onPress={() => void loadActivity()}
                size="sm"
                title={copy.retry}
                variant="outline"
              />
            </View>
          ) : null}

          {visibleItems.length > 0 ? (
            <View style={styles.activityList}>
              {visibleItems.map((item, index) => (
                <ActivityRow
                  isLast={index === visibleItems.length - 1}
                  item={item}
                  key={item.id}
                  language={language}
                  copy={copy}
                />
              ))}
            </View>
          ) : (
            <View style={styles.stateContainer}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.stateText}>{copy.emptyText}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function ActivityRow({
  copy,
  isLast,
  item,
  language,
}: {
  copy: ActivityCopy;
  isLast: boolean;
  item: RecentActivityItem;
  language: LanguageCode;
}) {
  return (
    <View style={[styles.activityRow, isLast && styles.activityRowLast]}>
      <View style={styles.activityBody}>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text numberOfLines={1} style={styles.typeBadgeText}>
              {copy.activityTypes[item.type]}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text numberOfLines={1} style={styles.statusBadgeText}>
              {formatStatus(item.status, copy)}
            </Text>
          </View>
        </View>

        {item.title ? (
          <Text numberOfLines={2} style={styles.activityTitle}>
            {item.title}
          </Text>
        ) : null}
        {item.context ? (
          <Text numberOfLines={1} style={styles.activityContext}>
            {copy.contexts[item.context.key]}: {item.context.value}
          </Text>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.activityDate}>
        {formatActivityDate(item.timestamp, language, copy.dateUnavailable)}
      </Text>
    </View>
  );
}

function collectFulfilled<T>(
  result: PromiseSettledResult<T[]>,
  normalize: (value: T) => RecentActivityItem
) {
  return result.status === "fulfilled" ? result.value.map(normalize) : [];
}

function normalizeWorkerApplication(
  application: WorkerApplication
): RecentActivityItem {
  return {
    context: readText(application.company_name)
      ? { key: "company", value: application.company_name.trim() }
      : null,
    courseId: null,
    id: `worker-application:${application.application_id}`,
    status: application.status,
    timestamp: selectTimestamp(application.updated_at, application.created_at),
    title: readText(application.job_title),
    type: "workerApplication",
  };
}

function normalizeCompanyApplication(
  application: CompanyApplication
): RecentActivityItem {
  return {
    context: readText(application.worker_name)
      ? { key: "candidate", value: application.worker_name.trim() }
      : null,
    courseId: null,
    id: `company-application:${application.application_id}`,
    status: application.status,
    timestamp: selectTimestamp(application.updated_at, application.created_at),
    title: readText(application.job_title),
    type: "companyApplication",
  };
}

function normalizeUserEnrollment(
  enrollment: UserCourseEnrollment
): RecentActivityItem {
  return {
    context: readText(enrollment.provider_name)
      ? { key: "provider", value: enrollment.provider_name.trim() }
      : null,
    courseId: enrollment.course_id,
    id: `user-enrollment:${enrollment.enrollment_id}`,
    status: enrollment.status,
    timestamp: selectTimestamp(enrollment.updated_at, enrollment.created_at),
    title: readText(enrollment.course_title),
    type: "userEnrollment",
  };
}

function normalizeProviderEnrollment(
  enrollment: ProviderCourseEnrollment
): RecentActivityItem {
  return {
    context: readText(enrollment.applicant_email)
      ? { key: "participant", value: enrollment.applicant_email?.trim() ?? "" }
      : null,
    courseId: enrollment.course_id,
    id: `provider-enrollment:${enrollment.enrollment_id}`,
    status: enrollment.status,
    timestamp: selectTimestamp(enrollment.updated_at, enrollment.created_at),
    title: readText(enrollment.course_title),
    type: "providerEnrollment",
  };
}

function normalizeEnrollmentSnapshot(
  enrollment: CourseEnrollmentSnapshot
): RecentActivityItem | null {
  if (!enrollment.course_title?.trim() || !enrollment.created_at) {
    return null;
  }

  return {
    context: enrollment.provider_name?.trim()
      ? { key: "provider", value: enrollment.provider_name.trim() }
      : null,
    courseId: enrollment.course_id,
    id: `user-enrollment:${enrollment.enrollment_id}`,
    status: enrollment.status,
    timestamp: selectTimestamp(
      enrollment.updated_at ?? enrollment.created_at,
      enrollment.created_at
    ),
    title: enrollment.course_title.trim(),
    type: "userEnrollment",
  };
}

function readText(value: string | null | undefined) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}

function selectTimestamp(updatedAt: string, createdAt: string) {
  if (isValidDate(updatedAt)) {
    return updatedAt;
  }

  return createdAt;
}

function compareActivityDescending(
  left: RecentActivityItem,
  right: RecentActivityItem
) {
  const timestampDifference =
    readTimestamp(right.timestamp) - readTimestamp(left.timestamp);

  return timestampDifference || left.id.localeCompare(right.id);
}

function readTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isValidDate(value: string) {
  return readTimestamp(value) > 0;
}

function formatStatus(value: string, copy: ActivityCopy) {
  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue) {
    return copy.unspecifiedStatus;
  }

  return (
    copy.statuses[normalizedValue] ??
    normalizedValue
      .replace(/[_-]+/g, " ")
      .replace(/^./, (character) => character.toUpperCase())
  );
}

function formatActivityDate(
  value: string,
  language: LanguageCode,
  dateUnavailable: string
) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return dateUnavailable;
  }

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.section,
    width: "100%",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.inline,
  },
  headingWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.heading,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.compact,
  },
  stateContainer: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.control,
    gap: Spacing.md,
    justifyContent: "center",
    minHeight: ControlHeight.large * 2,
    padding: Spacing.five,
  },
  stateText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    textAlign: "center",
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "flex-start",
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    gap: Spacing.control,
    padding: Spacing.three,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.body,
  },
  warningContainer: {
    alignItems: "flex-start",
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    gap: Spacing.control,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  warningText: {
    color: Colors.textBody,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
  activityList: {
    minWidth: 0,
  },
  activityRow: {
    alignItems: "flex-start",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    justifyContent: "space-between",
    paddingVertical: Spacing.component,
  },
  activityRowLast: {
    borderBottomWidth: 0,
  },
  activityBody: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  typeBadge: {
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  typeBadgeText: {
    color: Colors.goldPressed,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xs,
  },
  statusBadgeText: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  activityTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.md,
  },
  activityContext: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.xs,
  },
  activityDate: {
    color: Colors.textMuted,
    flexShrink: 0,
    fontSize: Typography.caption,
    lineHeight: Typography.lineHeight.compact,
    paddingTop: Spacing.xs,
  },
});
