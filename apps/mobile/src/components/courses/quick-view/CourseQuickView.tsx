import QuickViewDrawer from "@/components/jobs/quick-view/QuickViewDrawer";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { buildCourseDetailsPath } from "@/services/courses/courseNavigation";
import {
  enrollInCourse,
  type CourseDetails,
  type CourseEnrollmentStatus,
  type SearchCourseResult,
  type UserCourseEnrollment,
} from "@/services/courses/courseService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import CourseDetailSection, {
  CourseDetailGrid,
  CourseDetailItem,
} from "./CourseDetailSection";
import CourseEnrollmentConfirmDialog from "./CourseEnrollmentConfirmDialog";
import CourseProviderPublicSummary from "./CourseProviderPublicSummary";
import CourseQuickViewHeader from "./CourseQuickViewHeader";
import {
  fetchCachedCourseDetails,
  fetchCachedCourseEnrollments,
  findExistingCourseEnrollment,
  invalidateCachedCourseEnrollments,
  markCourseEnrollmentLocally,
  readCachedCourseDetails,
  readCachedCourseEnrollments,
  type CourseEnrollmentSnapshot,
} from "./courseQuickViewData";
import type { CourseQuickViewSelection } from "./useCourseQuickView";

type CourseQuickViewProps = {
  onClose: () => void;
  selection: CourseQuickViewSelection | null;
};

type CourseQuickViewPanelProps = {
  onClose: () => void;
  selection: CourseQuickViewSelection;
};

type DetailsState = "error" | "loaded" | "loading" | "missing";

type DetailItem = {
  label: string;
  value: string;
};

type EnrollmentAvailability = {
  available: boolean;
  label: string | null;
};

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function CourseQuickView({
  onClose,
  selection,
}: CourseQuickViewProps) {
  const { user } = useAuth();

  if (!selection) {
    return null;
  }

  return (
    <CourseQuickViewPanel
      key={`${selection.course.course_id}:${selection.requestId}:${user?.id ?? "public"}`}
      onClose={onClose}
      selection={selection}
    />
  );
}

function CourseQuickViewPanel({
  onClose,
  selection,
}: CourseQuickViewPanelProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { loading: authLoading, session, user } = useAuth();
  const { width } = useWindowDimensions();
  const course = selection.course;
  const userId = user?.id ?? null;
  const initialDetails = readCachedCourseDetails(course.course_id);
  const initialEnrollments = userId
    ? readCachedCourseEnrollments(userId)
    : undefined;
  const [details, setDetails] = useState<CourseDetails | null>(
    initialDetails ?? null
  );
  const [detailsState, setDetailsState] = useState<DetailsState>(
    initialDetails === undefined
      ? "loading"
      : initialDetails
        ? "loaded"
        : "missing"
  );
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<UserCourseEnrollment[]>(
    initialEnrollments ?? []
  );
  const [loadingEnrollments, setLoadingEnrollments] = useState(
    Boolean(userId && (!initialEnrollments || selection.intent === "enroll"))
  );
  const [enrollmentContextError, setEnrollmentContextError] = useState<
    string | null
  >(null);
  const [manualConfirmVisible, setManualConfirmVisible] = useState(false);
  const [initialConfirmDismissed, setInitialConfirmDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const confirmOpenLockRef = useRef(false);
  const submitLockRef = useRef(false);
  const isPhone = width < 640;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadDetails = useCallback(async (courseId: string, force = false) => {
    setDetailsState("loading");
    setDetailsError(null);

    try {
      const nextDetails = await fetchCachedCourseDetails(courseId, force);

      if (!mountedRef.current) {
        return;
      }

      setDetails(nextDetails);
      setDetailsState(nextDetails ? "loaded" : "missing");
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setDetails(null);
      setDetailsState("error");
      setDetailsError(
        readError(error, "Nu am putut încărca detaliile cursului.")
      );
    }
  }, []);

  const loadEnrollments = useCallback(
    async (nextUserId: string, force = false) => {
      setLoadingEnrollments(true);
      setEnrollmentContextError(null);

      try {
        const nextEnrollments = await fetchCachedCourseEnrollments(
          nextUserId,
          force
        );

        if (!mountedRef.current) {
          return;
        }

        setEnrollments(nextEnrollments);
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        setEnrollmentContextError(
          readError(error, "Nu am putut verifica înscrierile existente.")
        );
      } finally {
        if (mountedRef.current) {
          setLoadingEnrollments(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (initialDetails !== undefined) {
      return;
    }

    let active = true;

    fetchCachedCourseDetails(course.course_id)
      .then((nextDetails) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setDetails(nextDetails);
        setDetailsState(nextDetails ? "loaded" : "missing");
      })
      .catch((error: unknown) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setDetails(null);
        setDetailsState("error");
        setDetailsError(
          readError(error, "Nu am putut încărca detaliile cursului.")
        );
      });

    return () => {
      active = false;
    };
  }, [course.course_id, initialDetails]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const forceRefresh = selection.intent === "enroll";

    if (initialEnrollments && !forceRefresh) {
      return;
    }

    let active = true;

    fetchCachedCourseEnrollments(userId, forceRefresh)
      .then((nextEnrollments) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setEnrollments(nextEnrollments);
        setLoadingEnrollments(false);
      })
      .catch((error: unknown) => {
        if (!active || !mountedRef.current) {
          return;
        }

        setLoadingEnrollments(false);
        setEnrollmentContextError(
          readError(error, "Nu am putut verifica înscrierile existente.")
        );
      });

    return () => {
      active = false;
    };
  }, [initialEnrollments, selection.intent, userId]);

  useEffect(() => {
    if (selection.intent !== "enroll" || authLoading) {
      return;
    }

    if (!session) {
      const loginPath = buildLoginPath(
        `/courses/${encodeURIComponent(course.course_id)}`
      );
      onClose();
      router.push(loginPath as never);
    }
  }, [authLoading, course.course_id, onClose, router, selection.intent, session]);

  const existingEnrollment = useMemo<CourseEnrollmentSnapshot | null>(() => {
    if (!userId) {
      return null;
    }

    return findExistingCourseEnrollment(
      userId,
      course.course_id,
      enrollments
    );
  }, [course.course_id, enrollments, userId]);
  const enrollmentStatusLabel = existingEnrollment
    ? formatEnrollmentStatus(existingEnrollment.status)
    : null;
  const enrollmentAvailability = getEnrollmentAvailability(details);
  const confirmVisible =
    Boolean(session) &&
    !authLoading &&
    (manualConfirmVisible ||
      (selection.intent === "enroll" && !initialConfirmDismissed));

  const requestClose = useCallback(() => {
    if (submitLockRef.current || submitting) {
      return;
    }

    if (confirmVisible) {
      confirmOpenLockRef.current = false;
      setManualConfirmVisible(false);
      setInitialConfirmDismissed(true);
      setSubmissionError(null);
      return;
    }

    onClose();
  }, [confirmVisible, onClose, submitting]);

  const requestEnrollment = useCallback(() => {
    if (
      authLoading ||
      confirmOpenLockRef.current ||
      submitLockRef.current ||
      submitting ||
      detailsState !== "loaded" ||
      !enrollmentAvailability.available
    ) {
      return;
    }

    if (!session) {
      onClose();
      router.push(
        buildLoginPath(`/courses/${encodeURIComponent(course.course_id)}`) as never
      );
      return;
    }

    if (existingEnrollment) {
      return;
    }

    confirmOpenLockRef.current = true;
    setSubmissionError(null);
    setManualConfirmVisible(true);

    if (userId) {
      void loadEnrollments(userId, true);
    }
  }, [
    authLoading,
    course.course_id,
    detailsState,
    enrollmentAvailability.available,
    existingEnrollment,
    loadEnrollments,
    onClose,
    router,
    session,
    submitting,
    userId,
  ]);

  const submitEnrollment = useCallback(
    async (message: string | null) => {
      if (
        submitLockRef.current ||
        !userId ||
        existingEnrollment ||
        enrollmentContextError ||
        loadingEnrollments ||
        detailsState !== "loaded" ||
        !enrollmentAvailability.available
      ) {
        return;
      }

      submitLockRef.current = true;
      setSubmitting(true);
      setSubmissionError(null);

      try {
        const enrollmentId = await enrollInCourse(course.course_id, message);

        if (!mountedRef.current) {
          return;
        }

        markCourseEnrollmentLocally(userId, course.course_id, enrollmentId);
        setEnrollmentNotice("Înscrierea a fost trimisă cu succes.");
        setManualConfirmVisible(false);
        setInitialConfirmDismissed(true);

        invalidateCachedCourseEnrollments(userId);
        void fetchCachedCourseEnrollments(userId, true)
          .then((nextEnrollments) => {
            if (mountedRef.current) {
              setEnrollments(nextEnrollments);
            }
          })
          .catch(() => {
            // Înscrierea a reușit deja; marcajul local păstrează guard-ul.
          });
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        const enrollmentError = readEnrollmentError(error);

        try {
          invalidateCachedCourseEnrollments(userId);
          const nextEnrollments = await fetchCachedCourseEnrollments(
            userId,
            true
          );

          if (!mountedRef.current) {
            return;
          }

          setEnrollments(nextEnrollments);
          const nextExistingEnrollment = findExistingCourseEnrollment(
            userId,
            course.course_id,
            nextEnrollments
          );

          if (nextExistingEnrollment) {
            setEnrollmentNotice(
              `Pentru acest curs există deja o înscriere: ${formatEnrollmentStatus(
                nextExistingEnrollment.status
              )}.`
            );
            setManualConfirmVisible(false);
            setInitialConfirmDismissed(true);
            return;
          }
        } catch {
          // Păstrează eroarea inițială dacă și reverificarea eșuează.
        }

        setSubmissionError(enrollmentError);
      } finally {
        submitLockRef.current = false;

        if (mountedRef.current) {
          setSubmitting(false);
        }
      }
    },
    [
      course.course_id,
      detailsState,
      enrollmentAvailability.available,
      enrollmentContextError,
      existingEnrollment,
      loadingEnrollments,
      userId,
    ]
  );

  const openFullPage = useCallback(() => {
    const detailsPath = buildCourseDetailsPath(
      course.course_id,
      selection.returnTo
    );
    onClose();
    router.push(detailsPath as never);
  }, [course.course_id, onClose, router, selection.returnTo]);

  const headerDetails = details ?? course;
  const headerMetaItems = buildHeaderMetaItems(headerDetails, language);
  const footerEnrollDisabled =
    authLoading ||
    submitting ||
    detailsState !== "loaded" ||
    !enrollmentAvailability.available ||
    (Boolean(session) && (Boolean(existingEnrollment) || loadingEnrollments));
  const footerEnrollLabel = existingEnrollment
    ? `Înscriere: ${enrollmentStatusLabel}`
    : !enrollmentAvailability.available && enrollmentAvailability.label
      ? enrollmentAvailability.label
      : submitting
        ? "Se trimite…"
        : authLoading || loadingEnrollments
          ? "Se verifică…"
          : detailsState === "loading"
            ? "Se încarcă…"
            : "Înscrie-te";

  return (
    <>
      <QuickViewDrawer
        accessibilityLabel={`Vizualizare rapidă pentru cursul ${course.title}`}
        backdropAccessibilityLabel="Închide vizualizarea rapidă a cursului"
        footer={
          <View style={styles.footerStack}>
            {enrollmentNotice ? (
              <Text accessibilityRole="alert" style={styles.successNotice}>
                {enrollmentNotice}
              </Text>
            ) : enrollmentStatusLabel ? (
              <Text style={styles.enrollmentStatusNotice}>
                Înscriere existentă: {enrollmentStatusLabel}
              </Text>
            ) : null}
            <View
              style={[
                styles.footerActions,
                isPhone && styles.footerActionsPhone,
              ]}
            >
              <Pressable
                accessibilityLabel={`Deschide pagina completă pentru ${course.title}`}
                accessibilityRole="button"
                onPress={openFullPage}
                style={(state) => {
                  const webState = state as WebPressableState;

                  return [
                    styles.secondaryButton,
                    pointerWebStyle,
                    webState.hovered && styles.secondaryButtonHover,
                    webState.focused && styles.buttonFocus,
                    webState.pressed && styles.buttonPressed,
                  ];
                }}
              >
                <Text style={styles.secondaryButtonText}>
                  Deschide pagina completă
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Înscrie-te la cursul ${course.title}`}
                accessibilityRole="button"
                accessibilityState={{
                  busy: submitting,
                  disabled: footerEnrollDisabled,
                }}
                disabled={footerEnrollDisabled}
                onPress={requestEnrollment}
                style={(state) => {
                  const webState = state as WebPressableState;

                  return [
                    styles.primaryButton,
                    pointerWebStyle,
                    footerEnrollDisabled && styles.primaryButtonDisabled,
                    !footerEnrollDisabled &&
                      webState.hovered &&
                      styles.primaryButtonHover,
                    webState.focused && styles.buttonFocus,
                    !footerEnrollDisabled &&
                      webState.pressed &&
                      styles.buttonPressed,
                  ];
                }}
                testID="course-quick-view-enroll"
              >
                <Text style={styles.primaryButtonText}>{footerEnrollLabel}</Text>
              </Pressable>
            </View>
          </View>
        }
        header={
          <CourseQuickViewHeader
            metaItems={headerMetaItems}
            onClose={requestClose}
            providerName={course.provider_name}
            title={course.title}
          />
        }
        onRequestClose={requestClose}
        testID="course-quick-view-drawer"
        visible
      >
        {detailsState === "loading" ? (
          <CourseQuickViewSkeleton />
        ) : detailsState === "error" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>
              Detaliile nu au putut fi încărcate
            </Text>
            <Text style={styles.stateText}>{detailsError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadDetails(course.course_id, true)}
              style={[styles.retryButton, pointerWebStyle]}
            >
              <Text style={styles.retryButtonText}>Reîncearcă</Text>
            </Pressable>
          </View>
        ) : detailsState === "missing" || !details ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Cursul nu mai este disponibil</Text>
            <Text style={styles.stateText}>
              Cursul a expirat sau nu mai este publicat.
            </Text>
          </View>
        ) : (
          <CourseQuickViewContent details={details} language={language} />
        )}
      </QuickViewDrawer>

      {confirmVisible ? (
        <CourseEnrollmentConfirmDialog
          alreadyEnrolled={Boolean(existingEnrollment)}
          courseDetailsError={
            detailsState === "error" ? detailsError : null
          }
          courseDetailsLoading={detailsState === "loading"}
          courseTitle={course.title}
          courseUnavailable={
            detailsState === "missing" || !enrollmentAvailability.available
          }
          enrollmentContextError={enrollmentContextError}
          existingEnrollmentStatusLabel={enrollmentStatusLabel}
          loadingEnrollmentContext={loadingEnrollments}
          onCancel={() => {
            if (!submitLockRef.current && !submitting) {
              confirmOpenLockRef.current = false;
              setManualConfirmVisible(false);
              setInitialConfirmDismissed(true);
              setSubmissionError(null);
            }
          }}
          onConfirm={(message) => void submitEnrollment(message)}
          onRetryCourseDetails={() =>
            void loadDetails(course.course_id, true)
          }
          onRetryEnrollmentContext={() => {
            if (userId) {
              void loadEnrollments(userId, true);
            }
          }}
          providerName={course.provider_name}
          submissionError={submissionError}
          submitting={submitting}
          visible
        />
      ) : null}
    </>
  );
}

function CourseQuickViewContent({
  details,
  language,
}: {
  details: CourseDetails;
  language: LanguageCode;
}) {
  const detailItems = buildCourseDetailItems(details, language);
  const publicationItems = [
    { label: "Publicat", value: formatDate(details.published_at, language) },
    { label: "Expiră", value: formatDate(details.expires_at, language) },
  ].filter(isVisibleDetailItem);

  return (
    <>
      {detailItems.length > 0 ? (
        <CourseDetailSection title="Detalii curs">
          <CourseDetailGrid>
            {detailItems.map((item) => (
              <CourseDetailItem
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </CourseDetailGrid>
        </CourseDetailSection>
      ) : null}

      {details.description.trim() ? (
        <CourseDetailSection title="Descriere completă">
          <CourseDescription value={details.description} />
        </CourseDetailSection>
      ) : null}

      {publicationItems.length > 0 ? (
        <CourseDetailSection title="Publicare">
          <CourseDetailGrid>
            {publicationItems.map((item) => (
              <CourseDetailItem
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </CourseDetailGrid>
        </CourseDetailSection>
      ) : null}

      <CourseProviderPublicSummary
        providerDescription={details.provider_description}
        providerEmail={details.provider_email}
        providerName={details.provider_name}
        providerPhone={details.provider_phone}
        providerWebsite={details.provider_website}
      />
    </>
  );
}

function CourseDescription({ value }: { value: string }) {
  const paragraphs = value
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <View style={styles.descriptionStack}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={`${index}-${paragraph.slice(0, 24)}`}
          selectable
          style={styles.description}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

function CourseQuickViewSkeleton() {
  return (
    <View
      accessibilityLabel="Se încarcă detaliile cursului"
      style={styles.skeletonStack}
    >
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

function buildHeaderMetaItems(
  course: SearchCourseResult | CourseDetails,
  language: LanguageCode
) {
  return [
    { label: "Locație", value: formatLocation(course) },
    { label: "Preț", value: formatPrice(course) },
    { label: "Limbă", value: formatLanguage(course.language_code) },
    { label: "Nivel", value: formatLevel(course.level) },
    { label: "Durată", value: formatDuration(course) },
  ].filter(isVisibleDetailItem);
}

function buildCourseDetailItems(
  details: CourseDetails,
  language: LanguageCode
) {
  return [
    { label: "Categorie", value: localizedCategory(details, language) },
    { label: "Format", value: formatDeliveryMode(details.delivery_mode) },
    { label: "Locație", value: formatLocation(details) },
    { label: "Preț", value: formatPrice(details) },
    { label: "Limbă", value: formatLanguage(details.language_code) },
    { label: "Nivel", value: formatLevel(details.level) },
    { label: "Durată", value: formatDuration(details) },
    { label: "Data începerii", value: formatDate(details.start_date, language) },
    { label: "Data terminării", value: formatDate(details.end_date, language) },
    {
      label: "Deadline înscriere",
      value: formatDate(details.enrollment_deadline, language),
    },
    {
      label: "Capacitate",
      value: details.capacity === null ? "" : formatNumber(details.capacity),
    },
    {
      label: "Locuri disponibile",
      value:
        details.available_spots === null
          ? ""
          : formatNumber(details.available_spots),
    },
    {
      label: "Certificat",
      value:
        details.certificate_available === null
          ? ""
          : details.certificate_available
            ? "Da"
            : "Nu",
    },
  ].filter(isVisibleDetailItem);
}

function isVisibleDetailItem(item: DetailItem): item is DetailItem {
  return Boolean(item.value.trim());
}

function localizedCategory(
  course: SearchCourseResult | CourseDetails,
  language: LanguageCode
) {
  if (language === "de") {
    return course.category_name_de ?? course.category_name_ro ?? "";
  }

  if (language === "en") {
    return course.category_name_en ?? course.category_name_ro ?? "";
  }

  return course.category_name_ro ?? "";
}

function formatLocation(course: SearchCourseResult | CourseDetails) {
  if (course.delivery_mode === "online") {
    return "Online";
  }

  if (!course.location_id) {
    return "";
  }

  return (
    course.location_label?.trim() ||
    [course.postal_code, course.city, course.state].filter(Boolean).join(" ")
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

function formatPrice(course: SearchCourseResult | CourseDetails) {
  const currency = course.currency_code?.trim();

  if (course.price_amount === null || !currency) {
    return "";
  }

  return `${formatNumber(course.price_amount, 2)} ${currency}`;
}

function formatLanguage(value: string | null) {
  if (value === "ro") {
    return "Română";
  }

  if (value === "de") {
    return "Germană";
  }

  if (value === "en") {
    return "Engleză";
  }

  return value?.trim().toLocaleUpperCase() ?? "";
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

function formatDuration(course: SearchCourseResult | CourseDetails) {
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

function formatDate(value: string | null, language: LanguageCode) {
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
    month: "long",
    year: "numeric",
  }).format(date);
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
  return new Intl.NumberFormat("ro-RO", { maximumFractionDigits }).format(value);
}

function getEnrollmentAvailability(
  details: CourseDetails | null
): EnrollmentAvailability {
  if (!details) {
    return { available: true, label: null };
  }

  if (details.available_spots !== null && details.available_spots <= 0) {
    return { available: false, label: "Curs ocupat" };
  }

  const deadline = readIsoDate(details.enrollment_deadline);

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

function formatEnrollmentStatus(status: CourseEnrollmentStatus) {
  const labels: Record<CourseEnrollmentStatus, string> = {
    accepted: "Acceptată",
    rejected: "Respinsă",
    submitted: "Trimisă",
    viewed: "Vizualizată",
    withdrawn: "Retrasă",
  };

  return labels[status];
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

function readError(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

const styles = StyleSheet.create({
  footerStack: {
    gap: Spacing.md,
    minWidth: 0,
  },
  footerActions: {
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 0,
  },
  footerActionsPhone: {
    flexDirection: "column-reverse",
  },
  successNotice: {
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    textAlign: "center",
  },
  enrollmentStatusNotice: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    textAlign: "center",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  secondaryButtonHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  secondaryButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonHover: {
    backgroundColor: Colors.brandDeep,
  },
  primaryButtonDisabled: {
    backgroundColor: "#AAB7D4",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  buttonFocus: {
    borderColor: Colors.brandDeep,
    borderWidth: 2,
  },
  buttonPressed: {
    opacity: 0.84,
  },
  description: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: 25,
  },
  descriptionStack: {
    gap: Spacing.xl,
    minWidth: 0,
  },
  stateCard: {
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.five,
  },
  stateTitle: {
    color: Colors.text,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.extraBold,
  },
  stateText: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  retryButton: {
    alignItems: "center",
    backgroundColor: Colors.brandSoft,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  retryButtonText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  skeletonStack: {
    gap: Spacing.three,
    maxWidth: "100%",
    minWidth: 0,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.xl,
    maxWidth: "100%",
    padding: Spacing.five,
  },
  skeletonTitle: {
    backgroundColor: "#E9EEF8",
    borderRadius: Radius.round,
    height: 18,
    width: "42%",
  },
  skeletonLine: {
    backgroundColor: "#F0F3F9",
    borderRadius: Radius.round,
    height: 14,
    width: "100%",
  },
  skeletonLineShort: {
    backgroundColor: "#F0F3F9",
    borderRadius: Radius.round,
    height: 14,
    width: "72%",
  },
});
