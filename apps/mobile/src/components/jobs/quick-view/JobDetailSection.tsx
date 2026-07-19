import { Colors, Radius, Spacing, Typography } from "@/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type JobDetailSectionProps = {
  children: ReactNode;
  subtitle?: string;
  title: string;
};

export default function JobDetailSection({
  children,
  subtitle,
  title,
}: JobDetailSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function JobDetailGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function JobDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text selectable style={styles.itemValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.surface,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.three,
    padding: Spacing.five,
  },
  heading: {
    gap: Spacing.xs,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: 24,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  item: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    gap: Spacing.xs,
    minWidth: 0,
    padding: Spacing.three,
  },
  itemLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  itemValue: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
  },
});
