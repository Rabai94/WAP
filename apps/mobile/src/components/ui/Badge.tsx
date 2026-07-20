import { type ReactNode } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";

export type RabAIBadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "information";

export type RabAIBadgeProps = {
  label: string;
  tone?: RabAIBadgeTone;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function RabAIBadge({
  accessibilityLabel,
  icon,
  label,
  style,
  tone = "neutral",
}: RabAIBadgeProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, toneStyles[tone], style]}
    >
      {icon ? <View accessibilityElementsHidden>{icon}</View> : null}
      <Text style={[styles.label, toneTextStyles[tone]]}>{label}</Text>
    </View>
  );
}

export { RabAIBadge };

export function StatusBadge({
  icon,
  label,
  status,
  style,
  tone,
}: {
  status: string | null | undefined;
  label?: string;
  icon?: ReactNode;
  tone?: RabAIBadgeTone;
  style?: StyleProp<ViewStyle>;
}) {
  const normalizedStatus = status?.trim().toLowerCase() ?? "";
  const resolvedTone = tone ?? defaultStatusTones[normalizedStatus] ?? "neutral";
  const resolvedLabel = label ?? (status?.trim() || "Necunoscut");

  return (
    <RabAIBadge
      accessibilityLabel={`Status: ${resolvedLabel}`}
      icon={icon}
      label={resolvedLabel}
      style={style}
      tone={resolvedTone}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.compact,
    minHeight: 28,
    paddingHorizontal: Spacing.control,
    paddingVertical: Spacing.compact,
  },
  label: {
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.tight,
  },
  neutral: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
  },
  neutralText: {
    color: Colors.textSecondary,
  },
  primary: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.informationBorder,
  },
  primaryText: {
    color: Colors.primaryPressed,
  },
  success: {
    backgroundColor: Colors.successSurface,
    borderColor: Colors.successBorder,
  },
  successText: {
    color: Colors.success,
  },
  warning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  warningText: {
    color: Colors.warning,
  },
  danger: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
  },
  dangerText: {
    color: Colors.danger,
  },
  information: {
    backgroundColor: Colors.informationSurface,
    borderColor: Colors.informationBorder,
  },
  informationText: {
    color: Colors.information,
  },
});

const toneStyles: Record<RabAIBadgeTone, ViewStyle> = {
  neutral: styles.neutral,
  primary: styles.primary,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  information: styles.information,
};

const toneTextStyles = {
  neutral: styles.neutralText,
  primary: styles.primaryText,
  success: styles.successText,
  warning: styles.warningText,
  danger: styles.dangerText,
  information: styles.informationText,
};

const defaultStatusTones: Record<string, RabAIBadgeTone> = {
  active: "success",
  available: "success",
  approved: "success",
  completed: "success",
  success: "success",
  pending: "warning",
  soon: "warning",
  warning: "warning",
  cancelled: "danger",
  danger: "danger",
  error: "danger",
  rejected: "danger",
  draft: "neutral",
  inactive: "neutral",
  information: "information",
};
