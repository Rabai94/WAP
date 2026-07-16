import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";

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

export function FeatureCard(props: CardProps) {
  return <Card {...props} />;
}

export function SectionCard(props: CardProps) {
  return <Card {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    marginBottom: Spacing.three,
    padding: Spacing.four,
    ...Shadows.card,
  },

  default: {},

  muted: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    ...Shadows.none,
  },

  warning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    marginBottom: Spacing.five,
    padding: Spacing.three,
    ...Shadows.none,
  },

  title: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
});
