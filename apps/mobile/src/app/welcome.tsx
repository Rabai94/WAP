import { SafeAreaView, StyleSheet, View } from "react-native";

import Button from "@/components/Button";
import AppText from "@/components/AppText";

import { Colors, Spacing } from "@/theme";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <AppText variant="h1">
          WAP
        </AppText>

        <AppText variant="title">
          Build your future.
        </AppText>

        <AppText variant="body">
          One ecosystem for careers, services,
          companies and opportunities.
        </AppText>

        <Button title="Get Started" />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
});
