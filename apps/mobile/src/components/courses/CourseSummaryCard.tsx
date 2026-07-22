import type { LanguageCode } from "@/i18n/translations";
import type { CourseEnrollmentSnapshot } from "@/components/courses/quick-view/courseQuickViewData";
import { formatCourseEnrollmentStatus } from "@/components/courses/quick-view/courseEnrollmentStatus";
import type { SearchCourseResult } from "@/services/courses/courseService";
import {
  RabAIBadge,
  RabAIButton,
  RabAICard,
  type RabAIBadgeTone,
} from "@/components/ui";
import { Colors, Radius, Spacing, Typography } from "@/theme";
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

  return (
    <RabAICard
      padding="md"
      style={[styles.card, isCompact ? styles.cardCompact : styles.cardList]}
      variant={isCompact ? "filled" : "outlined"}
    >
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text numberOfLines={isCompact ? 2 : 3} style={styles.title}>
              {course.title}
            </Text>
            <Text numberOfLines={1} style={styles.provider}>
              {course.provider_name}
            </Text>
            {location ? (
              <Text numberOfLines={1} style={styles.meta}>
                {location}
              </Text>
            ) : null}
            {enrollment && enrollmentStatusLabel ? (
              <RabAIBadge
                label={enrollmentStatusLabel}
                style={styles.enrollmentBadge}
                tone={courseEnrollmentTone(enrollment.status)}
              />
            ) : null}
          </View>
          {!isCompact && startDate ? (
            <Text numberOfLines={1} style={styles.startDate}>
              {startDate}
            </Text>
          ) : null}
        </View>

        {course.short_description && !isCompact ? (
          <Text numberOfLines={2} style={styles.description}>
            {course.short_description}
          </Text>
        ) : null}

        {categoryLabel || deliveryMode || price || course.certificate_available ? (
          <View style={styles.pillRow}>
            {categoryLabel ? (
              <InfoPill compact={isCompact} label="Categorie" value={categoryLabel} />
            ) : null}
            {deliveryMode ? (
              <InfoPill compact={isCompact} label="Format" value={deliveryMode} />
            ) : null}
            {price ? (
              <InfoPill compact={isCompact} label="Preț" value={price} />
            ) : null}
            {!isCompact && course.certificate_available ? (
              <InfoPill compact={false} label="Certificat" value="Disponibil" />
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, isCompact && styles.footerCompact]}>
        {(isCompact ? startDate : duration) ? (
          <Text numberOfLines={1} style={styles.date}>
            {isCompact ? startDate : duration}
          </Text>
        ) : null}
        <View style={styles.actionRow}>
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
      </View>
    </RabAICard>
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

function InfoPill({
  compact,
  label,
  value,
}: {
  compact: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={[styles.infoPill, compact && styles.infoPillCompact]}>
      {!compact ? <Text style={styles.infoLabel}>{label}</Text> : null}
      <Text numberOfLines={1} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
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
  card: {
    justifyContent: "space-between",
  },
  cardList: {
    marginBottom: Spacing.md,
    minHeight: 220,
  },
  cardCompact: {
    flexBasis: 220,
    flexGrow: 1,
    minHeight: 218,
  },
  body: {
    gap: Spacing.sm,
    minWidth: 0,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
  },
  provider: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    marginTop: Spacing.compact,
  },
  enrollmentBadge: {
    marginTop: Spacing.sm,
    maxWidth: "100%",
  },
  startDate: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  description: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  infoPill: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.control,
    borderWidth: 1,
    minWidth: 0,
    padding: Spacing.md,
  },
  infoPillCompact: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.pill,
    minWidth: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    marginBottom: Spacing.compact,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "space-between",
    marginTop: Spacing.md,
    minWidth: 0,
  },
  footerCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  date: {
    color: Colors.textMuted,
    flexGrow: 1,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    minWidth: 0,
  },
  actionRow: {
    flexDirection: "row",
    flexGrow: 1,
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
    minWidth: 0,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 96,
  },
});
