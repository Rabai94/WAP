import { type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Breakpoints,
  Colors,
  PageGutters,
  PageWidths,
  Spacing,
} from "@/theme";

export type PageWidth = keyof typeof PageWidths | number | "none";

export type PageContainerProps = {
  children: ReactNode;
  maxWidth?: PageWidth;
  centered?: boolean;
  plain?: boolean;
  safeArea?: boolean;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  scrollEnabled?: ScrollViewProps["scrollEnabled"];
  testID?: string;
};

export default function PageContainer({
  centered = false,
  children,
  contentStyle,
  keyboardShouldPersistTaps = "handled",
  maxWidth = "content",
  padded = true,
  plain = false,
  safeArea = true,
  scroll = false,
  scrollEnabled = true,
  style,
  testID,
}: PageContainerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontalPadding = padded ? resolveGutter(width) : 0;
  const resolvedMaxWidth =
    maxWidth === "none"
      ? undefined
      : typeof maxWidth === "number"
        ? maxWidth
        : PageWidths[maxWidth];
  const responsiveContentStyle: ViewStyle = {
    maxWidth: resolvedMaxWidth,
    paddingBottom: padded
      ? Spacing.section + (safeArea ? insets.bottom : 0)
      : safeArea
        ? insets.bottom
        : 0,
    paddingHorizontal: horizontalPadding,
    paddingTop: padded
      ? Spacing.section + (safeArea ? insets.top : 0)
      : safeArea
        ? insets.top
        : 0,
  };

  if (scroll) {
    return (
      <View
        style={[styles.outer, plain && styles.plain, style]}
        testID={testID}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            responsiveContentStyle,
            centered && styles.centered,
            contentStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.outer, plain && styles.plain, style]} testID={testID}>
      <View
        style={[
          styles.content,
          responsiveContentStyle,
          centered && styles.centered,
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function resolveGutter(width: number) {
  if (width < Breakpoints.mobile) {
    return PageGutters.compact;
  }

  if (width < Breakpoints.tablet) {
    return PageGutters.tablet;
  }

  if (width < Breakpoints.wide) {
    return PageGutters.desktop;
  }

  return PageGutters.wide;
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: Colors.canvas,
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    overflow: "hidden",
  },
  plain: {
    backgroundColor: Colors.surface,
  },
  content: {
    alignSelf: "center",
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: "100%",
  },
  scrollContent: {
    alignSelf: "center",
    flexGrow: 1,
    minWidth: 0,
    width: "100%",
    ...(Platform.OS === "web"
      ? ({ overflowX: "hidden" } as unknown as ViewStyle)
      : {}),
  },
  centered: {
    justifyContent: "center",
  },
});
