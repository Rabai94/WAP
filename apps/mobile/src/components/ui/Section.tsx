import { ReactNode } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

type SectionProps = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Section({ title, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.three,
  },

  title: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
});
