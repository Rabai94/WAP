import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type CardVariant = "default" | "muted" | "warning";

type CardProps = {
  title?: string;
  children: ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
};

export default function Card({
  title,
  children,
  variant = "default",
  style,
}: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },

  default: {},

  muted: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
  },

  warning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    padding: Spacing.three,
    marginBottom: Spacing.five,
  },

  title: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
});
