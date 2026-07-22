import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

export type IdentityHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  avatar?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function IdentityHeader({
  actions,
  avatar,
  badges,
  compact = false,
  eyebrow,
  meta,
  style,
  subtitle,
  testID,
  title,
}: IdentityHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact, style]} testID={testID}>
      <View style={styles.identity}>
        {avatar ? <View style={styles.avatar}>{avatar}</View> : null}
        <View style={styles.copy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text
            accessibilityRole="header"
            style={[styles.title, compact && styles.titleCompact]}
          >
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {meta ? <View style={styles.meta}>{meta}</View> : null}
          {badges ? <View style={styles.badges}>{badges}</View> : null}
        </View>
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

export { IdentityHeader };

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.component,
    justifyContent: "space-between",
    minWidth: 0,
    paddingBottom: Spacing.component,
  },
  compact: {
    gap: Spacing.inline,
    paddingBottom: Spacing.inline,
  },
  identity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    minWidth: 240,
  },
  avatar: {
    alignItems: "center",
    flexShrink: 0,
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: Colors.goldPressed,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.eyebrow,
    lineHeight: Typography.lineHeight.compact,
    marginBottom: Spacing.compact,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.pageTitle,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.tight,
    lineHeight: Typography.lineHeight.pageTitle,
  },
  titleCompact: {
    fontSize: Typography.sectionHeading,
    lineHeight: Typography.lineHeight.heading,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.compact,
  },
  meta: {
    marginTop: Spacing.control,
    minWidth: 0,
  },
  badges: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginTop: Spacing.control,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
});
