import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function JobsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { session } = useAuth();
  const isAuthenticated = Boolean(session);
  const homeRoute = isAuthenticated ? "/engine" : "/";

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isAuthenticated ? (
          <AuthenticatedHeader active="jobs" />
        ) : (
          <View style={styles.publicHeader}>
            <Pressable accessibilityRole="button" onPress={() => router.replace("/" as any)} style={styles.publicLink}>
              <Text style={styles.publicLinkText}>{t("common.home")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push("/login" as any)} style={styles.publicPrimaryButton}>
              <Text style={styles.publicPrimaryButtonText}>{t("common.login")}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push("/role" as any)} style={styles.publicSecondaryButton}>
              <Text style={styles.publicSecondaryButtonText}>{t("common.register")}</Text>
            </Pressable>
          </View>
        )}

          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>{t("jobs.eyebrow")}</Text>
            <Text style={styles.heroTitle}>{t("jobs.title")}</Text>
            <Text style={styles.heroSubtitle}>{t("jobs.subtitle")}</Text>
          </View>

          <View style={styles.filterCard}>
            <Text style={styles.filterTitle}>{t("jobs.filterTitle")}</Text>
            <View style={styles.filterGrid}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{t("jobs.search.what")}</Text>
                <TextInput placeholder={t("jobs.search.whatPlaceholder")} placeholderTextColor={Colors.textMuted} style={styles.input} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{t("jobs.search.location")}</Text>
                <TextInput placeholder={t("jobs.search.locationPlaceholder")} placeholderTextColor={Colors.textMuted} style={styles.input} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{t("jobs.search.category")}</Text>
                <TextInput placeholder={t("jobs.search.categoryPlaceholder")} placeholderTextColor={Colors.textMuted} style={styles.input} />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>{t("jobs.search.workType")}</Text>
                <TextInput placeholder={t("jobs.search.workTypePlaceholder")} placeholderTextColor={Colors.textMuted} style={styles.input} />
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={Keyboard.dismiss} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>{t("jobs.search.button")}</Text>
            </Pressable>
          </View>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🔎</Text>
            <Text style={styles.emptyTitle}>{t("jobs.emptyTitle")}</Text>
            <Text style={styles.emptyText}>{t("jobs.emptyText")}</Text>
            <View style={styles.actionsRow}>
              <Pressable accessibilityRole="button" onPress={() => router.replace(homeRoute as any)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{t("jobs.backToRabai")}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>{t("jobs.completeProfileSoon")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  content: {
    alignSelf: "center",
    gap: Spacing.lg,
    maxWidth: 1080,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  publicHeader: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  publicLink: {
    paddingVertical: Spacing.sm,
  },
  publicLinkText: {
    color: "#145CFF",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  publicPrimaryButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  publicPrimaryButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  publicSecondaryButton: {
    backgroundColor: "#F3F7FF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  publicSecondaryButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  homeButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  homeButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  heroEyebrow: {
    color: "#145CFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.text,
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.extraBold,
  },
  heroSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    marginTop: Spacing.sm,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  filterTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  inputWrap: {
    flexBasis: 240,
    flexGrow: 1,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7FAFF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchButton: {
    alignSelf: "flex-start",
    backgroundColor: "#6F5BFF",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyCard: {
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  secondaryButton: {
    backgroundColor: "#F3F7FF",
    borderRadius: Radius.lg,
    opacity: 0.75,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  secondaryButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
