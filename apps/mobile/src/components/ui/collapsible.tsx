import { SymbolView } from "expo-symbols";
import { type PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Colors,
  ControlHeight,
  IconSize,
  InteractionStyles,
  Opacity,
  Radius,
  Spacing,
  Typography,
} from "@/theme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onPress={() => setIsOpen((value) => !value)}
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
          focused && InteractionStyles.focusRing,
          InteractionStyles.pointer,
        ]}
      >
        <View accessibilityElementsHidden style={styles.iconFrame}>
          <SymbolView
            name={{
              android: "chevron_right",
              ios: "chevron.right",
              web: "chevron_right",
            }}
            size={IconSize.sm}
            style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
            tintColor={Colors.textSecondary}
            weight="semibold"
          />
        </View>
        <Text style={styles.title}>{title}</Text>
      </Pressable>
      {isOpen ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    minWidth: 0,
  },
  heading: {
    alignItems: "center",
    borderRadius: Radius.control,
    flexDirection: "row",
    gap: Spacing.control,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.control,
  },
  pressedHeading: {
    backgroundColor: Colors.goldMuted,
    opacity: Opacity.pressed,
  },
  iconFrame: {
    alignItems: "center",
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    width: ControlHeight.minimumTouch,
  },
  title: {
    color: Colors.textPrimary,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
  },
  content: {
    borderLeftColor: Colors.borderStrong,
    borderLeftWidth: 1,
    marginLeft: ControlHeight.minimumTouch / 2,
    marginTop: Spacing.control,
    paddingBottom: Spacing.inline,
    paddingLeft: Spacing.component,
  },
});
