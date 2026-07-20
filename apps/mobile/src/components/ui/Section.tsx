import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

export type SectionProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function Section({
  action,
  children,
  contentStyle,
  description,
  style,
  title,
}: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {title || description || action ? (
        <View style={styles.header}>
          <View style={styles.copy}>
            {title ? (
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
          </View>
          {action ? <View style={styles.action}>{action}</View> : null}
        </View>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignSelf: "stretch",
    marginBottom: Spacing.section,
    minWidth: 0,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
    justifyContent: "space-between",
    marginBottom: Spacing.inline,
    minWidth: 0,
  },
  copy: {
    flex: 1,
    minWidth: 220,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.default,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.compact,
  },
  action: {
    flexShrink: 0,
  },
  content: {
    minWidth: 0,
  },
});
