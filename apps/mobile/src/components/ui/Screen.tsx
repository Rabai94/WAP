import { type ReactNode } from "react";
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Breakpoints, Colors, PageGutters } from "@/theme";

type ScreenProps = {
  children: ReactNode;
  centered?: boolean;
  plain?: boolean;
  style?: StyleProp<ViewStyle>;
};

// Compatibility surface. New pages should use PageContainer.
export default function Screen({
  centered = true,
  children,
  plain = false,
  style,
}: ScreenProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding =
    width < Breakpoints.mobile ? PageGutters.compact : PageGutters.tablet;

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: horizontalPadding },
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
    backgroundColor: Colors.canvas,
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
    paddingVertical: PageGutters.tablet,
  },
  centered: {
    justifyContent: "center",
  },
  plain: {
    backgroundColor: Colors.surface,
  },
});
