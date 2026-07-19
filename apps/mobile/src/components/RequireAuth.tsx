import { ReactNode, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import type { AuthRole } from "@/domain/auth/auth.types";
import { canAccessRole } from "@/domain/auth/roleAccess";
import { useAuth } from "@/providers/AuthProvider";
import { buildLoginPath } from "@/services/auth/authNavigation";
import { Colors, Spacing, Typography } from "@/theme";

type RequireAuthProps = {
  children: ReactNode;
  requiredRole?: AuthRole;
};

export default function RequireAuth({
  children,
  requiredRole,
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSigningOut, loading, session, user } = useAuth();

  useEffect(() => {
    if (loading || isSigningOut) {
      return;
    }

    if (!session) {
      router.replace(buildLoginPath(pathname) as any);
      return;
    }

    if (requiredRole && !canAccessRole(user, requiredRole)) {
      router.replace("/engine" as any);
    }
  }, [isSigningOut, loading, pathname, requiredRole, router, session, user]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingTitle}>RabAI</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isSigningOut && !session) {
    return null;
  }

  if (!session || (requiredRole && !canAccessRole(user, requiredRole))) {
    return null;
  }

  return children;
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: "center",
    backgroundColor: Colors.background,
    flex: 1,
    justifyContent: "center",
    padding: Spacing.screen,
  },

  loadingTitle: {
    color: Colors.text,
    fontSize: Typography.screenTitle,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
