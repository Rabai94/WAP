import { type ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { RabAIButton } from "./Button";

type BaseStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  actionLabel,
  compact = false,
  description,
  icon,
  onAction,
  style,
  title,
}: BaseStateProps & { actionLabel?: string; onAction?: () => void }) {
  return (
    <StateFrame compact={compact} icon={icon} style={style}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <RabAIButton onPress={onAction} title={actionLabel} />
      ) : null}
    </StateFrame>
  );
}

export function LoadingState({
  compact = false,
  description,
  style,
  title,
}: BaseStateProps) {
  return (
    <StateFrame compact={compact} style={style}>
      <ActivityIndicator color={Colors.primary} size="small" />
      <View accessibilityLiveRegion="polite" accessibilityState={{ busy: true }}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </StateFrame>
  );
}

export function ErrorState({
  compact = false,
  description,
  onRetry,
  retryLabel = "Încearcă din nou",
  style,
  title,
}: BaseStateProps & { onRetry?: () => void; retryLabel?: string }) {
  return (
    <StateFrame compact={compact} style={[styles.errorFrame, style]}>
      <View accessibilityLiveRegion="assertive" role="alert">
        <Text style={[styles.title, styles.errorTitle]}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {onRetry ? (
        <RabAIButton onPress={onRetry} title={retryLabel} variant="outline" />
      ) : null}
    </StateFrame>
  );
}

function StateFrame({
  children,
  compact,
  icon,
  style,
}: {
  children: ReactNode;
  compact: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.frame, compact && styles.frameCompact, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      {children}
    </View>
  );
}

export function Skeleton({
  height = 16,
  style,
  width = "100%",
}: {
  height?: number;
  width?: ViewStyle["width"];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.skeleton, { height, width }, style]}
    />
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.panel,
    borderWidth: 1,
    gap: Spacing.inline,
    padding: Spacing.section,
  },
  frameCompact: {
    gap: Spacing.control,
    padding: Spacing.component,
  },
  errorFrame: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
  },
  icon: {
    marginBottom: Spacing.compact,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.default,
  },
  errorTitle: {
    color: Colors.danger,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginTop: Spacing.compact,
  },
  skeleton: {
    backgroundColor: Colors.skeleton,
    borderRadius: Radius.sm,
    maxWidth: "100%",
  },
});
