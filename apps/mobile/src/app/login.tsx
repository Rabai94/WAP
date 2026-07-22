import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
  RabAIInput,
} from "@/components/ui";
import type { OnboardingIntent } from "@/domain/account/types";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { sanitizeAuthReturnPath } from "@/services/auth/authNavigation";
import {
  Colors,
  ControlHeight,
  Radius,
  Spacing,
  Typography,
} from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string | string[];
    notice?: string | string[];
    returnTo?: string | string[];
  }>();
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
        accountType:
          selectedOnboardingIntent === "create_organization"
            ? "organization"
            : "personal",
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
  const submitTitle =
    authMode === "signup" ? t("login.signupSubmit") : t("login.submit");
  const submittingLabel =
    authMode === "signup"
      ? t("login.signupSubmitting")
      : t("login.submitting");

  return (
    <PageContainer
      centered
      keyboardShouldPersistTaps="handled"
      maxWidth="narrow"
      scroll
    >
      <View style={styles.form}>
        <View style={styles.brandRow}>
          <View style={styles.brandAccent} />
          <View>
            <Text style={styles.logo}>RabAI</Text>
            <Text style={styles.brandSubtitle}>{t("login.brandSubtitle")}</Text>
          </View>
        </View>

        <PageHeader
          description={
            authMode === "signup"
              ? t("login.signupSubtitle")
              : t("login.subtitle")
          }
          title={
            authMode === "signup" ? t("login.signupTitle") : t("login.title")
          }
        />

        {authMode === "signup" ? (
          <View accessibilityRole="radiogroup" style={styles.intentGroup}>
            <Text style={styles.intentTitle}>
              {t("login.intentQuestion")}
            </Text>
            <View style={styles.intentOptions}>
              <IntentOption
                active={selectedOnboardingIntent === "personal"}
                description={t("login.intentPersonalText")}
                disabled={isSubmitting}
                label={t("login.intentPersonalTitle")}
                onPress={() => setSelectedOnboardingIntent("personal")}
              />
              <IntentOption
                active={selectedOnboardingIntent === "create_organization"}
                description={t("login.intentOrganizationText")}
                disabled={isSubmitting}
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
          <RabAIInput
            autoComplete="name"
            autoCapitalize="words"
            containerStyle={styles.fieldGroup}
            disabled={isSubmitting}
            label={t("login.fullName")}
            onChangeText={setFullName}
            placeholder={t("login.fullNamePlaceholder")}
            required
            textContentType="name"
            value={fullName}
          />
        ) : null}

        <RabAIInput
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.fieldGroup}
          disabled={isSubmitting}
          keyboardType="email-address"
          label={t("common.email")}
          onChangeText={setEmail}
          placeholder="you@example.com"
          required
          textContentType="emailAddress"
          value={email}
        />

        {authMode === "signup" ? (
          <RabAIInput
            autoComplete="tel"
            containerStyle={styles.fieldGroup}
            disabled={isSubmitting}
            keyboardType="phone-pad"
            label={t("common.phone")}
            onChangeText={setPhone}
            placeholder={t("login.phonePlaceholder")}
            textContentType="telephoneNumber"
            value={phone}
          />
        ) : null}

        <RabAIInput
          autoComplete={authMode === "signup" ? "new-password" : "current-password"}
          containerStyle={styles.fieldGroup}
          disabled={isSubmitting}
          label={t("login.password")}
          onChangeText={setPassword}
          placeholder={t("login.passwordPlaceholder")}
          required
          secureTextEntry
          textContentType={authMode === "signup" ? "newPassword" : "password"}
          value={password}
        />

        {authMode === "signup" ? (
          <RabAIInput
            autoComplete="new-password"
            containerStyle={styles.fieldGroup}
            disabled={isSubmitting}
            label={t("login.confirmPassword")}
            onChangeText={setConfirmPassword}
            placeholder={t("login.confirmPasswordPlaceholder")}
            required
            secureTextEntry
            textContentType="newPassword"
            value={confirmPassword}
          />
        ) : null}

        {visibleAccountCreatedMessage ? (
          <Text accessibilityLiveRegion="polite" style={styles.successText}>
            {visibleAccountCreatedMessage}
          </Text>
        ) : null}

        {error ? (
          <Text accessibilityLiveRegion="assertive" role="alert" style={styles.errorText}>
            {error}
          </Text>
        ) : null}

        <RabAIButton
          accessibilityLabel={submitTitle}
          disabled={loading}
          fullWidth
          loading={isSubmitting}
          loadingLabel={submittingLabel}
          onPress={handleSubmit}
          size="lg"
          title={submitTitle}
        />

        <View style={styles.actionRow}>
          <RabAIButton
            disabled={isSubmitting}
            onPress={() => {
              switchMode(authMode === "signup" ? "login" : "signup");
            }}
            size="sm"
            title={
              authMode === "signup"
                ? t("login.switchToLogin")
                : t("login.createAccount")
            }
            variant="ghost"
          />

          <RabAIButton
            disabled={isSubmitting}
            onPress={() => {
              router.replace("/" as any);
            }}
            size="sm"
            title={t("login.back")}
            variant="ghost"
          />
        </View>
      </View>
    </PageContainer>
  );
}

function IntentOption({
  active,
  description,
  disabled,
  label,
  onPress,
}: {
  active: boolean;
  description: string;
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <RabAICard
      accessibilityLabel={`${label}. ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: active, disabled }}
      disabled={disabled}
      interactive
      onPress={onPress}
      padding="sm"
      selected={active}
      style={styles.intentOption}
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
    </RabAICard>
  );
}

const styles = StyleSheet.create({
  form: {
    alignSelf: "stretch",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.panel,
    padding: Spacing.section,
    width: "100%",
  },

  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.component,
    marginBottom: Spacing.section,
  },

  brandAccent: {
    alignSelf: "stretch",
    backgroundColor: Colors.goldPrimary,
    borderRadius: Radius.pill,
    width: Spacing.compact,
  },

  logo: {
    color: Colors.textPrimary,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
  },

  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.compact,
    textTransform: "uppercase",
  },

  intentGroup: {
    marginBottom: Spacing.section,
  },

  intentTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.control,
  },

  intentOptions: {
    gap: Spacing.control,
  },

  intentOption: {
    minHeight: ControlHeight.minimumTouch,
  },

  intentOptionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.compact,
  },

  intentOptionTitleActive: {
    color: Colors.goldPressed,
  },

  intentOptionText: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },

  intentHelperText: {
    backgroundColor: Colors.informationSurface,
    borderColor: Colors.informationBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.control,
    padding: Spacing.inline,
  },

  fieldGroup: {
    marginBottom: Spacing.component,
  },

  errorText: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.component,
    padding: Spacing.inline,
  },

  successText: {
    backgroundColor: Colors.successSurface,
    borderColor: Colors.successBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.component,
    padding: Spacing.inline,
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "center",
    marginTop: Spacing.component,
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
    : "/engine";
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
