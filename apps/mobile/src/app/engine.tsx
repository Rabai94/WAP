import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F8FAFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F6FF",
  ink: "#101828",
  muted: "#667085",
  line: "#D9E2F4",
  violet: "#6D28D9",
  violetDark: "#2E1065",
  violetSoft: "#EEE7FF",
  red: "#E11D48",
  redSoft: "#FFE7EF",
  blue: "#2563EB",
  blueSoft: "#EAF1FF",
  green: "#0F9F6E",
  greenSoft: "#E8F8F2",
  amber: "#B45309",
  amberSoft: "#FFF4D6",
  shadow: "#182033",
} as const;

const productCards = [
  {
    title: "RabAI Career",
    text: "Găsește joburi potrivite, dezvoltă skilluri și urmărește progresul tău profesional.",
    button: "Deschide Career",
    route: "/jobs",
    accent: palette.blue,
    soft: palette.blueSoft,
  },
  {
    title: "RabAI Student",
    text: "Construiește-ți profilul de student, găsește internshipuri, cursuri și proiecte.",
    button: "Deschide Student",
    route: "/student-profile",
    accent: palette.violet,
    soft: palette.violetSoft,
  },
  {
    title: "RabAI Business",
    text: "Publică oportunități, urmărește candidați și folosește AI pentru echipa ta.",
    button: "Deschide Business",
    route: "/business-dashboard",
    accent: palette.red,
    soft: palette.redSoft,
  },
  {
    title: "RabAI Freelancer",
    text: "Găsește proiecte, clienți și servicii potrivite.",
    button: "În curând",
    route: null,
    accent: palette.amber,
    soft: palette.amberSoft,
  },
] as const;

const quickActions = [
  "Joburi",
  "Cursuri",
  "Documente",
  "Servicii",
  "Companii",
  "Setări cont",
] as const;

export default function EngineScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [assistantPrompt, setAssistantPrompt] = useState("");

  const displayName = user?.fullName || user?.email || "Cont RabAI";

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <RequireAuth>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>RabAI</Text>
              <Text style={styles.userText}>{displayName}</Text>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroBadge}>RabAI Product Hub</Text>
            <Text style={styles.title}>RabAI Engine</Text>
            <Text style={styles.subtitle}>
              Motorul tău pentru muncă, carieră, business și dezvoltare
              profesională.
            </Text>
          </View>

          <View style={styles.cardGrid}>
            {productCards.map((card) => (
              <View key={card.title} style={styles.productCard}>
                <View
                  style={[styles.cardSignal, { backgroundColor: card.soft }]}
                >
                  <View
                    style={[styles.signalDot, { backgroundColor: card.accent }]}
                  />
                  <Text style={[styles.signalText, { color: card.accent }]}>
                    {card.title}
                  </Text>
                </View>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
                <Pressable
                  disabled={!card.route}
                  style={[
                    styles.cardButton,
                    { backgroundColor: card.route ? card.accent : palette.line },
                  ]}
                  onPress={() => {
                    if (card.route) {
                      router.push(card.route as any);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.cardButtonText,
                      !card.route && styles.disabledButtonText,
                    ]}
                  >
                    {card.button}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.assistantPanel}>
            <View style={styles.assistantCopy}>
              <Text style={styles.sectionEyebrow}>RabAI Assistant</Text>
              <Text style={styles.sectionTitle}>Întreabă RabAI</Text>
              <Text style={styles.sectionText}>
                Întreabă RabAI ce pas profesional ar trebui să faci mai
                departe.
              </Text>
            </View>

            <View style={styles.assistantInputPanel}>
              <Text style={styles.inputLabel}>Ce vrei să obții următorul?</Text>
              <TextInput
                onChangeText={setAssistantPrompt}
                placeholder="Ex. Vreau un job mai bun în logistică"
                placeholderTextColor={palette.muted}
                style={styles.assistantInput}
                value={assistantPrompt}
              />
              <Pressable style={styles.assistantButton}>
                <Text style={styles.assistantButtonText}>Întreabă RabAI</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.quickSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick actions</Text>
              <Text style={styles.sectionText}>
                Module RabAI pregătite pentru următoarele fluxuri.
              </Text>
            </View>

            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <View key={action} style={styles.quickCard}>
                  <Text style={styles.quickText}>{action}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
    flex: 1,
  },

  content: {
    alignSelf: "center",
    maxWidth: 1200,
    padding: Spacing.screen,
    paddingBottom: Spacing.eight,
    width: "100%",
  },

  header: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.five,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },

  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },

  userText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },

  logoutButton: {
    backgroundColor: palette.ink,
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },

  logoutText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },

  hero: {
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xxl,
    marginBottom: Spacing.five,
    overflow: "hidden",
    padding: Spacing.five,
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: Radius.round,
    color: "#E9DFFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },

  title: {
    color: Colors.white,
    fontSize: Typography.display,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.display,
    marginBottom: Spacing.xl,
  },

  subtitle: {
    color: "#E9DFFF",
    fontSize: Typography.total,
    lineHeight: 28,
    maxWidth: 720,
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },

  productCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    minWidth: 250,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 22,
    elevation: 3,
  },

  cardSignal: {
    alignItems: "center",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.three,
    padding: Spacing.xl,
  },

  signalDot: {
    borderRadius: Radius.round,
    height: 12,
    width: 12,
  },

  signalText: {
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    textTransform: "uppercase",
  },

  cardTitle: {
    color: palette.ink,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xl,
  },

  cardText: {
    color: palette.muted,
    flexGrow: 1,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.three,
  },

  cardButton: {
    alignItems: "center",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },

  cardButtonText: {
    color: Colors.white,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.black,
  },

  disabledButtonText: {
    color: palette.muted,
  },

  assistantPanel: {
    alignItems: "stretch",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginBottom: Spacing.five,
    padding: Spacing.five,
  },

  assistantCopy: {
    flex: 1,
    minWidth: 260,
  },

  assistantInputPanel: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
    padding: Spacing.three,
  },

  sectionEyebrow: {
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },

  sectionTitle: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },

  sectionText: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },

  inputLabel: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
  },

  assistantInput: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.body,
    marginBottom: Spacing.xl,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },

  assistantButton: {
    alignItems: "center",
    backgroundColor: palette.red,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },

  assistantButtonText: {
    color: Colors.white,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.black,
  },

  quickSection: {
    marginBottom: Spacing.five,
  },

  sectionHeader: {
    marginBottom: Spacing.three,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },

  quickCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minWidth: 150,
    padding: Spacing.three,
  },

  quickText: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
});
