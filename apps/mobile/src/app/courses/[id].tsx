import { Button, Card, Header, Screen } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  DEFAULT_COURSE_RETURN_PATH,
  getCourseReturnLabel,
  sanitizeCourseReturnPath,
} from "@/services/courses/courseNavigation";
import {
  enrollInCourse,
  fetchCourseDetails,
  type CourseDetails,
} from "@/services/courses/courseService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { from, id } = useLocalSearchParams<{
    from?: string | string[];
    id?: string | string[];
  }>();
  const { language } = useLanguage();
  const { session } = useAuth();
  const courseId = Array.isArray(id) ? id[0] : id;
  const returnPath = useMemo(
    () => sanitizeCourseReturnPath(from) ?? DEFAULT_COURSE_RETURN_PATH,
    [from]
  );
  const returnLabel = useMemo(
    () => getCourseReturnLabel(returnPath),
    [returnPath]
  );
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      if (!courseId || !isUuid(courseId)) {
        setError("Cursul nu mai este disponibil.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const nextCourse = await fetchCourseDetails(courseId);

        if (!mounted) {
          return;
        }

        setCourse(nextCourse);

        if (!nextCourse) {
          setError("Cursul nu mai este disponibil.");
        }
      } catch {
        if (mounted) {
          setError("Cursul nu mai este disponibil.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCourse();

    return () => {
      mounted = false;
    };
  }, [courseId]);

  async function handleEnroll() {
    if (!courseId) {
      return;
    }

    if (!session) {
      router.push("/login" as any);
      return;
    }

    setEnrolling(true);
    setEnrollError("");

    try {
      const nextEnrollmentId = await enrollInCourse(courseId);
      setEnrollmentId(nextEnrollmentId);
    } catch (nextError) {
      setEnrollError(readError(nextError));
    } finally {
      setEnrolling(false);
    }
  }

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
              subtitle={`${course.provider_name} - ${formatLocation(course)}`}
            />

            <Card title="Detalii curs">
              <View style={styles.infoGrid}>
                <InfoLine label="Provider" value={course.provider_name} />
                <InfoLine label="Categorie" value={localizedCategory(course, language)} />
                <InfoLine label="Locatie" value={formatLocation(course)} />
                <InfoLine label="Mod" value={formatDeliveryMode(course.delivery_mode)} />
                <InfoLine label="Limba" value={formatLanguage(course.language_code)} />
                <InfoLine label="Pret" value={formatPrice(course)} />
                <InfoLine label="Durata" value={formatDuration(course)} />
                <InfoLine label="Nivel" value={formatLevel(course.level)} />
                <InfoLine label="Start" value={formatDate(course.start_date)} />
                <InfoLine label="Final" value={formatDate(course.end_date)} />
                <InfoLine
                  label="Deadline inscriere"
                  value={formatDate(course.enrollment_deadline)}
                />
                <InfoLine
                  label="Locuri disponibile"
                  value={formatAvailableSpots(course)}
                />
                <InfoLine
                  label="Certificat"
                  value={course.certificate_available ? "Disponibil" : "Nu este specificat"}
                />
              </View>
            </Card>

            <Card title="Descriere">
              <Text style={styles.description}>{course.description}</Text>
            </Card>

            {course.provider_description ||
            course.provider_website ||
            course.provider_email ||
            course.provider_phone ? (
              <Card title="Provider">
                {course.provider_description ? (
                  <Text style={styles.description}>{course.provider_description}</Text>
                ) : null}
                <View style={styles.providerContactGrid}>
                  <InfoLine label="Website" value={course.provider_website} />
                  <InfoLine label="Email" value={course.provider_email} />
                  <InfoLine label="Telefon" value={course.provider_phone} />
                </View>
              </Card>
            ) : null}

            {enrollmentId ? (
              <Text style={styles.successText}>
                Inscriere trimisa. ID inscriere: {enrollmentId}
              </Text>
            ) : null}
            {enrollError ? <Text style={styles.errorText}>{enrollError}</Text> : null}

            <Button
              disabled={enrolling || Boolean(enrollmentId)}
              title={
                enrollmentId
                  ? "Inscriere trimisa"
                  : enrolling
                    ? "Se trimite..."
                    : "Înscrie-te"
              }
              onPress={handleEnroll}
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function InfoLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Nespecificat"}</Text>
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
    return course.category_name_de ?? course.category_name_ro ?? "Nespecificat";
  }

  if (language === "en") {
    return course.category_name_en ?? course.category_name_ro ?? "Nespecificat";
  }

  return course.category_name_ro ?? "Nespecificat";
}

function formatLocation(course: CourseDetails) {
  if (course.delivery_mode === "online") {
    return "Online";
  }

  return course.location_label || "Online";
}

function formatDeliveryMode(value: string | null) {
  if (value === "online") {
    return "Online";
  }

  if (value === "onsite") {
    return "La locatie";
  }

  if (value === "hybrid") {
    return "Hibrid";
  }

  return "Nespecificat";
}

function formatLanguage(value: string | null) {
  if (value === "ro") {
    return "Romana";
  }

  if (value === "en") {
    return "Engleza";
  }

  if (value === "de") {
    return "Germana";
  }

  return "Nespecificat";
}

function formatPrice(course: CourseDetails) {
  if (course.price_amount === null) {
    return "Gratuit / nespecificat";
  }

  return `${formatNumber(course.price_amount)} ${course.currency_code ?? "EUR"}`;
}

function formatDuration(course: CourseDetails) {
  if (!course.duration_value || !course.duration_unit) {
    return "Nespecificat";
  }

  if (course.duration_unit === "hours") {
    return `${course.duration_value} ore`;
  }

  if (course.duration_unit === "days") {
    return `${course.duration_value} zile`;
  }

  if (course.duration_unit === "weeks") {
    return `${course.duration_value} saptamani`;
  }

  return `${course.duration_value} luni`;
}

function formatLevel(value: string | null) {
  if (value === "beginner") {
    return "Incepator";
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

  return "Nespecificat";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Nespecificat";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Nespecificat";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAvailableSpots(course: CourseDetails) {
  if (course.available_spots === null) {
    return "Fara limita specificata";
  }

  return `${course.available_spots} din ${course.capacity}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut procesa inscrierea.";
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
  mutedText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
