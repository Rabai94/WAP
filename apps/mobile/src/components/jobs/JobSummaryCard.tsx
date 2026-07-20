import type { LanguageCode } from "@/i18n/translations";
import type { SearchJobResult } from "@/services/jobs/jobFlowService";
import { RabAIButton, RabAICard } from "@/components/ui";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type JobSummaryCardVariant = "list" | "compact";

export type JobSummaryCardAction = "apply" | "view";

type JobSummaryCardProps = {
  job: SearchJobResult;
  language?: LanguageCode;
  onAction: (job: SearchJobResult, action: JobSummaryCardAction) => void;
  returnLabel?: string;
  variant?: JobSummaryCardVariant;
};

export default function JobSummaryCard({
  job,
  language = "ro",
  onAction,
  returnLabel,
  variant = "list",
}: JobSummaryCardProps) {
  const isCompact = variant === "compact";
  const salary = formatSalary(job, isCompact);
  const displayTitle = job.title;
  const occupationName =
    language === "de"
      ? job.occupation_name_de
      : language === "en"
        ? job.occupation_name_en
        : job.occupation_name_ro;
  const locationLabel =
    job.location_label || [job.postal_code, job.city, job.state].filter(Boolean).join(" ");

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
              {displayTitle}
            </Text>
            <Text numberOfLines={1} style={styles.company}>
              {job.company_name}
            </Text>
            <Text numberOfLines={1} style={styles.meta}>
              {locationLabel}
            </Text>
          </View>
          {!isCompact ? (
            <Text numberOfLines={1} style={styles.publishedAt}>
              {formatPublishedDate(job.published_at, language)}
            </Text>
          ) : null}
        </View>

        <View style={styles.pillRow}>
          {salary ? <InfoPill label="Salariu" value={salary} compact={isCompact} /> : null}
          <InfoPill
            label="Contract"
            value={formatEmploymentType(job.employment_type)}
            compact={isCompact}
          />
          {!isCompact ? (
            <InfoPill
              label="Ocupatie"
              value={occupationName}
              compact={false}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        {isCompact ? (
          <Text numberOfLines={1} style={styles.date}>
            {formatPublishedDate(job.published_at, language)}
          </Text>
        ) : null}
        <View style={styles.actionRow}>
          <RabAIButton
            accessibilityHint={
              returnLabel
                ? `Deschide vizualizarea rapidă. ${returnLabel}.`
                : "Deschide vizualizarea rapidă a jobului."
            }
            accessibilityLabel={`Vezi jobul ${displayTitle}`}
            onPress={() => onAction(job, "view")}
            size="sm"
            style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
            title="Vezi jobul"
            variant="outline"
          />
          <RabAIButton
            accessibilityLabel={`Aplică la jobul ${displayTitle}`}
            onPress={() => onAction(job, "apply")}
            size="sm"
            style={[styles.actionButton, isCompact && styles.actionButtonCompact]}
            title="Aplică"
          />
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

function formatSalary(job: SearchJobResult, hideEmpty: boolean) {
  if (job.salary_from === null && job.salary_to === null) {
    return hideEmpty ? "" : "Nespecificat";
  }

  const suffix = formatSalaryType(job.salary_type);

  if (job.salary_from !== null && job.salary_to !== null) {
    return `${formatNumber(job.salary_from)} – ${formatNumber(job.salary_to)} ${suffix}`.trim();
  }

  if (job.salary_from !== null) {
    return `de la ${formatNumber(job.salary_from)} ${suffix}`.trim();
  }

  return `până la ${formatNumber(job.salary_to)} ${suffix}`.trim();
}

function formatNumber(value: number | null) {
  return value === null
    ? ""
    : new Intl.NumberFormat("ro-RO", {
        maximumFractionDigits: 0,
      }).format(value);
}

function formatSalaryType(value: string) {
  if (value === "hourly") {
    return "/ oră";
  }

  if (value === "daily") {
    return "/ zi";
  }

  if (value === "weekly") {
    return "/ săptămână";
  }

  if (value === "yearly") {
    return "/ an";
  }

  if (value === "fixed") {
    return "fix";
  }

  if (value === "monthly") {
    return "/ lună";
  }

  return humanize(value);
}

function formatEmploymentType(value: string) {
  if (value === "full_time") {
    return "Full-time";
  }

  if (value === "part_time") {
    return "Part-time";
  }

  if (value === "mini_job") {
    return "Mini job";
  }

  if (value === "temporary") {
    return "Temporar";
  }

  if (value === "freelance") {
    return "Freelance";
  }

  return humanize(value);
}

function humanize(value: string) {
  const normalized = value.trim().replace(/_/g, " ");

  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : "";
}

function formatPublishedDate(value: string, language: LanguageCode) {
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
    minHeight: 190,
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
  company: {
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
  publishedAt: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
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
    minWidth: 150,
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
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  date: {
    color: Colors.textMuted,
    flex: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  actionButton: {
    flexGrow: 1,
  },
  actionButtonCompact: {
    flexBasis: 104,
  },
});
