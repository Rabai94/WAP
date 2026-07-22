import { Colors, Radius, Spacing, Typography } from "@/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export type CourseDetailSectionProps = {
  children: ReactNode;
  subtitle?: string;
  title: string;
};

export type CourseDetailItemProps = {
  label: string;
  value: string;
};

export default function CourseDetailSection({
  children,
  subtitle,
  title,
}: CourseDetailSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {subtitle?.trim() ? (
          <Text style={styles.subtitle}>{subtitle.trim()}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function CourseDetailGrid({ children }: { children: ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function CourseDetailItem({ label, value }: CourseDetailItemProps) {
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
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.five,
  },
  heading: {
    gap: Spacing.xs,
    minWidth: 0,
  },
  title: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: 24,
  },
  subtitle: {
    color: Colors.textMuted,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    maxWidth: "100%",
    minWidth: 0,
  },
  item: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 180,
    flexGrow: 1,
    flexShrink: 1,
    gap: Spacing.xs,
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.three,
  },
  itemLabel: {
    color: Colors.textMuted,
    flexShrink: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  itemValue: {
    color: Colors.textBody,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
  },
});
