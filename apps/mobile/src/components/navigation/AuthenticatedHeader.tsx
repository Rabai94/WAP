import { hasRole, isAdmin } from "@/domain/auth/roleAccess";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActiveTab = "home" | "jobs" | "courses" | "profile";

type AuthenticatedHeaderProps = {
  active?: ActiveTab;
};

export default function AuthenticatedHeader({ active = "home" }: AuthenticatedHeaderProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { t } = useLanguage();
  const canOpenWorkerProfile = hasRole(user, "worker") || isAdmin(user);

  async function handleLogout() {
    await signOut();
    router.replace("/login" as any);
  }

  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" onPress={() => router.replace("/engine" as any)} style={styles.brandWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>RabAI</Text>
          <Text style={styles.brandSubtitle}>{t("common.workspace")}</Text>
        </View>
      </Pressable>

      <View style={styles.navLinks}>
        <NavLink label={t("common.home")} active={active === "home"} onPress={() => router.replace("/engine" as any)} />
        <NavLink label={t("home.nav.jobs")} active={active === "jobs"} onPress={() => router.push("/jobs" as any)} />
        <NavLink label={t("home.nav.courses")} active={active === "courses"} onPress={() => router.push("/courses" as any)} />
        {canOpenWorkerProfile ? <NavLink label={t("common.profile")} active={active === "profile"} onPress={() => router.push("/worker-dashboard" as any)} /> : null}
      </View>

      <Pressable accessibilityRole="button" onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>{t("common.logout")}</Text>
      </Pressable>
    </View>
  );
}

function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.navLink, active && styles.navLinkActive]}>
      <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
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
  brandWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  logoCircle: {
    alignItems: "center",
    backgroundColor: "#145CFF",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  logoText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  brandTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.small,
  },
  navLinks: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  navLink: {
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navLinkActive: {
    backgroundColor: "#F2F6FF",
  },
  navLinkText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  navLinkTextActive: {
    color: "#145CFF",
  },
  logoutButton: {
    backgroundColor: "#FFF1F6",
    borderRadius: Radius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoutButtonText: {
    color: "#F01363",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
