import { useLanguage } from "@/i18n/LanguageProvider";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type PublicTab = "home" | "jobs" | "tasks" | "services" | "courses";

type PublicHeaderProps = {
  active?: PublicTab;
};

const publicNavItems: { key: PublicTab; route: string; labelKey: string }[] = [
  { key: "home", route: "/", labelKey: "common.home" },
  { key: "jobs", route: "/jobs", labelKey: "home.nav.jobs" },
  { key: "tasks", route: "/tasks", labelKey: "home.nav.tasks" },
  { key: "services", route: "/services", labelKey: "home.nav.services" },
  { key: "courses", route: "/courses", labelKey: "home.nav.courses" },
];

export default function PublicHeader({ active = "home" }: PublicHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();

  function navigate(route: string) {
    router.push(route as never);
  }

  return (
    <View style={styles.bar}>
      <InteractivePressable
        accessibilityLabel="RabAI — Acasă"
        accessibilityRole="button"
        hoverStyle={styles.neutralHover}
        onPress={() => router.replace("/" as never)}
        pressedStyle={styles.neutralPressed}
        style={styles.brandWrap}
      >
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.brandTitle}>RabAI</Text>
      </InteractivePressable>

      <View style={styles.navLinks}>
        {publicNavItems.map((item) => (
          <NavLink
            active={active === item.key}
            key={item.key}
            label={t(item.labelKey)}
            onPress={() => navigate(item.route)}
          />
        ))}
      </View>

      <View style={styles.authActions}>
        <InteractivePressable
          accessibilityRole="button"
          hoverStyle={styles.neutralHover}
          onPress={() => router.push("/login" as never)}
          pressedStyle={styles.neutralPressed}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>{t("common.login")}</Text>
        </InteractivePressable>
        <InteractivePressable
          accessibilityRole="button"
          hoverStyle={styles.primaryHover}
          onPress={() => router.push("/login?mode=signup" as never)}
          pressedStyle={styles.primaryPressed}
          style={styles.signupButton}
        >
          <Text style={styles.signupText}>{t("common.register")}</Text>
        </InteractivePressable>
      </View>
    </View>
  );
}

function NavLink({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <InteractivePressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hoverStyle={styles.neutralHover}
      onPress={onPress}
      pressedStyle={styles.neutralPressed}
      style={[styles.navLink, active && styles.navLinkActive]}
    >
      <Text
        numberOfLines={1}
        style={[styles.navLinkText, active && styles.navLinkTextActive]}
      >
        {label}
      </Text>
    </InteractivePressable>
  );
}

type InteractivePressableProps = Omit<PressableProps, "style"> & {
  hoverStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

function InteractivePressable({
  disabled,
  hoverStyle,
  onBlur,
  onFocus,
  onHoverIn,
  onHoverOut,
  pressedStyle,
  style,
  ...props
}: InteractivePressableProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={({ pressed }) => [
        style,
        !disabled && InteractionStyles.pointer,
        !disabled && hovered && hoverStyle,
        !disabled && pressed && pressedStyle,
        !disabled && focused && InteractionStyles.focusRing,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.card,
  },
  brandWrap: {
    alignItems: "center",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.sm,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.compact,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  logoText: {
    color: Colors.brandOn,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  brandTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  navLinks: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  navLink: {
    alignItems: "center",
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    minWidth: 86,
    paddingHorizontal: Spacing.md,
  },
  navLinkActive: {
    backgroundColor: Colors.brandSoft,
  },
  navLinkText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  navLinkTextActive: {
    color: Colors.brandDeep,
  },
  authActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  loginButton: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderNeutral,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    minWidth: 104,
    paddingHorizontal: Spacing.md,
  },
  loginText: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  signupButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    minWidth: 104,
    paddingHorizontal: Spacing.md,
  },
  signupText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  neutralHover: {
    backgroundColor: Colors.surfaceInteractive,
  },
  neutralPressed: {
    backgroundColor: Colors.selection,
  },
  primaryHover: {
    backgroundColor: Colors.primaryHover,
  },
  primaryPressed: {
    backgroundColor: Colors.primaryPressed,
  },
});
