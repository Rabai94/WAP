import { PageContainer, PageHeader, RabAIBadge } from "@/components/ui";
import { Colors, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

export default function DesignLabIndex() {
  return (
    <PageContainer maxWidth="content" scroll contentStyle={styles.content}>
      <PageHeader
        description="Spațiu izolat pentru explorări vizuale aprobate, fără conexiune la datele sau fluxurile reale RabAI."
        eyebrow="Design Lab"
        title="RabAI Design Lab"
        titleSize="hero"
      />
      <View accessibilityLiveRegion="polite" style={styles.notice}>
        <RabAIBadge label="Preview local" tone="information" />
        <Text style={styles.noticeTitle}>Nu există concepte active pentru comparație.</Text>
        <Text style={styles.noticeText}>
          Conceptele anterioare au fost eliminate. Orice explorare nouă rămâne locală până la aprobarea și migrarea ei în sistemul de design.
        </Text>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  notice: {
    backgroundColor: Colors.surfaceMuted,
    gap: Spacing.control,
    padding: Spacing.component,
  },
  noticeTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
  },
  noticeText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
});
