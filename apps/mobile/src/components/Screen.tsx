import { ReactNode } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { Colors, Spacing } from "@/theme";

type ScreenProps = {
  children: ReactNode;
};

export default function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
});