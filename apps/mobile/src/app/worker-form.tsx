import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import CountryFlagBadge from "@/components/CountryFlagBadge";
import { detectEuropeanCountryFromLocale } from "@/domain/phone/detectCountry";
import {
  EuropeanCountry,
  europeanCountries,
} from "@/domain/phone/europeanCountries";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const palette = {
  page: "#F7F9FD",
  surface: "#FFFFFF",
  surfaceSoft: "#F3F6FB",
  ink: "#111827",
  muted: "#5F6B7A",
  subtle: "#8B95A7",
  line: "#DDE5F2",
  violet: "#6D28D9",
  violetDark: "#3B167A",
  violetSoft: "#F1EAFE",
  blue: "#2563EB",
  blueSoft: "#EAF1FF",
  red: "#E11D48",
  redSoft: "#FFE7EE",
  green: "#0F9F6E",
  greenSoft: "#E8F8F2",
  shadow: "#172033",
} as const;

type VerificationMethod = "email" | "sms" | "whatsapp";

type FormErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "phone"
    | "verificationMethod"
    | "verificationCode",
    string
  >
>;

const benefits = [
  "workerForm.benefit.verifiedJobs",
  "workerForm.benefit.safePayments",
  "workerForm.benefit.ratings",
  "workerForm.benefit.careerGrowth",
] as const;

const trustCards = [
  "workerForm.trust.verifiedCompanies",
  "workerForm.trust.safePayment",
  "workerForm.trust.support",
] as const;

const verificationMethods: VerificationMethod[] = [
  "email",
  "sms",
  "whatsapp",
];

export default function WorkerFormScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<EuropeanCountry>(() =>
    detectEuropeanCountryFromLocale(europeanCountries)
  );
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [verificationMethod, setVerificationMethod] =
    useState<VerificationMethod | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedMethodLabel = useMemo(() => {
    if (!verificationMethod) {
      return "";
    }

    return t(`workerForm.verify.method.${verificationMethod}`);
  }, [verificationMethod, t]);

  function handleBack() {
    if (step === 2 && !codeSent) {
      setStep(1);
      setErrors({});
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.push("/role" as any);
  }

  function handleCountrySelect(country: EuropeanCountry) {
    setSelectedCountry(country);
    setIsCountryPickerOpen(false);
  }

  function handleContinueToVerification() {
    if (!validateBasicDetails()) {
      return;
    }

    setErrors({});
    setStep(2);
  }

  function handleSendCode() {
    if (!verificationMethod) {
      setErrors({
        verificationMethod: t("workerForm.error.verificationMethod"),
      });
      return;
    }

    setErrors({});
    setCodeSent(true);
  }

  function handleVerifyAndContinue() {
    if (!/^\d{4,6}$/.test(verificationCode.trim())) {
      setErrors({
        verificationCode: t("workerForm.error.verificationCode"),
      });
      return;
    }

    setErrors({});
    router.push("/worker-dashboard" as any);
  }

  function validateBasicDetails() {
    const nextErrors: FormErrors = {};

    if (!firstName.trim()) {
      nextErrors.firstName = t("workerForm.error.firstName");
    }

    if (!lastName.trim()) {
      nextErrors.lastName = t("workerForm.error.lastName");
    }

    if (!email.trim()) {
      nextErrors.email = t("workerForm.error.emailRequired");
    } else if (!email.includes("@")) {
      nextErrors.email = t("workerForm.error.emailInvalid");
    }

    if (!phone.trim()) {
      nextErrors.phone = t("workerForm.error.phone");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>{t("common.back")}</Text>
          </Pressable>

          <View style={styles.brandBlock}>
            <Text style={styles.logo}>{t("workerForm.brand")}</Text>
            <Text style={styles.brandSubtitle}>
              {t("workerForm.brandSubtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{t("workerForm.badge")}</Text>
          <Text style={styles.title}>{t("workerForm.accountTitle")}</Text>
          <Text style={styles.subtitle}>{t("workerForm.accountSubtitle")}</Text>
        </View>

        <View style={styles.mainGrid}>
          <View style={styles.benefitsPanel}>
            <Text style={styles.panelEyebrow}>{t("workerForm.benefits")}</Text>
            <Text style={styles.panelTitle}>
              {t("workerForm.benefitsTitle")}
            </Text>
            <View style={styles.benefitList}>
              {benefits.map((benefit) => (
                <View key={benefit} style={styles.benefitItem}>
                  <View style={styles.benefitIcon} />
                  <Text style={styles.benefitText}>{t(benefit)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.progressRow}>
              <ProgressStep
                active={step === 1}
                complete={step > 1}
                label={t("workerForm.step.basic")}
                number="1"
              />
              <View style={styles.progressDivider} />
              <ProgressStep
                active={step === 2}
                complete={false}
                label={t("workerForm.step.verify")}
                number="2"
              />
            </View>

            {step === 1 ? (
              <View>
                <Text style={styles.formTitle}>
                  {t("workerForm.basic.title")}
                </Text>
                <Text style={styles.formDescription}>
                  {t("workerForm.basic.description")}
                </Text>

                <View style={styles.twoColumnFields}>
                  <InputField
                    error={errors.lastName}
                    label={t("workerForm.lastName")}
                    onChangeText={setLastName}
                    placeholder={t("workerForm.lastNamePlaceholder")}
                    value={lastName}
                  />
                  <InputField
                    error={errors.firstName}
                    label={t("workerForm.firstName")}
                    onChangeText={setFirstName}
                    placeholder={t("workerForm.firstNamePlaceholder")}
                    value={firstName}
                  />
                </View>

                <InputField
                  autoCapitalize="none"
                  error={errors.email}
                  keyboardType="email-address"
                  label={t("workerForm.email")}
                  onChangeText={setEmail}
                  placeholder={t("workerForm.emailPlaceholder")}
                  value={email}
                />

                <View style={styles.phoneSection}>
                  <Text style={styles.fieldLabel}>
                    {t("workerForm.phoneNumber")}
                  </Text>
                  <View style={styles.phoneInputRow}>
                    <Pressable
                      style={styles.countrySelectButton}
                      onPress={() => {
                        setIsCountryPickerOpen((current) => !current);
                      }}
                    >
                      <CountryFlagBadge
                        code={selectedCountry.code}
                        colors={selectedCountry.flagColors}
                        pattern={selectedCountry.flagPattern}
                      />
                      <Text style={styles.countrySelectDial}>
                        {selectedCountry.dialCode}
                      </Text>
                      <Text style={styles.countrySelectArrow}>▼</Text>
                    </Pressable>
                    <TextInput
                      keyboardType="phone-pad"
                      onChangeText={setPhone}
                      placeholder={t("workerForm.phonePlaceholder")}
                      placeholderTextColor={palette.subtle}
                      style={[styles.input, styles.phoneNumberInput]}
                      value={phone}
                    />
                  </View>
                  <ErrorMessage message={errors.phone} />

                  {isCountryPickerOpen ? (
                    <View style={styles.countryPicker}>
                      {europeanCountries.map((country) => (
                        <Pressable
                          key={country.code}
                          style={[
                            styles.countryPickerItem,
                            selectedCountry.code === country.code &&
                              styles.countryPickerItemActive,
                          ]}
                          onPress={() => {
                            handleCountrySelect(country);
                          }}
                        >
                          <CountryFlagBadge
                            code={country.code}
                            colors={country.flagColors}
                            pattern={country.flagPattern}
                          />
                          <Text
                            style={[
                              styles.countryPickerName,
                              selectedCountry.code === country.code &&
                                styles.countryPickerNameActive,
                            ]}
                          >
                            {country.name}
                          </Text>
                          <Text
                            style={[
                              styles.countryPickerDial,
                              selectedCountry.code === country.code &&
                                styles.countryPickerDialActive,
                            ]}
                          >
                            {country.dialCode}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleContinueToVerification}
                >
                  <Text style={styles.primaryButtonText}>
                    {t("workerForm.continueToVerification")}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={styles.formTitle}>
                  {t("workerForm.verify.title")}
                </Text>
                <Text style={styles.formDescription}>
                  {t("workerForm.verify.description")}
                </Text>

                <View style={styles.methodGrid}>
                  {verificationMethods.map((method) => (
                    <Pressable
                      key={method}
                      style={[
                        styles.methodCard,
                        verificationMethod === method &&
                          styles.methodCardActive,
                      ]}
                      onPress={() => {
                        setVerificationMethod(method);
                        setCodeSent(false);
                        setVerificationCode("");
                        setErrors({});
                      }}
                    >
                      <Text
                        style={[
                          styles.methodTitle,
                          verificationMethod === method &&
                            styles.methodTitleActive,
                        ]}
                      >
                        {t(`workerForm.verify.method.${method}`)}
                      </Text>
                      <Text style={styles.methodText}>
                        {t(`workerForm.verify.method.${method}.text`)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <ErrorMessage message={errors.verificationMethod} />

                {!codeSent ? (
                  <Pressable style={styles.primaryButton} onPress={handleSendCode}>
                    <Text style={styles.primaryButtonText}>
                      {t("workerForm.verify.sendCode")}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.codePanel}>
                    <Text style={styles.sentText}>
                      {t("workerForm.verify.codeSent").replace(
                        "{method}",
                        selectedMethodLabel
                      )}
                    </Text>
                    <InputField
                      error={errors.verificationCode}
                      keyboardType="number-pad"
                      label={t("workerForm.verify.codeLabel")}
                      maxLength={6}
                      onChangeText={setVerificationCode}
                      placeholder={t("workerForm.verify.codePlaceholder")}
                      value={verificationCode}
                    />
                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleVerifyAndContinue}
                    >
                      <Text style={styles.primaryButtonText}>
                        {t("workerForm.verify.continue")}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.mascotPanel}>
            <View style={styles.mascotBox}>
              <Text style={styles.mascotText}>{t("workerForm.mascot")}</Text>
            </View>
            <Text style={styles.mascotTitle}>
              {t("workerForm.workerTrust")}
            </Text>
            <Text style={styles.mascotBody}>
              {t("workerForm.workerTrustText")}
            </Text>
          </View>
        </View>

        <View style={styles.trustGrid}>
          {trustCards.map((trustCard) => (
            <View key={trustCard} style={styles.trustCard}>
              <View style={styles.trustDot} />
              <Text style={styles.trustText}>{t(trustCard)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type ProgressStepProps = {
  active: boolean;
  complete: boolean;
  label: string;
  number: string;
};

function ProgressStep({ active, complete, label, number }: ProgressStepProps) {
  return (
    <View style={styles.progressStep}>
      <View
        style={[
          styles.progressCircle,
          active && styles.progressCircleActive,
          complete && styles.progressCircleComplete,
        ]}
      >
        <Text
          style={[
            styles.progressCircleText,
            (active || complete) && styles.progressCircleTextActive,
          ]}
        >
          {number}
        </Text>
      </View>
      <Text
        style={[
          styles.progressLabel,
          (active || complete) && styles.progressLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type InputFieldProps = ComponentProps<typeof TextInput> & {
  error?: string;
  label: string;
  wrapperStyle?: StyleProp<ViewStyle>;
};

function InputField({ error, label, wrapperStyle, style, ...props }: InputFieldProps) {
  return (
    <View style={[styles.inputWrapper, wrapperStyle]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.subtle}
        style={[styles.input, style]}
        {...props}
      />
      <ErrorMessage message={error} />
    </View>
  );
}

type ErrorMessageProps = {
  message?: string;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.page,
    flex: 1,
  },
  content: {
    alignSelf: "center",
    padding: Spacing.screen,
    paddingBottom: Spacing.eight,
    width: "100%",
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    justifyContent: "space-between",
    marginBottom: Spacing.five,
    maxWidth: 1240,
    width: "100%",
  },
  backButton: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  backText: {
    color: palette.ink,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  brandBlock: {
    alignItems: "flex-end",
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
  },
  hero: {
    alignItems: "center",
    alignSelf: "center",
    marginBottom: Spacing.five,
    maxWidth: 760,
  },
  heroBadge: {
    backgroundColor: palette.redSoft,
    borderRadius: Radius.round,
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  title: {
    color: palette.ink,
    fontSize: Typography.hero,
    fontWeight: Typography.fontWeight.black,
    lineHeight: Typography.lineHeight.subtitleLarge,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  subtitle: {
    color: palette.muted,
    fontSize: Typography.total,
    lineHeight: 28,
    textAlign: "center",
  },
  mainGrid: {
    alignItems: "stretch",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    maxWidth: 1240,
    width: "100%",
  },
  benefitsPanel: {
    backgroundColor: palette.violetDark,
    borderRadius: Radius.xxl,
    flex: 0.75,
    minWidth: 260,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 4,
  },
  panelEyebrow: {
    color: "#E9DFFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xl,
    textTransform: "uppercase",
  },
  panelTitle: {
    color: Colors.white,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 30,
    marginBottom: Spacing.five,
  },
  benefitList: {
    gap: Spacing.xl,
  },
  benefitItem: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.xl,
    padding: Spacing.three,
  },
  benefitIcon: {
    backgroundColor: palette.red,
    borderRadius: Radius.round,
    height: 12,
    width: 12,
  },
  benefitText: {
    color: Colors.white,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.default,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flex: 1.3,
    minWidth: 320,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: Spacing.five,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  progressCircle: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  progressCircleActive: {
    backgroundColor: palette.violet,
    borderColor: palette.violet,
  },
  progressCircleComplete: {
    backgroundColor: palette.green,
    borderColor: palette.green,
  },
  progressCircleText: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  progressCircleTextActive: {
    color: Colors.white,
  },
  progressLabel: {
    color: palette.muted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  progressLabelActive: {
    color: palette.ink,
    fontWeight: Typography.fontWeight.black,
  },
  progressDivider: {
    backgroundColor: palette.line,
    height: 1,
    width: 42,
  },
  formTitle: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.md,
  },
  formDescription: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.three,
  },
  twoColumnFields: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 220,
  },
  fieldLabel: {
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
    marginBottom: Spacing.md,
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  errorText: {
    color: palette.red,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  phoneSection: {
    marginBottom: Spacing.md,
  },
  phoneInputRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  countrySelectButton: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.sm,
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
  countrySelectDial: {
    color: palette.ink,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  countrySelectArrow: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.black,
  },
  phoneNumberInput: {
    flex: 1,
    marginBottom: Spacing.none,
    minWidth: 220,
  },
  countryPicker: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  countryPickerItem: {
    alignItems: "center",
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 170,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  countryPickerItemActive: {
    backgroundColor: palette.blueSoft,
    borderColor: palette.blue,
  },
  countryPickerName: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  countryPickerNameActive: {
    color: palette.blue,
  },
  countryPickerDial: {
    color: palette.muted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  countryPickerDialActive: {
    color: palette.blue,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.red,
    borderRadius: Radius.lg,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xxl,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.black,
    textAlign: "center",
  },
  methodGrid: {
    gap: Spacing.xl,
  },
  methodCard: {
    backgroundColor: palette.surfaceSoft,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three,
  },
  methodCardActive: {
    backgroundColor: palette.violetSoft,
    borderColor: palette.violet,
  },
  methodTitle: {
    color: palette.ink,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
    marginBottom: Spacing.xs,
  },
  methodTitleActive: {
    color: palette.violet,
  },
  methodText: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  codePanel: {
    backgroundColor: palette.greenSoft,
    borderColor: "#BDEEDB",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginTop: Spacing.three,
    padding: Spacing.three,
  },
  sentText: {
    color: palette.green,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.three,
  },
  mascotPanel: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flex: 0.75,
    minWidth: 260,
    padding: Spacing.five,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  mascotBox: {
    alignItems: "center",
    backgroundColor: palette.redSoft,
    borderColor: "#FFC9D5",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: Spacing.five,
    minHeight: 150,
    padding: Spacing.three,
  },
  mascotText: {
    color: palette.red,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
    textAlign: "center",
  },
  mascotTitle: {
    color: palette.ink,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 30,
    marginBottom: Spacing.xl,
  },
  mascotBody: {
    color: palette.muted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
  },
  trustGrid: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginTop: Spacing.three,
    maxWidth: 1240,
    width: "100%",
  },
  trustCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: Radius.xl,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xl,
    minWidth: 220,
    padding: Spacing.three,
  },
  trustDot: {
    backgroundColor: palette.violet,
    borderRadius: Radius.round,
    height: 12,
    width: 12,
  },
  trustText: {
    color: palette.ink,
    flex: 1,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
});
