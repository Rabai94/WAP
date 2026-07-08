import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Screen } from "../components/ui";
import { useLanguage } from "../i18n/LanguageProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F6F8FC",
  surface: "#FFFFFF",
  ink: "#111827",
  muted: "#5B6472",
  blue: "#2563EB",
  blueSoft: "#EAF1FF",
  violet: "#6D28D9",
  violetSoft: "#F2EAFE",
  red: "#E11D48",
  redSoft: "#FFE8EE",
  line: "#DCE4F2",
  shadow: "#172033",
} as const;

const roleCards = [
  {
    eyebrow: "role.student.eyebrow",
    title: "role.student.title",
    audience: "role.student.audience",
    description: "role.student.description",
    cta: "role.student.cta",
    route: "/student-profile",
    accent: palette.violet,
    soft: palette.violetSoft,
  },
  {
    eyebrow: "role.career.eyebrow",
    title: "role.career.title",
    audience: "role.career.audience",
    description: "role.career.description",
    cta: "role.career.cta",
    route: "/worker-form",
    accent: palette.blue,
    soft: palette.blueSoft,
  },
  {
    eyebrow: "role.business.eyebrow",
    title: "role.business.title",
    audience: "role.business.audience",
    description: "role.business.description",
    cta: "role.business.cta",
    route: "/business",
    accent: palette.red,
    soft: palette.redSoft,
  },
  {
    eyebrow: "role.freelancer.eyebrow",
    title: "role.freelancer.title",
    audience: "role.freelancer.audience",
    description: "role.freelancer.description",
    cta: "role.freelancer.ctaSoon",
    route: null,
    accent: palette.violet,
    soft: palette.violetSoft,
  },
] as const;

export default function RoleScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/" as any);
  }

  return (
    <Screen centered={false} style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>{t("common.back")}</Text>
          </Pressable>

          <View style={styles.brandBlock}>
            <Text style={styles.logo}>{t("role.header.logo")}</Text>
            <Text style={styles.headerSubtitle}>
              {t("role.header.subtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{t("role.badge")}</Text>
          <Text style={styles.title}>{t("role.title")}</Text>
          <Text style={styles.subtitle}>{t("role.subtitle")}</Text>
        </View>

        <View style={styles.cardsGrid}>
          {roleCards.map((card) => (
            <Card key={card.title} style={styles.roleCard}>
              <View style={[styles.mascotBox, { backgroundColor: card.soft }]}>
                <View
                  style={[
                    styles.mascotSignal,
                    { backgroundColor: card.accent },
                  ]}
                />
                <Text style={[styles.mascotText, { color: card.accent }]}>
                  {t("role.mascot")}
                </Text>
              </View>

              <Text style={[styles.eyebrow, { color: card.accent }]}>
                {t(card.eyebrow)}
              </Text>
              <Text style={styles.cardTitle}>{t(card.title)}</Text>
              <Text style={styles.audience}>{t(card.audience)}</Text>
              <Text style={styles.description}>{t(card.description)}</Text>

              {card.route ? (
                <Button
                  title={t(card.cta)}
                  style={[styles.cardButton, { backgroundColor: card.accent }]}
                  textStyle={styles.cardButtonText}
                  onPress={() => {
                    router.push(card.route as any);
                  }}
                />
              ) : (
                <View style={styles.disabledButton}>
                  <Text style={styles.disabledButtonText}>{t(card.cta)}</Text>
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
  },
  content: {
    alignSelf: "center",
    maxWidth: 1280,
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.seven,
  },
  backButton: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  backText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  brandBlock: {
    alignItems: "flex-end",
  },
  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },
  headerSubtitle: {
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    marginTop: Spacing.xs,
  },
  hero: {
    alignItems: "center",
    marginBottom: Spacing.eight,
  },
  heroBadge: {
    backgroundColor: palette.redSoft,
    borderRadius: Radius.round,
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  title: {
    color: palette.ink,
    fontSize: Typography.hero,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.subtitleLarge,
    marginBottom: Spacing.xl,
    maxWidth: 760,
    textAlign: "center",
  },
  subtitle: {
    color: palette.muted,
    fontSize: Typography.total,
    lineHeight: 28,
    maxWidth: 680,
    textAlign: "center",
  },
  cardsGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  roleCard: {
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    flex: 1,
    marginBottom: Spacing.none,
    minWidth: 260,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 3,
  },
  mascotBox: {
    borderRadius: Radius.xxl,
    marginBottom: Spacing.five,
    minHeight: 132,
    overflow: "hidden",
    padding: Spacing.three,
  },
  mascotSignal: {
    borderRadius: Radius.round,
    height: 26,
    marginBottom: Spacing.three,
    width: 26,
  },
  mascotText: {
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.default,
  },
  eyebrow: {
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },
  audience: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.three,
  },
  description: {
    color: palette.muted,
    flexGrow: 1,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.five,
  },
  cardButton: {
    paddingHorizontal: Spacing.three,
  },
  cardButtonText: {
    color: Colors.white,
    fontSize: Typography.label,
  },
  disabledButton: {
    alignItems: "center",
    backgroundColor: "#EEF2F8",
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },
  disabledButtonText: {
    color: palette.muted,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
});
