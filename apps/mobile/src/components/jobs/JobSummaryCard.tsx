import type { LanguageCode } from "@/i18n/translations";
import type { SearchJobResult } from "@/services/jobs/jobFlowService";
import {
  ListingRow,
  RabAIBadge,
  RabAIButton,
  type ListingRowMetaItem,
} from "@/components/ui";
import { Colors, ControlHeight, Radius, Spacing, Typography } from "@/theme";
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
  const publishedAt = formatPublishedDate(job.published_at, language);
  const meta: ListingRowMetaItem[] = [];

  if (salary) {
    meta.push({ label: "Salariu", value: salary });
  }

  if (occupationName) {
    meta.push({ label: "Ocupație", value: occupationName });
  }

  if (publishedAt) {
    meta.push({ label: "Publicat", value: publishedAt });
  }

  return (
    <ListingRow
      accessibilityLabel={`${displayTitle}, ${job.company_name}`}
      actions={
        <View style={[styles.actionRow, isCompact && styles.actionRowCompact]}>
          <RabAIButton
            accessibilityHint={
              returnLabel
                ? `Deschide vizualizarea rapidă. ${returnLabel}.`
                : "Deschide vizualizarea rapidă a jobului."
            }
            accessibilityLabel={`Vezi jobul ${displayTitle}`}
            onPress={() => onAction(job, "view")}
            size="sm"
            style={styles.actionButton}
            title="Vezi jobul"
            variant="secondary"
          />
          <RabAIButton
            accessibilityLabel={`Aplică la jobul ${displayTitle}`}
            onPress={() => onAction(job, "apply")}
            size="sm"
            style={styles.actionButton}
            title="Aplică"
          />
        </View>
      }
      badges={
        <RabAIBadge
          label={formatEmploymentType(job.employment_type)}
          tone="neutral"
        />
      }
      compact={isCompact}
      leading={<CompanyMonogram name={job.company_name} />}
      meta={meta}
      style={styles.row}
      subtitle={[job.company_name, locationLabel].filter(Boolean).join(" · ")}
      title={displayTitle}
    />
  );
}

function CompanyMonogram({ name }: { name: string }) {
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
  row: {
    backgroundColor: "transparent",
  },
  monogram: {
    alignItems: "center",
    backgroundColor: Colors.goldMuted,
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
