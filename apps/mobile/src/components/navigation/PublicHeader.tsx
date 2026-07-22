import { useLanguage } from "@/i18n/LanguageProvider";
import {
  Breakpoints,
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
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
  { key: "courses", route: "/courses", labelKey: "home.nav.courses" },
];

export default function PublicHeader({ active = "home" }: PublicHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isCompact = width <= Breakpoints.mobile;

  function navigate(route: string) {
    router.push(route as never);
  }

  const navigation = (
    <View style={[styles.navLinks, isCompact && styles.navLinksCompact]}>
      {publicNavItems.map((item) => (
        <NavLink
          active={active === item.key}
          compact={isCompact}
          key={item.key}
          label={t(item.labelKey)}
          onPress={() => navigate(item.route)}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.bar, isCompact && styles.barCompact]}>
      <InteractivePressable
        accessibilityLabel={`RabAI — ${t("common.home")}`}
        accessibilityRole="button"
        hoverStyle={styles.neutralHover}
        onPress={() => router.replace("/" as never)}
        pressedStyle={styles.neutralPressed}
        style={styles.brandWrap}
      >
        <View style={styles.brandAccent} />
        <Text style={styles.brandTitle}>RabAI</Text>
      </InteractivePressable>

      {!isCompact ? navigation : null}

      <View style={styles.authActions}>
        <InteractivePressable
          accessibilityLabel={t("common.login")}
          accessibilityRole="button"
          hoverStyle={styles.neutralHover}
          onPress={() => router.push("/login" as never)}
          pressedStyle={styles.neutralPressed}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>{t("common.login")}</Text>
        </InteractivePressable>
        <InteractivePressable
          accessibilityLabel={t("common.register")}
          accessibilityRole="button"
          hoverStyle={styles.primaryHover}
          onPress={() => router.push("/login?mode=signup" as never)}
          pressedStyle={styles.primaryPressed}
          style={styles.signupButton}
        >
          <Text style={styles.signupText}>{t("common.register")}</Text>
        </InteractivePressable>
      </View>

      {isCompact ? navigation : null}
    </View>
  );
}

function NavLink({
  active,
  compact,
  label,
  onPress,
}: {
  active: boolean;
  compact: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <InteractivePressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hoverStyle={styles.neutralHover}
      onPress={onPress}
      pressedStyle={styles.neutralPressed}
      style={[
        styles.navLink,
        compact && styles.navLinkCompact,
        active && styles.navLinkActive,
      ]}
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
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
    justifyContent: "space-between",
    paddingBottom: Spacing.inline,
  },
  barCompact: {
    alignItems: "stretch",
  },
  brandWrap: {
    alignItems: "center",
    borderRadius: Radius.control,
    flexDirection: "row",
    gap: Spacing.control,
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.control,
  },
  brandAccent: {
    alignSelf: "stretch",
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    marginVertical: Spacing.control,
    width: Spacing.compact,
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  navLinks: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.compact,
  },
  navLinksCompact: {
    width: "100%",
  },
  navLink: {
    alignItems: "center",
    borderRadius: Radius.control,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
  },
  navLinkCompact: {
    flex: 1,
    paddingHorizontal: Spacing.control,
  },
  navLinkActive: {
    backgroundColor: Colors.goldMuted,
  },
  navLinkText: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  navLinkTextActive: {
    color: Colors.goldPressed,
  },
  authActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.compact,
  },
  loginButton: {
    alignItems: "center",
    borderRadius: Radius.control,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
  },
  loginText: {
    color: Colors.textPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  signupButton: {
    alignItems: "center",
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.control,
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.inline,
  },
  signupText: {
    color: Colors.onPrimary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  neutralHover: {
    backgroundColor: Colors.surfaceInteractive,
  },
  neutralPressed: {
    backgroundColor: Colors.selection,
  },
  primaryHover: {
    backgroundColor: Colors.goldHover,
  },
  primaryPressed: {
    backgroundColor: Colors.goldPressed,
  },
});
