import { useLanguage } from "@/i18n/LanguageProvider";
import { languages, type LanguageCode } from "@/i18n/translations";
import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import { getLanguageNationalIdentity } from "@/domain/nationality/nationalities";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

type ActiveTab =
  | "home"
  | "jobs"
  | "tasks"
  | "services"
  | "courses"
  | "messages"
  | "profile";

type AuthenticatedHeaderProps = {
  active?: ActiveTab;
};

const navCopyByLanguage = {
  ro: {
    home: "Acasă",
    jobs: "Locuri de muncă",
    tasks: "Lucrări punctuale",
    services: "Servicii",
    courses: "Cursuri",
    messages: "Mesaje",
    profile: "Profil",
  },
  en: {
    home: "Home",
    jobs: "Jobs",
    tasks: "Tasks",
    services: "Services",
    courses: "Courses",
    messages: "Messages",
    profile: "Profile",
  },
  de: {
    home: "Start",
    jobs: "Jobs",
    tasks: "Aufträge",
    services: "Dienstleistungen",
    courses: "Kurse",
    messages: "Nachrichten",
    profile: "Profil",
  },
} satisfies Record<LanguageCode, Record<ActiveTab, string>>;

export default function AuthenticatedHeader({ active = "home" }: AuthenticatedHeaderProps) {
  const router = useRouter();
  const { isSigningOut, signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { width } = useWindowDimensions();
  const navCopy = navCopyByLanguage[language];
  const isCompact = width < 900;

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      console.error("RabAI sign out failed", error);
    }
  }

  return (
    <View style={[styles.bar, isCompact && styles.barCompact]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/engine" as any)}
        style={styles.brandWrap}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <View style={styles.brandTextWrap}>
          <Text style={styles.brandTitle}>RabAI</Text>
          <Text style={styles.brandSubtitle}>{t("common.workspace")}</Text>
        </View>
      </Pressable>

      <View style={[styles.navLinks, isCompact && styles.navLinksCompact]}>
        <NavLink label={navCopy.home} active={active === "home"} onPress={() => router.replace("/engine" as any)} />
        <NavLink label={navCopy.jobs} active={active === "jobs"} onPress={() => router.push("/jobs" as any)} />
        <NavLink label={navCopy.tasks} active={active === "tasks"} onPress={() => router.push("/tasks" as any)} />
        <NavLink label={navCopy.services} active={active === "services"} onPress={() => router.push("/services" as any)} />
        <NavLink label={navCopy.courses} active={active === "courses"} onPress={() => router.push("/courses" as any)} />
        <NavLink label={navCopy.messages} active={active === "messages"} onPress={() => router.push("/messages" as any)} />
        <NavLink label={navCopy.profile} active={active === "profile"} onPress={() => router.push("/profile" as any)} />
      </View>

      <View style={[styles.trailing, isCompact && styles.trailingCompact]}>
        <View style={[styles.languageSelector, isCompact && styles.languageSelectorCompact]}>
          {languages.map((item) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: language === item.code }}
              key={item.code}
              onPress={() => {
                setLanguage(item.code);
              }}
              style={[
                styles.languageButton,
                language === item.code && styles.languageButtonActive,
              ]}
            >
              <NationalInsigniaBadge
                identity={getLanguageNationalIdentity(item.code)}
                showCode
                size="sm"
              />
            </Pressable>
          ))}
        </View>

        <View style={[styles.userCard, isCompact && styles.userCardCompact]}>
          <View style={styles.userTextWrap}>
            <Text numberOfLines={1} style={styles.userName}>
              {user?.fullName || user?.email || t("common.workspace")}
            </Text>
            {user?.email ? (
              <Text numberOfLines={1} style={styles.userEmail}>{user.email}</Text>
            ) : null}
          </View>

          <View style={[styles.accountActions, isCompact && styles.accountActionsCompact]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/organizations" as any)}
              style={styles.accountButton}
            >
              <Text numberOfLines={1} style={styles.accountButtonText}>
                {t("common.myOrganizations")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSigningOut }}
              disabled={isSigningOut}
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text numberOfLines={1} style={styles.logoutButtonText}>{t("common.logout")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.navLink, active && styles.navLinkActive]}>
      <Text
        numberOfLines={1}
        style={[styles.navLinkText, active && styles.navLinkTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderColor: Colors.borderMuted,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    maxWidth: 1280,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.sm,
    width: "100%",
    ...Shadows.card,
  },
  barCompact: {
    alignItems: "stretch",
    flexDirection: "column",
    flexWrap: "wrap",
  },
  brandWrap: {
    alignItems: "center",
    flexShrink: 0,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  brandTextWrap: {
    maxWidth: 86,
  },
  logoCircle: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: Radius.lg,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    width: 38,
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
    lineHeight: 14,
  },
  navLinks: {
    alignItems: "center",
    flex: 1,
    flexShrink: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
    justifyContent: "center",
    minWidth: 0,
  },
  navLinksCompact: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  navLink: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    height: 38,
    minWidth: 0,
    paddingHorizontal: Spacing.md,
  },
  navLinkActive: {
    backgroundColor: Colors.brandSoft,
    borderColor: "rgba(20, 92, 255, 0.18)",
  },
  navLinkText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },
  navLinkTextActive: {
    color: Colors.brandDeep,
  },
  trailing: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "nowrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  trailingCompact: {
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  languageSelector: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
  },
  languageSelectorCompact: {
    flexWrap: "wrap",
  },
  languageButton: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    padding: 0,
    width: 54,
  },
  languageButtonActive: {
    borderColor: Colors.brand,
    shadowColor: Colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
  },
  userCard: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.sm,
    height: 42,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 0,
  },
  userCardCompact: {
    flexWrap: "wrap",
    height: "auto",
    minHeight: 42,
  },
  userTextWrap: {
    maxWidth: 140,
    minWidth: 84,
  },
  userName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: Typography.fontWeight.extraBold,
  },
  userEmail: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  accountActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: Spacing.xs,
  },
  accountActionsCompact: {
    flexWrap: "wrap",
  },
  accountButton: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    height: 34,
    minWidth: 112,
    paddingHorizontal: Spacing.md,
  },
  accountButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: "#FFF1F6",
    borderColor: "rgba(240, 19, 99, 0.18)",
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    height: 34,
    minWidth: 82,
    paddingHorizontal: Spacing.md,
  },
  logoutButtonText: {
    color: "#F01363",
    fontSize: 12,
    fontWeight: Typography.fontWeight.extraBold,
  },
});
