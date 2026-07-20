import type { LanguageCode } from "@/i18n/translations";
import type { SearchCourseResult } from "@/services/courses/courseService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type CourseSummaryCardVariant = "list" | "compact";

export type CourseSummaryCardAction = "enroll" | "view";

type CourseSummaryCardProps = {
  course: SearchCourseResult;
  language?: LanguageCode;
  onAction: (
    course: SearchCourseResult,
    action: CourseSummaryCardAction
  ) => void;
  returnLabel?: string;
  variant?: CourseSummaryCardVariant;
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

const focusRingWebStyle =
  Platform.OS === "web"
    ? ({
        outlineColor: "rgba(20, 92, 255, 0.72)",
        outlineOffset: 3,
        outlineStyle: "solid",
        outlineWidth: 2,
      } as unknown as ViewStyle)
    : null;

export default function CourseSummaryCard({
  course,
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

  return (
    <View style={[styles.card, isCompact ? styles.cardCompact : styles.cardList]}>
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
            accessibilityHint="Deschide confirmarea înainte de trimiterea înscrierii."
            accessibilityLabel={`Înscrie-te la cursul ${course.title}`}
            label="Înscrie-te"
            onPress={() => onAction(course, "enroll")}
            testID={`course-enroll-${course.course_id}`}
            tone="primary"
          />
        </View>
      </View>
    </View>
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
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const webState = state as WebPressableState;
        const primary = tone === "primary";

        return [
          styles.actionButton,
          primary ? styles.primaryButton : styles.secondaryButton,
          pointerWebStyle,
          webState.hovered &&
            (primary ? styles.primaryButtonHover : styles.secondaryButtonHover),
          webState.pressed && styles.actionButtonPressed,
          webState.focused && focusRingWebStyle,
        ];
      }}
      testID={testID}
    >
      <Text
        numberOfLines={1}
        style={primaryTextStyle(tone)}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function primaryTextStyle(tone: "primary" | "secondary") {
  return tone === "primary"
    ? styles.primaryButtonText
    : styles.secondaryButtonText;
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
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: "space-between",
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 1,
  },
  cardList: {
    marginBottom: Spacing.md,
    minHeight: 220,
  },
  cardCompact: {
    backgroundColor: "rgba(243, 247, 255, 0.78)",
    borderColor: "rgba(218, 227, 245, 0.70)",
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
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: 22,
  },
  provider: {
    color: "#17213F",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: 3,
  },
  startDate: {
    color: Colors.textMuted,
    fontSize: Typography.small,
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
    backgroundColor: "#F7FAFF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 0,
    padding: Spacing.md,
  },
  infoPillCompact: {
    backgroundColor: Colors.white,
    borderColor: "#EEF2FB",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginBottom: 3,
  },
  infoValue: {
    color: Colors.text,
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
    color: "#8B96B3",
    flexGrow: 1,
    flexShrink: 1,
    fontSize: Typography.small,
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
    alignItems: "center",
    borderRadius: Radius.lg,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: Spacing.md,
  },
  secondaryButton: {
    backgroundColor: "#F1E9FF",
    borderColor: "rgba(93, 55, 234, 0.18)",
    borderWidth: 1,
  },
  secondaryButtonHover: {
    backgroundColor: "#E9DCFF",
  },
  secondaryButtonText: {
    color: "#5D37EA",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  primaryButton: {
    backgroundColor: "#6E1DFF",
  },
  primaryButtonHover: {
    backgroundColor: "#5711D8",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actionButtonPressed: {
    opacity: 0.84,
  },
});
