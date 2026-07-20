import { StyleSheet, Text } from "react-native";
import { Spacing, Typography } from "@/theme";
import PageHeader from "./PageHeader";

type HeaderProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  hero?: boolean;
};

// Compatibility surface. New pages should use PageHeader.
export default function Header({ title, subtitle, icon, hero = false }: HeaderProps) {
  return (
    <PageHeader
      align="center"
      description={subtitle}
      leading={icon ? <Text style={styles.icon}>{icon}</Text> : undefined}
      title={title}
      titleSize={hero ? "hero" : "default"}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: Typography.icon,
    marginBottom: Spacing.control,
    textAlign: "center",
  },
});
