import type { LanguageCode } from "@/i18n/translations";
import { buildCourseDetailsPath } from "@/services/courses/courseNavigation";
import type { SearchCourseResult } from "@/services/courses/courseService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type CourseSummaryCardVariant = "list" | "compact";

type CourseSummaryCardProps = {
  course: SearchCourseResult;
  language?: LanguageCode;
  returnLabel?: string;
  returnTo: string;
  variant?: CourseSummaryCardVariant;
};

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({
        cursor: "pointer",
      } as unknown as ViewStyle)
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
  returnLabel,
  returnTo,
  variant = "list",
}: CourseSummaryCardProps) {
  const router = useRouter();
  const isCompact = variant === "compact";
  const detailsPath = buildCourseDetailsPath(course.course_id, returnTo);
  const categoryLabel = getCategoryLabel(course, language);

  return (
    <Pressable
      accessibilityHint={
        returnLabel
          ? `Deschide pagina de detaliu a cursului. ${returnLabel}.`
          : "Deschide pagina de detaliu a cursului."
      }
      accessibilityLabel={`Vezi cursul ${course.title}`}
      accessibilityRole="button"
      onPress={() => {
        router.push(detailsPath as any);
      }}
      style={(state) => {
        const webState = state as WebPressableState;

        return [
          styles.card,
          isCompact ? styles.cardCompact : styles.cardList,
          pointerWebStyle,
          webState.hovered && styles.cardHover,
          webState.pressed && styles.cardPressed,
          webState.focused && styles.cardFocus,
          webState.focused && focusRingWebStyle,
        ];
      }}
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
    </Pressable>
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
    minHeight: 194,
  },
  cardHover: {
    borderColor: "rgba(110, 29, 255, 0.30)",
    shadowOpacity: 0.09,
    transform: [{ translateY: -1 }],
  },
  cardPressed: {
    transform: [{ translateY: 0 }],
  },
  cardFocus: {
    borderColor: "#145CFF",
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
    minWidth: 142,
    padding: Spacing.md,
  },
  infoPillCompact: {
    backgroundColor: Colors.white,
    borderColor: "#EEF2FB",
    borderRadius: Radius.round,
    minWidth: 0,
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
    gap: Spacing.sm,
    justifyContent: "space-between",
    marginTop: Spacing.md,
  },
  date: {
    color: "#8B96B3",
    flex: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  viewButton: {
    alignItems: "center",
    backgroundColor: "#F1E9FF",
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 0,
  },
  viewButtonCompact: {
    backgroundColor: "#6E1DFF",
    minHeight: 34,
    paddingHorizontal: Spacing.md,
  },
  viewButtonText: {
    color: "#5D37EA",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  viewButtonTextCompact: {
    color: Colors.white,
  },
});
