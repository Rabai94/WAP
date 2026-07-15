import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { OnboardingIntent } from "@/domain/account/types";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { sanitizeAuthReturnPath } from "@/services/auth/authNavigation";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F8FAFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F6FF",
  ink: "#101828",
  muted: "#667085",
  line: "#D9E2F4",
  violet: "#6D28D9",
  violetDark: "#2E1065",
  red: "#E11D48",
  redSoft: "#FFE7EF",
  shadow: "#182033",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string | string[];
    notice?: string | string[];
    returnTo?: string | string[];
  }>();
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const { loading, session, signIn, signUp } = useAuth();
  const authMode = readModeParam(params.mode) === "signup" ? "signup" : "login";
  const notice = readModeParam(params.notice);
  const returnTo = sanitizeAuthReturnPath(params.returnTo);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedOnboardingIntent, setSelectedOnboardingIntent] =
    useState<OnboardingIntent | null>(null);
  const [accountCreatedMessage, setAccountCreatedMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      router.replace((returnTo ?? getPostAuthRoute(session.user)) as any);
    }
  }, [loading, returnTo, router, session]);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (authMode === "signup") {
      await handleSignup();
      return;
    }

    await handleLogin();
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError(t("login.missingCredentials"));
      return;
    }

    setError("");
    setAccountCreatedMessage("");
    setIsSubmitting(true);

    try {
      const result = await signIn({ email: email.trim(), password });
      const nextUser = result.session?.user ?? result.user;
      router.replace((returnTo ?? getPostAuthRoute(nextUser)) as any);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("login.fallbackError")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignup() {
    if (!selectedOnboardingIntent) {
      setError(t("login.intentRequired"));
      return;
    }

    if (!fullName.trim()) {
      setError(t("login.fullNameRequired"));
      return;
    }

    if (!email.trim() || !password) {
      setError(t("login.missingCredentials"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("login.passwordMismatch"));
      return;
    }

    setError("");
    setAccountCreatedMessage("");
    setIsSubmitting(true);

    try {
      const result = await signUp({
        email: email.trim(),
        fullName: fullName.trim(),
        onboardingIntent: selectedOnboardingIntent,
        password,
        phone: phone.trim() || undefined,
      });

      if (result.session) {
        router.replace(getPostSignupRoute(selectedOnboardingIntent) as any);
        return;
      }

      setAccountCreatedMessage(t("login.signupNeedsConfirmation"));
      setPassword("");
      setConfirmPassword("");
      router.replace("/login?notice=account-created" as any);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("login.fallbackError")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setError("");
    setAccountCreatedMessage("");
    setFullName("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setSelectedOnboardingIntent(null);
    router.replace(buildLoginModePath(nextMode, returnTo) as any);
  }

  const visibleAccountCreatedMessage =
    accountCreatedMessage ||
    (authMode === "login" && notice === "account-created"
      ? t("login.signupNeedsConfirmation")
      : "");

  return (
    <ScrollView
      contentContainerStyle={[
        styles.screen,
        {
          paddingHorizontal: responsive.horizontalPadding,
          paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.card,
          {
            maxWidth: responsive.isWide
              ? 640
              : responsive.isDesktop
                ? 600
                : 520,
          },
        ]}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>R</Text>
          </View>
          <View>
            <Text style={styles.logo}>RabAI</Text>
            <Text style={styles.brandSubtitle}>{t("login.brandSubtitle")}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {authMode === "signup" ? t("login.signupTitle") : t("login.title")}
        </Text>
        <Text style={styles.subtitle}>
          {authMode === "signup"
            ? t("login.signupSubtitle")
            : t("login.subtitle")}
        </Text>

        {authMode === "signup" ? (
          <View style={styles.intentGroup}>
            <Text style={styles.intentTitle}>
              {t("login.intentQuestion")}
            </Text>
            <View style={styles.intentOptions}>
              <IntentOption
                active={selectedOnboardingIntent === "personal"}
                description={t("login.intentPersonalText")}
                label={t("login.intentPersonalTitle")}
                onPress={() => setSelectedOnboardingIntent("personal")}
              />
              <IntentOption
                active={selectedOnboardingIntent === "create_organization"}
                description={t("login.intentOrganizationText")}
                label={t("login.intentOrganizationTitle")}
                onPress={() =>
                  setSelectedOnboardingIntent("create_organization")
                }
              />
            </View>
            {selectedOnboardingIntent ? (
              <Text style={styles.intentHelperText}>
                {selectedOnboardingIntent === "create_organization"
                  ? t("login.signupOrganizationHelper")
                  : t("login.signupPersonalHelper")}
              </Text>
            ) : null}
          </View>
        ) : null}

        {authMode === "signup" ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("login.fullName")}</Text>
            <TextInput
              autoComplete="name"
              autoCapitalize="words"
              onChangeText={setFullName}
              placeholder={t("login.fullNamePlaceholder")}
              placeholderTextColor={palette.muted}
              style={styles.input}
              textContentType="name"
              value={fullName}
            />
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("common.email")}</Text>
          <TextInput
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={palette.muted}
            style={styles.input}
            textContentType="emailAddress"
            value={email}
          />
        </View>

        {authMode === "signup" ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("common.phone")}</Text>
            <TextInput
              autoComplete="tel"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder={t("login.phonePlaceholder")}
              placeholderTextColor={palette.muted}
              style={styles.input}
              textContentType="telephoneNumber"
              value={phone}
            />
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("login.password")}</Text>
          <TextInput
            autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            onChangeText={setPassword}
            placeholder={t("login.passwordPlaceholder")}
            placeholderTextColor={palette.muted}
            secureTextEntry
            style={styles.input}
            textContentType={authMode === "signup" ? "newPassword" : "password"}
            value={password}
          />
        </View>

        {authMode === "signup" ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("login.confirmPassword")}</Text>
            <TextInput
              autoComplete="new-password"
              onChangeText={setConfirmPassword}
              placeholder={t("login.confirmPasswordPlaceholder")}
              placeholderTextColor={palette.muted}
              secureTextEntry
              style={styles.input}
              textContentType="newPassword"
              value={confirmPassword}
            />
          </View>
        ) : null}

        {visibleAccountCreatedMessage ? (
          <Text style={styles.successText}>{visibleAccountCreatedMessage}</Text>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>
            {isSubmitting
              ? authMode === "signup"
                ? t("login.signupSubmitting")
                : t("login.submitting")
              : authMode === "signup"
                ? t("login.signupSubmit")
                : t("login.submit")}
          </Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.linkButton}
            onPress={() => {
              switchMode(authMode === "signup" ? "login" : "signup");
            }}
          >
            <Text style={styles.linkButtonText}>
              {authMode === "signup"
                ? t("login.switchToLogin")
                : t("login.createAccount")}
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => {
              router.replace("/" as any);
            }}
          >
            <Text style={styles.linkButtonText}>{t("login.back")}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function IntentOption({
  active,
  description,
  label,
  onPress,
}: {
  active: boolean;
  description: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.intentOption,
        active && styles.intentOptionActive,
      ]}
    >
      <Text
        style={[
          styles.intentOptionTitle,
          active && styles.intentOptionTitleActive,
        ]}
      >
        {label}
      </Text>
      <Text style={styles.intentOptionText}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: palette.page,
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.screen,
  },

  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    maxWidth: 520,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    width: "100%",
    elevation: 5,
  },

  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },

  brandMark: {
    alignItems: "center",
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xl,
    height: 54,
    justifyContent: "center",
    width: 54,
  },

  brandMarkText: {
    color: Colors.white,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },

  logo: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
  },

  brandSubtitle: {
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginTop: Spacing.xs,
    textTransform: "uppercase",
  },

  title: {
    color: palette.ink,
    fontSize: Typography.h2,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 34,
    marginBottom: Spacing.xl,
  },

  subtitle: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.five,
  },

  intentGroup: {
    marginBottom: Spacing.xl,
  },

  intentTitle: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },

  intentOptions: {
    gap: Spacing.md,
  },

  intentOption: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },

  intentOptionActive: {
    backgroundColor: "#EEF7FF",
    borderColor: palette.violet,
  },

  intentOptionTitle: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },

  intentOptionTitleActive: {
    color: palette.violetDark,
  },

  intentOptionText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },

  intentHelperText: {
    backgroundColor: "#EEF7FF",
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.md,
    padding: Spacing.lg,
  },

  fieldGroup: {
    marginBottom: Spacing.xl,
  },

  label: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.sm,
  },

  input: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: palette.ink,
    fontSize: Typography.body,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },

  errorText: {
    backgroundColor: palette.redSoft,
    borderRadius: Radius.lg,
    color: palette.red,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },

  successText: {
    backgroundColor: "#E8F8F2",
    borderRadius: Radius.lg,
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.red,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.button,
    fontWeight: Typography.fontWeight.black,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xl,
    justifyContent: "center",
    marginTop: Spacing.three,
  },

  linkButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },

  linkButtonText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
});

function readModeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildLoginModePath(
  mode: "login" | "signup",
  returnTo?: string | null
) {
  const params = new URLSearchParams();

  if (mode === "signup") {
    params.set("mode", "signup");
  }

  if (returnTo) {
    params.set("returnTo", returnTo);
  }

  const queryString = params.toString();

  return `/login${queryString ? `?${queryString}` : ""}`;
}

function getPostSignupRoute(onboardingIntent: OnboardingIntent) {
  return onboardingIntent === "create_organization"
    ? "/organizations/create"
    : "/onboarding/interests";
}

function getPostAuthRoute(
  user:
    | { isAdmin?: boolean; onboardingIntent?: OnboardingIntent }
    | null
    | undefined,
  fallbackOnboardingIntent?: OnboardingIntent | null
) {
  if (user?.isAdmin) {
    return "/engine";
  }

  const onboardingIntent = user?.onboardingIntent ?? fallbackOnboardingIntent;

  if (onboardingIntent === "create_organization") {
    return "/organizations/create";
  }

  if (onboardingIntent === "personal") {
    return "/engine";
  }

  return "/engine";
}
