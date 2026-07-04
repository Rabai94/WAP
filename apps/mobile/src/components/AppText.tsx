import { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { Colors, Typography } from "@/theme";

type AppTextProps = {
  children: ReactNode;
  variant?: "h1" | "h2" | "title" | "body" | "caption";
  color?: string;
};

export default function AppText({
  children,
  variant = "body",
  color = Colors.text,
}: AppTextProps) {
  return (
    <Text style={[styles.base, styles[variant], { color }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontWeight: Typography.fontWeight.regular,
  },
  h1: {
    fontSize: Typography.h1,
    fontWeight: Typography.fontWeight.black,
  },
  h2: {
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: Typography.fontWeight.semibold,
  },
  body: {
    fontSize: Typography.body,
  },
  caption: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
  },
});