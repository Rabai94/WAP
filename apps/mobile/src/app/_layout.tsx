import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DesktopAppShell from "@/components/navigation/DesktopAppShell";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/theme";

const shellFreePaths = new Set([
  "/",
  "/account-type",
  "/business",
  "/business-dashboard",
  "/business-form",
  "/companies",
  "/freelancers",
  "/login",
  "/role",
  "/student-profile",
  "/worker",
  "/worker-dashboard",
  "/worker-form",
]);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <View style={styles.root}>
            <AuthenticatedAppFrame />
          </View>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AuthenticatedAppFrame() {
  const pathname = usePathname();
  const router = useRouter();
  const { finishSignOut, isSigningOut, session } = useAuth();
  const shellEnabled = Boolean(session) && !shellFreePaths.has(pathname);

  useEffect(() => {
    if (!isSigningOut || session) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (pathname === "/") {
        finishSignOut();
        return;
      }

      router.replace("/" as never);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [finishSignOut, isSigningOut, pathname, router, session]);

  return (
    <DesktopAppShell enabled={shellEnabled}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </DesktopAppShell>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.canvas,
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
});
