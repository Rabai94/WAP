import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

type HeaderProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  hero?: boolean;
};

export default function Header({ title, subtitle, icon, hero = false }: HeaderProps) {
  return (
    <View style={styles.wrap}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.title, hero && styles.heroTitle]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "center",
    maxWidth: 840,
    width: "100%",
  },

  icon: {
    fontSize: Typography.icon,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: Typography.screenTitle,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },

  heroTitle: {
    fontSize: Typography.hero,
  },

  subtitle: {
    fontSize: Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.five,
    lineHeight: Typography.lineHeight.subtitle,
  },
});
