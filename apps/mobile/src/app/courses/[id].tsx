import CourseEnrollmentConfirmDialog from "@/components/courses/quick-view/CourseEnrollmentConfirmDialog";
import CourseEnrollmentStatusDialog from "@/components/courses/quick-view/CourseEnrollmentStatusDialog";
import CourseEnrollmentWithdrawalConfirmDialog from "@/components/courses/quick-view/CourseEnrollmentWithdrawalConfirmDialog";
import {
  canWithdrawCourseEnrollment,
  formatCourseEnrollmentStatus,
} from "@/components/courses/quick-view/courseEnrollmentStatus";
import {
  fetchCachedCourseDetails,
  fetchCachedCourseEnrollments,
  findExistingCourseEnrollment,
  invalidateCachedCourseEnrollments,
  markCourseEnrollmentLocally,
  markCourseEnrollmentStatusLocally,
  readCachedCourseEnrollments,
  type CourseEnrollmentSnapshot,
} from "@/components/courses/quick-view/courseQuickViewData";
import { useCourseEnrollmentMap } from "@/components/courses/quick-view/useCourseEnrollmentMap";
import { Button, Card, Header, Screen } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  getCourseReturnLabel,
  sanitizeCourseReturnPath,
} from "@/services/courses/courseNavigation";
import {
  enrollInCourse,
  withdrawCourseEnrollment,
  type CourseDetails,
  type UserCourseEnrollment,
} from "@/services/courses/courseService";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { from, id } = useLocalSearchParams<{
    from?: string | string[];
    id?: string | string[];
  }>();
  const { language } = useLanguage();
  const { session, user } = useAuth();
  const courseId = Array.isArray(id) ? id[0] : id;
  const userId = user?.id ?? null;
  const enrollmentMap = useCourseEnrollmentMap(userId);
  const fallbackReturnPath = session ? "/engine" : "/";
  const returnPath = useMemo(
    () => sanitizeCourseReturnPath(from) ?? fallbackReturnPath,
    [fallbackReturnPath, from]
  );
  const returnLabel = useMemo(
    () => getCourseReturnLabel(returnPath),
    [returnPath]
  );
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState<UserCourseEnrollment[]>([]);
  const [loadingEnrollmentContext, setLoadingEnrollmentContext] =
    useState(false);
  const [enrollmentContextVerified, setEnrollmentContextVerified] =
    useState(false);
  const [enrollmentContextError, setEnrollmentContextError] = useState<
    string | null
  >(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [statusDialogNotice, setStatusDialogNotice] = useState<string | null>(
    null
  );
  const [withdrawalConfirmVisible, setWithdrawalConfirmVisible] =
    useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const courseLoadRequestIdRef = useRef(0);
  const enrollmentLoadRequestIdRef = useRef(0);
  const confirmOpenLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const withdrawalOpenLockRef = useRef(false);
  const withdrawalLockRef = useRef(false);
  const withdrawalReturnsToStatusRef = useRef(false);
  const existingEnrollment = useMemo<CourseEnrollmentSnapshot | null>(() => {
    if (!courseId || !userId) {
      return null;
    }

    return (
      enrollmentMap.get(courseId) ??
      findExistingCourseEnrollment(userId, courseId, enrollments)
    );
  }, [courseId, enrollmentMap, enrollments, userId]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      courseLoadRequestIdRef.current += 1;
      enrollmentLoadRequestIdRef.current += 1;
      confirmOpenLockRef.current = false;
      submitLockRef.current = false;
      withdrawalOpenLockRef.current = false;
      withdrawalLockRef.current = false;
      withdrawalReturnsToStatusRef.current = false;
    };
  }, []);

  const loadCourse = useCallback(
    async (force = false) => {
      const requestId = courseLoadRequestIdRef.current + 1;
      courseLoadRequestIdRef.current = requestId;

      if (!courseId || !isUuid(courseId)) {
        setCourse(null);
        setError("Cursul nu mai este disponibil.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const nextCourse = await fetchCachedCourseDetails(courseId, force);

        if (
          !mountedRef.current ||
          courseLoadRequestIdRef.current !== requestId
        ) {
          return;
        }

        setCourse(nextCourse);

        if (!nextCourse) {
          setError("Cursul nu mai este disponibil.");
        }
      } catch {
        if (
          mountedRef.current &&
          courseLoadRequestIdRef.current === requestId
        ) {
          setCourse(null);
          setError("Cursul nu mai este disponibil.");
        }
      } finally {
        if (
          mountedRef.current &&
          courseLoadRequestIdRef.current === requestId
        ) {
          setLoading(false);
        }
      }
    },
    [courseId]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCourse();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      courseLoadRequestIdRef.current += 1;
    };
  }, [loadCourse]);

  const loadEnrollmentContext = useCallback(
    async (nextUserId: string, force = false) => {
      const requestId = enrollmentLoadRequestIdRef.current + 1;
      enrollmentLoadRequestIdRef.current = requestId;
      setLoadingEnrollmentContext(true);
      setEnrollmentContextError(null);
      setEnrollmentContextVerified(false);

      try {
        const nextEnrollments = await fetchCachedCourseEnrollments(
          nextUserId,
          force
        );

        if (
          !mountedRef.current ||
          enrollmentLoadRequestIdRef.current !== requestId
        ) {
          return null;
        }

        const nextExistingEnrollment = courseId
          ? findExistingCourseEnrollment(
              nextUserId,
              courseId,
              nextEnrollments
            )
          : null;

        setEnrollments(nextEnrollments);
        setEnrollmentContextVerified(true);
        return nextExistingEnrollment;
      } catch (nextError) {
        if (
          mountedRef.current &&
          enrollmentLoadRequestIdRef.current === requestId
        ) {
          setEnrollmentContextError(
            readError(
              nextError,
              "Nu am putut verifica înscrierile existente."
            )
          );
        }

        return null;
      } finally {
        if (
          mountedRef.current &&
          enrollmentLoadRequestIdRef.current === requestId
        ) {
          setLoadingEnrollmentContext(false);
        }
      }
    },
    [courseId]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      enrollmentLoadRequestIdRef.current += 1;
      setEnrollments([]);
      setEnrollmentContextError(null);
      setEnrollmentContextVerified(false);
      setEnrollmentNotice(null);

      if (!userId || !courseId || !isUuid(courseId)) {
        setLoadingEnrollmentContext(false);
        return;
      }

      const cachedEnrollments = readCachedCourseEnrollments(userId);

      if (cachedEnrollments) {
        setEnrollments(cachedEnrollments);
      }

      void loadEnrollmentContext(userId, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      enrollmentLoadRequestIdRef.current += 1;
    };
  }, [courseId, loadEnrollmentContext, userId]);

  function requestEnrollment() {
    if (
      !courseId ||
      !course ||
      confirmOpenLockRef.current ||
      submitLockRef.current
    ) {
      return;
    }

    if (!session || !userId) {
      router.push(
        buildLoginPath(`/courses/${encodeURIComponent(courseId)}`) as any
      );
      return;
    }

    if (existingEnrollment || !getEnrollmentAvailability(course).available) {
      return;
    }

    confirmOpenLockRef.current = true;
    setSubmissionError(null);
    setConfirmVisible(true);
    void loadEnrollmentContext(userId, true);
  }

  async function submitEnrollment(message: string | null) {
    if (!courseId || !userId || submitLockRef.current) {
      return;
    }

    const currentEnrollment =
      existingEnrollment ??
      findExistingCourseEnrollment(userId, courseId, enrollments);

    if (
      currentEnrollment ||
      enrollmentContextError ||
      loadingEnrollmentContext ||
      !course ||
      !getEnrollmentAvailability(course).available
    ) {
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const enrollmentId = await enrollInCourse(courseId, message);

      if (!mountedRef.current) {
        return;
      }

      markCourseEnrollmentLocally(
        userId,
        courseId,
        enrollmentId,
        {
          courseTitle: course.title,
          locationLabel: course.location_label,
          message,
          providerName: course.provider_name,
        }
      );
      setEnrollmentNotice("Înscrierea a fost trimisă cu succes.");
      confirmOpenLockRef.current = false;
      setConfirmVisible(false);

      invalidateCachedCourseEnrollments(userId);
      void loadEnrollmentContext(userId, true);
    } catch (nextError) {
      if (!mountedRef.current) {
        return;
      }

      const enrollmentError = readEnrollmentError(nextError);

      invalidateCachedCourseEnrollments(userId);
      const refreshedEnrollment = await loadEnrollmentContext(userId, true);

      if (!mountedRef.current) {
        return;
      }

      if (refreshedEnrollment) {
        setEnrollmentNotice(
          `Pentru acest curs există deja o înscriere: ${formatCourseEnrollmentStatus(
            refreshedEnrollment.status
          )}.`
        );
        confirmOpenLockRef.current = false;
        setConfirmVisible(false);
        return;
      }

      setSubmissionError(enrollmentError);
    } finally {
      submitLockRef.current = false;

      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  }

  function requestStatusDialog() {
    if (!existingEnrollment || withdrawalLockRef.current || withdrawing) {
      return;
    }

    setWithdrawalError(null);
    setStatusDialogNotice(null);
    setStatusDialogVisible(true);
  }

  function requestWithdrawal(returnToStatus: boolean) {
    if (
      !existingEnrollment ||
      !canWithdrawCourseEnrollment(existingEnrollment.status) ||
      !enrollmentStatusReady ||
      withdrawalOpenLockRef.current ||
      withdrawalLockRef.current ||
      withdrawing
    ) {
      return;
    }

    withdrawalOpenLockRef.current = true;
    withdrawalReturnsToStatusRef.current = returnToStatus;
    setStatusDialogVisible(false);
    setWithdrawalError(null);
    setWithdrawalConfirmVisible(true);
  }

  async function submitWithdrawal() {
    if (
      !courseId ||
      !userId ||
      !existingEnrollment ||
      !canWithdrawCourseEnrollment(existingEnrollment.status) ||
      withdrawalLockRef.current ||
      withdrawing
    ) {
      return;
    }

    const enrollmentId = existingEnrollment.enrollment_id;
    withdrawalLockRef.current = true;
    setWithdrawing(true);
    setWithdrawalError(null);

    try {
      await withdrawCourseEnrollment(enrollmentId);

      if (!mountedRef.current) {
        return;
      }

      markCourseEnrollmentStatusLocally(
        userId,
        courseId,
        enrollmentId,
        "withdrawn",
        existingEnrollment
      );

      setEnrollmentNotice("Înscrierea a fost retrasă cu succes.");
      setStatusDialogNotice("Cererea a fost retrasă și păstrată în istoric.");
      setWithdrawalConfirmVisible(false);
      setStatusDialogVisible(true);
      withdrawalOpenLockRef.current = false;
      withdrawalReturnsToStatusRef.current = false;

      invalidateCachedCourseEnrollments(userId);
      void loadEnrollmentContext(userId, true);
      void loadCourse(true);
    } catch (nextError) {
      if (!mountedRef.current) {
        return;
      }

      const withdrawalFailure = readWithdrawalError(nextError);

      invalidateCachedCourseEnrollments(userId);
      const refreshedEnrollment = await loadEnrollmentContext(userId, true);

      if (!mountedRef.current) {
        return;
      }

      if (refreshedEnrollment?.status === "withdrawn") {
        setEnrollmentNotice("Înscrierea a fost retrasă cu succes.");
        setStatusDialogNotice(
          "Cererea a fost retrasă și păstrată în istoric."
        );
        setWithdrawalError(null);
        setWithdrawalConfirmVisible(false);
        setStatusDialogVisible(true);
        withdrawalOpenLockRef.current = false;
        withdrawalReturnsToStatusRef.current = false;
        void loadCourse(true);
        return;
      }

      if (
        refreshedEnrollment?.status === "accepted" ||
        refreshedEnrollment?.status === "rejected"
      ) {
        setWithdrawalError(null);
        setStatusDialogNotice(null);
        setWithdrawalConfirmVisible(false);
        setStatusDialogVisible(true);
        withdrawalOpenLockRef.current = false;
        withdrawalReturnsToStatusRef.current = false;
        return;
      }

      setWithdrawalError(withdrawalFailure);
    } finally {
      withdrawalLockRef.current = false;

      if (mountedRef.current) {
        setWithdrawing(false);
      }
    }
  }

  const enrollmentAvailability = getEnrollmentAvailability(course);
  const enrollmentStatusLabel = existingEnrollment
    ? formatCourseEnrollmentStatus(existingEnrollment.status)
    : null;
  const enrollmentStatusReady =
    enrollmentContextVerified &&
    !loadingEnrollmentContext &&
    !enrollmentContextError;
  const withdrawalEligible = existingEnrollment
    ? canWithdrawCourseEnrollment(existingEnrollment.status)
    : false;
  const enrollmentButtonLabel =
    !enrollmentAvailability.available && enrollmentAvailability.label
      ? enrollmentAvailability.label
      : submitting
        ? "Se trimite…"
        : loadingEnrollmentContext
          ? "Se verifică…"
          : "Înscrie-te";

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(returnPath as any)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{returnLabel}</Text>
          </Pressable>
        </View>

        {loading ? (
          <>
            <Header title="Se incarca cursul" subtitle="Verificam detaliile cursului." />
            <Card>
              <Text style={styles.mutedText}>Se incarca...</Text>
            </Card>
          </>
        ) : error ? (
          <>
            <Header title="Curs indisponibil" subtitle="Acest curs nu poate fi afisat momentan." />
            <Card>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          </>
        ) : course ? (
          <>
            <Header
              title={course.title}
              subtitle={formatCourseSubtitle(course)}
            />

            <Card title="Detalii curs">
              <View style={styles.infoGrid}>
                <InfoLine label="Provider" value={course.provider_name} />
                <InfoLine label="Categorie" value={localizedCategory(course, language)} />
                <InfoLine label="Locație" value={formatLocation(course)} />
                <InfoLine label="Mod" value={formatDeliveryMode(course.delivery_mode)} />
                <InfoLine label="Limbă" value={formatLanguage(course.language_code)} />
                <InfoLine label="Preț" value={formatPrice(course)} />
                <InfoLine label="Durată" value={formatDuration(course)} />
                <InfoLine label="Nivel" value={formatLevel(course.level)} />
                <InfoLine label="Start" value={formatDate(course.start_date, language)} />
                <InfoLine label="Final" value={formatDate(course.end_date, language)} />
                <InfoLine
                  label="Deadline înscriere"
                  value={formatDate(course.enrollment_deadline, language)}
                />
                <InfoLine label="Capacitate" value={formatCapacity(course)} />
                <InfoLine
                  label="Locuri disponibile"
                  value={formatAvailableSpots(course)}
                />
                <InfoLine
                  label="Certificat"
                  value={formatCertificate(course.certificate_available)}
                />
              </View>
            </Card>

            {hasText(course.description) ? (
              <Card title="Descriere">
                <Text style={styles.description}>{course.description.trim()}</Text>
              </Card>
            ) : null}

            {hasProviderDetails(course) ? (
              <Card title="Provider">
                {hasText(course.provider_description) ? (
                  <Text style={styles.description}>
                    {course.provider_description.trim()}
                  </Text>
                ) : null}
                <View style={styles.providerContactGrid}>
                  <InfoLine label="Website" value={course.provider_website} />
                  <InfoLine label="Email" value={course.provider_email} />
                  <InfoLine label="Telefon" value={course.provider_phone} />
                </View>
              </Card>
            ) : null}

            {enrollmentNotice ? (
              <Text accessibilityRole="alert" style={styles.successText}>
                {enrollmentNotice}
              </Text>
            ) : null}
            {existingEnrollment && enrollmentStatusLabel ? (
              <View
                accessibilityLiveRegion="polite"
                style={styles.enrollmentStatusRow}
              >
                <Text style={styles.statusText}>Înscriere existentă</Text>
                <View style={styles.enrollmentStatusBadge}>
                  <Text style={styles.enrollmentStatusBadgeText}>
                    {enrollmentStatusLabel}
                  </Text>
                </View>
              </View>
            ) : null}

            {existingEnrollment ? (
              <View style={styles.enrollmentActions}>
                <View style={styles.enrollmentActionItem}>
                  <Button title="Vezi starea" onPress={requestStatusDialog} />
                </View>
                {withdrawalEligible ? (
                  <Pressable
                    accessibilityHint="Deschide confirmarea; înscrierea nu este retrasă la primul click."
                    accessibilityLabel={`Retrage înscrierea la cursul ${course.title}`}
                    accessibilityRole="button"
                    accessibilityState={{
                      busy: loadingEnrollmentContext,
                      disabled: !enrollmentStatusReady,
                    }}
                    disabled={!enrollmentStatusReady}
                    onPress={() => requestWithdrawal(false)}
                    style={({ pressed }) => [
                      styles.withdrawButton,
                      !enrollmentStatusReady && styles.withdrawButtonDisabled,
                      enrollmentStatusReady &&
                        pressed &&
                        styles.withdrawButtonPressed,
                    ]}
                    testID="course-details-request-withdrawal"
                  >
                    <Text style={styles.withdrawButtonText}>
                      Retrage înscrierea
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Button
                disabled={
                  submitting ||
                  loadingEnrollmentContext ||
                  !enrollmentAvailability.available
                }
                title={enrollmentButtonLabel}
                onPress={requestEnrollment}
              />
            )}
          </>
        ) : null}
      </ScrollView>

      {course && confirmVisible ? (
        <CourseEnrollmentConfirmDialog
          alreadyEnrolled={Boolean(existingEnrollment)}
          courseDetailsError={error || null}
          courseDetailsLoading={loading}
          courseTitle={course.title}
          courseUnavailable={!enrollmentAvailability.available}
          enrollmentContextError={enrollmentContextError}
          existingEnrollmentStatusLabel={enrollmentStatusLabel}
          loadingEnrollmentContext={loadingEnrollmentContext}
          onCancel={() => {
            if (!submitLockRef.current && !submitting) {
              confirmOpenLockRef.current = false;
              setConfirmVisible(false);
              setSubmissionError(null);
            }
          }}
          onConfirm={(message) => void submitEnrollment(message)}
          onRetryCourseDetails={() => void loadCourse(true)}
          onRetryEnrollmentContext={() => {
            if (userId) {
              void loadEnrollmentContext(userId, true);
            }
          }}
          providerName={course.provider_name}
          submissionError={submissionError}
          submitting={submitting}
          visible
        />
      ) : null}

      {course && existingEnrollment && statusDialogVisible ? (
        <CourseEnrollmentStatusDialog
          courseTitle={course.title}
          enrollment={existingEnrollment}
          notice={statusDialogNotice}
          onClose={() => {
            if (!withdrawalLockRef.current && !withdrawing) {
              setStatusDialogVisible(false);
              setStatusDialogNotice(null);
            }
          }}
          onRetryWithdrawalVerification={() => {
            if (userId) {
              void loadEnrollmentContext(userId, true);
            }
          }}
          onRequestWithdrawal={() => requestWithdrawal(true)}
          providerName={course.provider_name}
          visible
          withdrawalDisabled={!enrollmentStatusReady}
          withdrawalVerificationError={enrollmentContextError}
          withdrawalVerificationLoading={loadingEnrollmentContext}
        />
      ) : null}

      {course &&
      existingEnrollment &&
      withdrawalConfirmVisible &&
      withdrawalEligible ? (
        <CourseEnrollmentWithdrawalConfirmDialog
          courseTitle={course.title}
          error={withdrawalError}
          onCancel={() => {
            if (!withdrawalLockRef.current && !withdrawing) {
              withdrawalOpenLockRef.current = false;
              setWithdrawalConfirmVisible(false);
              setWithdrawalError(null);

              if (withdrawalReturnsToStatusRef.current) {
                setStatusDialogVisible(true);
              }

              withdrawalReturnsToStatusRef.current = false;
            }
          }}
          onConfirm={() => void submitWithdrawal()}
          providerName={course.provider_name}
          submitting={withdrawing}
          visible
        />
      ) : null}
    </Screen>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  const visibleValue = value?.trim();

  if (!visibleValue) {
    return null;
  }

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{visibleValue}</Text>
    </View>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function localizedCategory(course: CourseDetails, language: string) {
  if (language === "de") {
    return course.category_name_de?.trim() ?? course.category_name_ro?.trim() ?? "";
  }

  if (language === "en") {
    return course.category_name_en?.trim() ?? course.category_name_ro?.trim() ?? "";
  }

  return course.category_name_ro?.trim() ?? "";
}

function formatLocation(course: CourseDetails) {
  if (course.delivery_mode === "online") {
    return "Online";
  }

  if (!course.location_id) {
    return "";
  }

  return (
    course.location_label?.trim() ||
    [course.postal_code, course.city, course.state]
      .filter(hasText)
      .map((value) => value.trim())
      .join(" ")
  );
}

function formatDeliveryMode(value: string | null) {
  if (value === "online") {
    return "Online";
  }

  if (value === "onsite") {
    return "La locație";
  }

  if (value === "hybrid") {
    return "Hibrid";
  }

  return "";
}

function formatLanguage(value: string | null) {
  if (value === "ro") {
    return "Română";
  }

  if (value === "en") {
    return "Engleză";
  }

  if (value === "de") {
    return "Germană";
  }

  return value?.trim().toLocaleUpperCase() ?? "";
}

function formatPrice(course: CourseDetails) {
  const currency = course.currency_code?.trim();

  if (course.price_amount === null || !currency) {
    return "";
  }

  return `${formatNumber(course.price_amount, 2)} ${currency}`;
}

function formatDuration(course: CourseDetails) {
  if (!course.duration_value || !course.duration_unit) {
    return "";
  }

  const unitByValue: Record<string, string> = {
    days: "zile",
    hours: "ore",
    months: "luni",
    weeks: "săptămâni",
  };
  const unit = unitByValue[course.duration_unit];

  return unit ? `${course.duration_value} ${unit}` : "";
}

function formatLevel(value: string | null) {
  if (value === "beginner") {
    return "Începător";
  }

  if (value === "intermediate") {
    return "Intermediar";
  }

  if (value === "advanced") {
    return "Avansat";
  }

  if (value === "all_levels") {
    return "Toate nivelurile";
  }

  return "";
}

function formatDate(value: string | null, language: string) {
  if (!value) {
    return "";
  }

  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const locale =
    language === "de" ? "de-DE" : language === "en" ? "en-US" : "ro-RO";

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAvailableSpots(course: CourseDetails) {
  if (course.available_spots === null) {
    return "";
  }

  return course.capacity === null
    ? formatNumber(course.available_spots)
    : `${formatNumber(course.available_spots)} din ${formatNumber(
        course.capacity
      )}`;
}

function formatCapacity(course: CourseDetails) {
  return course.capacity === null ? "" : formatNumber(course.capacity);
}

function formatCertificate(value: boolean | null) {
  return value === null ? "" : value ? "Da" : "Nu";
}

function formatCourseSubtitle(course: CourseDetails) {
  return [course.provider_name.trim(), formatLocation(course)]
    .filter(Boolean)
    .join(" · ");
}

function hasProviderDetails(course: CourseDetails) {
  return [
    course.provider_description,
    course.provider_website,
    course.provider_email,
    course.provider_phone,
  ].some(hasText);
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function parseDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3])
      )
    : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits,
  }).format(value);
}

function getEnrollmentAvailability(course: CourseDetails | null) {
  if (!course) {
    return { available: false, label: null };
  }

  if (course.available_spots !== null && course.available_spots <= 0) {
    return { available: false, label: "Curs ocupat" };
  }

  const deadline = readIsoDate(course.enrollment_deadline);

  if (deadline && deadline < readTodayIsoDate()) {
    return { available: false, label: "Înscrieri închise" };
  }

  return { available: true, label: null };
}

function readIsoDate(value: string | null) {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function readTodayIsoDate() {
  const today = new Date();
  const year = String(today.getFullYear()).padStart(4, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readEnrollmentError(error: unknown) {
  const message = readError(
    error,
    "Nu am putut trimite înscrierea. Încearcă din nou."
  );
  const normalizedMessage = message.toLocaleLowerCase();

  if (normalizedMessage.includes("already enrolled")) {
    return "Pentru acest curs există deja o înscriere.";
  }

  if (normalizedMessage.includes("not available")) {
    return "Cursul nu mai este disponibil pentru înscriere.";
  }

  if (normalizedMessage.includes("course is full")) {
    return "Nu mai sunt locuri disponibile la acest curs.";
  }

  if (normalizedMessage.includes("authentication is required")) {
    return "Autentificarea este necesară pentru înscriere.";
  }

  return message;
}

function readWithdrawalError(error: unknown) {
  const message = readError(
    error,
    "Nu am putut retrage înscrierea. Încearcă din nou."
  );
  const normalizedMessage = message.toLocaleLowerCase();

  if (
    normalizedMessage.includes("only submitted or viewed") ||
    normalizedMessage.includes("no longer eligible")
  ) {
    return "Statusul s-a schimbat, iar înscrierea nu mai poate fi retrasă.";
  }

  if (normalizedMessage.includes("not found for the current user")) {
    return "Înscrierea nu a fost găsită în contul curent.";
  }

  if (normalizedMessage.includes("authentication is required")) {
    return "Autentificarea este necesară pentru retragerea înscrierii.";
  }

  if (normalizedMessage.includes("was not confirmed")) {
    return "Serverul nu a confirmat retragerea. Starea va fi reverificată.";
  }

  return message;
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
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
  backButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  providerContactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
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
  description: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 25,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  successText: {
    color: Colors.success,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statusText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  enrollmentStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  enrollmentStatusBadge: {
    backgroundColor: Colors.brandSoft,
    borderColor: "#C9D9FF",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  enrollmentStatusBadgeText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  enrollmentActions: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  enrollmentActionItem: {
    flexGrow: 1,
    minWidth: 180,
  },
  withdrawButton: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 180,
    paddingHorizontal: Spacing.three,
  },
  withdrawButtonPressed: {
    opacity: 0.84,
  },
  withdrawButtonDisabled: {
    opacity: 0.55,
  },
  withdrawButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  mutedText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
