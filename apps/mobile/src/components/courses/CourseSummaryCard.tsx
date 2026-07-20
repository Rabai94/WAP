import type { LanguageCode } from "@/i18n/translations";
import { buildCourseDetailsPath } from "@/services/courses/courseNavigation";
import type { SearchCourseResult } from "@/services/courses/courseService";
import { RabAICard } from "@/components/ui";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

type CourseSummaryCardVariant = "list" | "compact";

type CourseSummaryCardProps = {
  course: SearchCourseResult;
  language?: LanguageCode;
  returnLabel?: string;
  returnTo: string;
  variant?: CourseSummaryCardVariant;
};

export default function CourseSummaryCard({
  course,
  language = "ro",
  returnLabel,
  returnTo,
  variant = "list",
}: CourseSummaryCardProps) {
  const router = useRouter();
  const isCompact = variant === "compact";
  const detailsPath = buildCourseDetailsPath(course.course_id, returnTo);
  const categoryLabel = getCategoryLabel(course, language);

  return (
    <RabAICard
      accessibilityLabel={
        returnLabel
          ? `Vezi cursul ${course.title}. ${returnLabel}.`
          : `Vezi cursul ${course.title}`
      }
      interactive
      onPress={() => {
        router.push(detailsPath as any);
      }}
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
            <Text numberOfLines={1} style={styles.meta}>
              {formatLocation(course)}
            </Text>
          </View>
          {!isCompact ? (
            <Text numberOfLines={1} style={styles.startDate}>
              {formatDate(course.start_date, language)}
            </Text>
          ) : null}
        </View>

        {course.short_description && !isCompact ? (
          <Text numberOfLines={2} style={styles.description}>
            {course.short_description}
          </Text>
        ) : null}

        <View style={styles.pillRow}>
          {categoryLabel ? (
            <InfoPill compact={isCompact} label="Categorie" value={categoryLabel} />
          ) : null}
          <InfoPill
            compact={isCompact}
            label="Mod"
            value={formatDeliveryMode(course.delivery_mode)}
          />
          <InfoPill
            compact={isCompact}
            label="Pret"
            value={formatPrice(course)}
          />
          {!isCompact && course.certificate_available ? (
            <InfoPill compact={false} label="Certificat" value="Disponibil" />
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        {isCompact ? (
          <Text numberOfLines={1} style={styles.date}>
            {formatDate(course.start_date, language)}
          </Text>
        ) : (
          <Text numberOfLines={1} style={styles.date}>
            {formatDuration(course)}
          </Text>
        )}
        <View style={[styles.viewButton, isCompact && styles.viewButtonCompact]}>
          <Text
            numberOfLines={1}
            style={[
              styles.viewButtonText,
              isCompact && styles.viewButtonTextCompact,
            ]}
          >
            Vezi cursul
          </Text>
        </View>
      </View>
    </RabAICard>
  );
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

function formatPrice(course: SearchCourseResult) {
  if (course.price_amount === null) {
    return "Gratuit / nespecificat";
  }

  return `${formatNumber(course.price_amount)} ${course.currency_code ?? "EUR"}`;
}

function formatDuration(course: SearchCourseResult) {
  if (!course.duration_value || !course.duration_unit) {
    return "Durata nespecificata";
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null, language: LanguageCode) {
  if (!value) {
    return "Start flexibil";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Start flexibil";
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
    minHeight: 194,
  },
  body: {
    gap: Spacing.sm,
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
    minWidth: 180,
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
    fontSize: Typography.small,
    marginTop: Spacing.compact,
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
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.control,
    borderWidth: 1,
    minWidth: 142,
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
    fontSize: Typography.small,
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
    gap: Spacing.sm,
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  date: {
    color: Colors.textMuted,
    flex: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  viewButton: {
    alignItems: "center",
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.control,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 0,
  },
  viewButtonCompact: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
  },
  viewButtonText: {
    color: Colors.primaryPressed,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  viewButtonTextCompact: {
    color: Colors.onPrimary,
  },
});
