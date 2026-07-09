import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import RequireAuth from "@/components/RequireAuth";
import type { AuthRole } from "@/domain/auth/auth.types";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F8FAFF",
  surface: "#FFFFFF",
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

type EngineEntry = {
  title: string;
  text: string;
  button: string;
  route: string | null;
  accent: string;
  soft: string;
};

type AdminEntry = {
  title: string;
  icon: string;
  subtitle: string;
  route: string | null;
  accent: string;
  soft: string;
};

const homeCardsByRole: Record<Exclude<AuthRole, "admin">, EngineEntry[]> = {
  worker: [
    {
      title: "Jobs",
      text: "Browse matching worker opportunities and continue applications from your RabAI home.",
      button: "Open Jobs",
      route: "/jobs",
      accent: palette.blue,
      soft: palette.blueSoft,
    },
    {
      title: "Career Profile",
      text: "Review your worker profile, documents, skills, and recommended next steps.",
      button: "Open Profile",
      route: "/worker-dashboard",
      accent: palette.violet,
      soft: palette.violetSoft,
    },
    {
      title: "Applications",
      text: "Track application status and return to the next worker flow step.",
      button: "Open Applications",
      route: "/application-sent",
      accent: palette.red,
      soft: palette.redSoft,
    },
    {
      title: "Courses / Learning",
      text: "Learning paths and course recommendations will live here soon.",
      button: "Coming soon",
      route: null,
      accent: palette.amber,
      soft: palette.amberSoft,
    },
    {
      title: "RabAI Assistant",
      text: "Personal assistant guidance is reserved for the next Engine iteration.",
      button: "Coming soon",
      route: null,
      accent: palette.green,
      soft: palette.greenSoft,
    },
  ],
  business: [
    {
      title: "Company Dashboard",
      text: "Review the company profile, verification progress, jobs, and recommended next steps.",
      button: "Open Dashboard",
      route: "/business-dashboard",
      accent: palette.red,
      soft: palette.redSoft,
    },
    {
      title: "Create Job",
      text: "Publish an MVP job and continue the business hiring flow.",
      button: "Create Job",
      route: "/create-job",
      accent: palette.blue,
      soft: palette.blueSoft,
    },
    {
      title: "Applications",
      text: "Review candidates and move accepted workers into the contract flow.",
      button: "View Applications",
      route: "/applications",
      accent: palette.violet,
      soft: palette.violetSoft,
    },
    {
      title: "RabAI Assistant",
      text: "Business assistant guidance is reserved for the next Engine iteration.",
      button: "Coming soon",
      route: null,
      accent: palette.green,
      soft: palette.greenSoft,
    },
  ],
  student: [
    {
      title: "Student Profile",
      text: "Open the student workspace for courses, profile progress, and career planning.",
      button: "Open Profile",
      route: "/student-profile",
      accent: palette.violet,
      soft: palette.violetSoft,
    },
    {
      title: "Jobs",
      text: "Browse available opportunities from the RabAI Engine.",
      button: "Open Jobs",
      route: "/jobs",
      accent: palette.blue,
      soft: palette.blueSoft,
    },
    {
      title: "Courses / Learning",
      text: "Student learning paths and course recommendations will live here soon.",
      button: "Coming soon",
      route: null,
      accent: palette.amber,
      soft: palette.amberSoft,
    },
    {
      title: "RabAI Assistant",
      text: "Student assistant guidance is reserved for the next Engine iteration.",
      button: "Coming soon",
      route: null,
      accent: palette.green,
      soft: palette.greenSoft,
    },
  ],
  freelancer: [
    {
      title: "Freelancer Services",
      text: "Independent service listings and freelancer profile tools are coming soon.",
      button: "Coming soon",
      route: null,
      accent: palette.violet,
      soft: palette.violetSoft,
    },
    {
      title: "Contracts",
      text: "Freelancer contracts and client workflow will be added after the MVP flow is stable.",
      button: "Coming soon",
      route: null,
      accent: palette.blue,
      soft: palette.blueSoft,
    },
    {
      title: "RabAI Assistant",
      text: "Freelancer assistant guidance is reserved for the next Engine iteration.",
      button: "Coming soon",
      route: null,
      accent: palette.green,
      soft: palette.greenSoft,
    },
  ],
};

const homeCopyByRole: Record<Exclude<AuthRole, "admin">, {
  badge: string;
  title: string;
  subtitle: string;
}> = {
  worker: {
    badge: "Worker home",
    title: "Welcome to RabAI Engine",
    subtitle:
      "Your worker-focused home for jobs, applications, career progress, learning, and assistant guidance.",
  },
  business: {
    badge: "Business home",
    title: "RabAI Engine for companies",
    subtitle:
      "Manage jobs, candidates, contracts, and company next steps from one logged-in homepage.",
  },
  student: {
    badge: "Student home",
    title: "RabAI Engine for students",
    subtitle:
      "Open your student profile, explore job options, and prepare future learning paths.",
  },
  freelancer: {
    badge: "Freelancer home",
    title: "RabAI Engine for freelancers",
    subtitle:
      "Freelancer services are planned for a future RabAI Engine release.",
  },
};

const adminEntries: AdminEntry[] = [
  {
    title: "Muncitor",
    icon: "🧰",
    subtitle: "Joburi, carieră, aplicații",
    route: "/worker-dashboard",
    accent: palette.blue,
    soft: palette.blueSoft,
  },
  {
    title: "Freelancer",
    icon: "🧑‍💻",
    subtitle: "Servicii independente",
    route: null,
    accent: palette.violet,
    soft: palette.violetSoft,
  },
  {
    title: "Firmă",
    icon: "🏢",
    subtitle: "Joburi, candidați, contracte",
    route: "/business-dashboard",
    accent: palette.red,
    soft: palette.redSoft,
  },
  {
    title: "Student",
    icon: "🎓",
    subtitle: "Cursuri, profil, joburi",
    route: "/student-profile",
    accent: palette.amber,
    soft: palette.amberSoft,
  },
];

function getSafePublicRole(role: AuthRole | undefined) {
  return role && role !== "admin" ? role : "worker";
}

export default function EngineScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const displayName = user?.fullName || user?.email || "RabAI account";
  const adminUser = user?.isAdmin === true;
  const publicRole = getSafePublicRole(user?.role);
  const homeCopy = homeCopyByRole[publicRole];
  const homeCards = homeCardsByRole[publicRole];

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

          {adminUser ? (
            <>
              <View style={styles.hero}>
                <Text style={styles.heroBadge}>Admin activ</Text>
                <Text style={styles.title}>RabAI Engine</Text>
                <Text style={styles.subtitle}>
                  Alege zona în care vrei să intri.
                </Text>
              </View>

              <View style={styles.adminSelectorGrid}>
                {adminEntries.map((entry) => (
                  <Pressable
                    accessibilityRole="button"
                    disabled={!entry.route}
                    key={entry.title}
                    style={[
                      styles.adminCircle,
                      { backgroundColor: entry.soft },
                      !entry.route && styles.disabledEntry,
                    ]}
                    onPress={() => {
                      if (entry.route) {
                        router.push(entry.route as any);
                      }
                    }}
                  >
                    <Text style={styles.adminIcon}>{entry.icon}</Text>
                    <Text style={[styles.adminTitle, { color: entry.accent }]}>
                      {entry.title}
                    </Text>
                    <Text style={styles.adminSubtitle}>{entry.subtitle}</Text>
                    {!entry.route ? (
                      <Text style={styles.comingSoonText}>În curând</Text>
                    ) : null}
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.hero}>
                <Text style={styles.heroBadge}>{homeCopy.badge}</Text>
                <Text style={styles.title}>{homeCopy.title}</Text>
                <Text style={styles.subtitle}>{homeCopy.subtitle}</Text>
              </View>

              <View style={styles.cardGrid}>
                {homeCards.map((card) => (
                  <View key={card.title} style={styles.productCard}>
                    <View
                      style={[styles.cardSignal, { backgroundColor: card.soft }]}
                    >
                      <View
                        style={[
                          styles.signalDot,
                          { backgroundColor: card.accent },
                        ]}
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
                        {
                          backgroundColor: card.route
                            ? card.accent
                            : palette.line,
                        },
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
            </>
          )}
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

  adminSelectorGrid: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.five,
    justifyContent: "center",
    marginBottom: Spacing.five,
  },

  adminCircle: {
    alignItems: "center",
    aspectRatio: 1,
    borderColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: Radius.round,
    borderWidth: 2,
    justifyContent: "center",
    maxWidth: 220,
    minWidth: 170,
    padding: Spacing.three,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    width: "43%",
    elevation: 4,
  },

  disabledEntry: {
    opacity: 0.62,
  },

  adminIcon: {
    fontSize: 42,
    marginBottom: Spacing.md,
  },

  adminTitle: {
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },

  adminSubtitle: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.compact,
    maxWidth: 150,
    textAlign: "center",
  },

  comingSoonText: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: Radius.round,
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },

});
