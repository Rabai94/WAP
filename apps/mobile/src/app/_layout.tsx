import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FloatingMessagesButton from "@/components/navigation/FloatingMessagesButton";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <View style={styles.root}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <FloatingMessagesButton />
          </View>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
