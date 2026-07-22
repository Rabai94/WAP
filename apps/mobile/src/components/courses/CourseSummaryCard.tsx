import type { LanguageCode } from "@/i18n/translations";
import type { CourseEnrollmentSnapshot } from "@/components/courses/quick-view/courseQuickViewData";
import { formatCourseEnrollmentStatus } from "@/components/courses/quick-view/courseEnrollmentStatus";
import type { SearchCourseResult } from "@/services/courses/courseService";
import {
  ListingRow,
  RabAIBadge,
  RabAIButton,
  type ListingRowMetaItem,
  type RabAIBadgeTone,
} from "@/components/ui";
import { Colors, ControlHeight, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type CourseSummaryCardVariant = "list" | "compact";

export type CourseSummaryCardAction = "enroll" | "status" | "view";

type CourseSummaryCardProps = {
  course: SearchCourseResult;
  enrollment?: CourseEnrollmentSnapshot | null;
  language?: LanguageCode;
  onAction: (
    course: SearchCourseResult,
    action: CourseSummaryCardAction
  ) => void;
  returnLabel?: string;
  variant?: CourseSummaryCardVariant;
};

export default function CourseSummaryCard({
  course,
  enrollment = null,
  language = "ro",
  onAction,
  returnLabel,
  variant = "list",
}: CourseSummaryCardProps) {
  const isCompact = variant === "compact";
  const categoryLabel = getCategoryLabel(course, language);
  const location = formatLocation(course);
  const deliveryMode = formatDeliveryMode(course.delivery_mode);
  const price = formatPrice(course);
  const duration = formatDuration(course);
  const startDate = formatDate(course.start_date, language);
  const enrollmentStatusLabel = enrollment
    ? formatCourseEnrollmentStatus(enrollment.status)
    : null;
  const courseLanguage = formatLanguage(course.language_code);
  const meta: ListingRowMetaItem[] = [];

  if (deliveryMode) {
    meta.push({ label: "Format", value: deliveryMode });
  }

  if (price) {
    meta.push({ label: "Preț", value: price });
  }

  if (duration) {
    meta.push({ label: "Durată", value: duration });
  }

  if (courseLanguage) {
    meta.push({ label: "Limbă", value: courseLanguage });
  }

  if (course.level) {
    meta.push({ label: "Nivel", value: humanize(course.level) });
  }

  if (startDate) {
    meta.push({ label: "Începe", value: startDate });
  }

  return (
    <ListingRow
      accessibilityLabel={`${course.title}, ${course.provider_name}`}
      actions={
        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
          <CourseAction
            accessibilityHint={
              returnLabel
                ? `Deschide vizualizarea rapidă. ${returnLabel}.`
                : "Deschide vizualizarea rapidă a cursului."
            }
            accessibilityLabel={`Vezi cursul ${course.title}`}
            label="Vezi cursul"
            onPress={() => onAction(course, "view")}
            tone="secondary"
          />
          <CourseAction
            accessibilityHint={
              enrollment
                ? "Deschide vizualizarea rapidă și detaliile înscrierii."
                : "Deschide confirmarea înainte de trimiterea înscrierii."
            }
            accessibilityLabel={
              enrollment
                ? `Vezi starea înscrierii la cursul ${course.title}`
                : `Înscrie-te la cursul ${course.title}`
            }
            label={enrollment ? "Vezi starea" : "Înscrie-te"}
            onPress={() =>
              onAction(course, enrollment ? "status" : "enroll")
            }
            testID={
              enrollment
                ? `course-enrollment-status-${course.course_id}`
                : `course-enroll-${course.course_id}`
            }
            tone="primary"
          />
        </View>
      }
      badges={
        <View style={styles.badgeRow}>
          {enrollment && enrollmentStatusLabel ? (
            <RabAIBadge
              label={enrollmentStatusLabel}
              tone={courseEnrollmentTone(enrollment.status)}
            />
          ) : deliveryMode ? (
            <RabAIBadge label={deliveryMode} tone="neutral" />
          ) : null}
          {categoryLabel ? (
            <RabAIBadge label={categoryLabel} tone="information" />
          ) : null}
        </View>
      }
      compact={isCompact}
      description={!isCompact ? course.short_description ?? undefined : undefined}
      leading={<ProviderMonogram name={course.provider_name} />}
      meta={meta}
      style={styles.row}
      subtitle={[course.provider_name, location].filter(Boolean).join(" · ")}
      title={course.title}
    />
  );
}

function CourseAction({
  accessibilityHint,
  accessibilityLabel,
  label,
  onPress,
  testID,
  tone,
}: {
  accessibilityHint?: string;
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  testID?: string;
  tone: "primary" | "secondary";
}) {
  return (
    <RabAIButton
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      size="sm"
      style={styles.actionButton}
      testID={testID}
      title={label}
      variant={tone === "primary" ? "primary" : "secondary"}
    />
  );
}

function courseEnrollmentTone(
  status: CourseEnrollmentSnapshot["status"]
): RabAIBadgeTone {
  if (status === "accepted") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  if (status === "submitted" || status === "viewed") {
    return "information";
  }

  return "neutral";
}

function ProviderMonogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "—";

  return (
    <View accessibilityElementsHidden style={styles.monogram}>
      <Text style={styles.monogramText}>{initials}</Text>
    </View>
  );
}

function formatLanguage(value: string | null) {
  if (value === "ro") {
    return "Română";
  }

  if (value === "de") {
    return "Deutsch";
  }

  if (value === "en") {
    return "English";
  }

  return value?.trim().toUpperCase() ?? "";
}

function humanize(value: string) {
  const normalized = value.trim().replace(/_/gu, " ");
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "";
}

function getCategoryLabel(course: SearchCourseResult, language: LanguageCode) {
  if (language === "de") {
    return course.category_name_de ?? course.category_name_ro ?? "";
  }

  if (language === "en") {
    return course.category_name_en ?? course.category_name_ro ?? "";
  }

  return course.category_name_ro ?? "";
}

function formatLocation(course: SearchCourseResult) {
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

function formatPrice(course: SearchCourseResult) {
  const currency = course.currency_code?.trim();

  if (course.price_amount === null || !currency) {
    return "";
  }

  return `${formatNumber(course.price_amount)} ${currency}`;
}

function formatDuration(course: SearchCourseResult) {
  if (!course.duration_value || !course.duration_unit) {
    return "";
  }

  if (course.duration_unit === "hours") {
    return `${course.duration_value} ore`;
  }

  if (course.duration_unit === "days") {
    return `${course.duration_value} zile`;
  }

  if (course.duration_unit === "weeks") {
    return `${course.duration_value} săptămâni`;
  }

  if (course.duration_unit === "months") {
    return `${course.duration_value} luni`;
  }

  return "";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null, language: LanguageCode) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

const styles = StyleSheet.create({
  row: {
    backgroundColor: "transparent",
  },
  monogram: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.control,
    borderWidth: 1,
    height: ControlHeight.medium,
    justifyContent: "center",
    width: ControlHeight.medium,
  },
  monogramText: {
    color: Colors.textPrimary,
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.semibold,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  actionRowCompact: {
    justifyContent: "space-between",
    width: "100%",
  },
  actionButton: {
    minWidth: 104,
  },
});
