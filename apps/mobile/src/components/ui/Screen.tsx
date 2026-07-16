import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Spacing } from "@/theme";

type ScreenProps = {
  children: ReactNode;
  centered?: boolean;
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Screen({
  children,
  centered = true,
  plain = false,
  style,
}: ScreenProps) {
  return (
    <View
      style={[
        styles.container,
        centered && styles.centered,
        plain && styles.plain,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: Spacing.screen,
  },

  centered: {
    justifyContent: "center",
  },

  plain: {
    backgroundColor: Colors.backgroundPlain,
  },
});
