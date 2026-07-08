import { Stack } from "expo-router";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </LanguageProvider>
  );
}
