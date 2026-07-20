import RequireAuth from "@/components/RequireAuth";
import OrganizationActionButton from "@/components/organizations/OrganizationActionButton";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import {
  getCompanyStatusLabel,
  getCompanyVerificationLabel,
} from "@/components/organizations/organizationProfile";
import { Card, Header, Input, Screen } from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  saveOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { type Href, useRouter } from "expo-router";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type WebPressableState = {
  focused?: boolean;
  pressed?: boolean;
};

type FormErrors = Partial<
  Record<"city" | "country" | "industry" | "name" | "website", string>
>;

type HydrationState = "error" | "loading" | "ready";

const employeeCountOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function OrganizationCreateScreen() {
  return (
    <RequireAuth>
      <OrganizationCreateContent />
    </RequireAuth>
  );
}

function OrganizationCreateContent() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const copy = getOrganizationCopy(language);
  const userId = user?.id;
  const translationRef = useRef(t);
  const loadAttemptRef = useRef(0);
  const submissionRef = useRef(false);

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("DE");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [employeeCountRange, setEmployeeCountRange] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [hydrationState, setHydrationState] =
    useState<HydrationState>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    translationRef.current = t;
  }, [t]);

  const loadCompany = useCallback(async () => {
    const attempt = loadAttemptRef.current + 1;
    loadAttemptRef.current = attempt;
    setHydrationState("loading");
    setLoadError("");
    setSubmitError("");
    setErrors({});

    if (!userId) {
      setLoadError(translationRef.current("organizations.loadError"));
      setHydrationState("error");
      return;
    }

    try {
      const nextCompany = await fetchOwnCompany(userId);

      if (loadAttemptRef.current !== attempt) {
        return;
      }

      setCompany(nextCompany);
      setName(nextCompany?.name ?? "");
      setLegalName(nextCompany?.legal_name ?? "");
      setCountry(nextCompany?.country_code ?? "DE");
      setIndustry(nextCompany?.industry ?? "");
      setCity(nextCompany?.city ?? "");
      setPostalCode(nextCompany?.postal_code ?? "");
      setAddress(nextCompany?.address ?? "");
      setWebsite(nextCompany?.website ?? "");
      setEmployeeCountRange(nextCompany?.employee_count_range ?? "");
      setDescription(nextCompany?.description ?? "");
      setHydrationState("ready");
    } catch (error) {
      if (loadAttemptRef.current !== attempt) {
        return;
      }

      setCompany(null);
      setLoadError(
        readError(
          error,
          translationRef.current("organizations.loadError")
        )
      );
      setHydrationState("error");
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCompany();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      loadAttemptRef.current += 1;
    };
  }, [loadCompany]);

  function updateValue(
    setter: Dispatch<SetStateAction<string>>,
    value: string,
    field?: keyof FormErrors
  ) {
    setter(value);
    setSubmitError("");

    if (!field) {
      return;
    }

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    if (
      submissionRef.current ||
      submitting ||
      hydrationState !== "ready"
    ) {
      return;
    }

    const normalizedWebsite = normalizeWebsite(website);
    const nextErrors = validateForm({
      city,
      country,
      countryCodeError: copy.countryCodeError,
      industry,
      name,
      normalizedWebsite,
      t,
      website,
    });
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submissionRef.current = true;
    setSubmitting(true);

    try {
      const savedCompany = await saveOwnCompany({
        address: emptyToNull(address),
        city: city.trim(),
        countryCode: country.trim().toUpperCase(),
        description: emptyToNull(description),
        employeeCountRange: emptyToNull(employeeCountRange),
        industry: industry.trim(),
        legalName: emptyToNull(legalName),
        name: name.trim(),
        postalCode: emptyToNull(postalCode),
        website: normalizedWebsite,
      });
      router.replace(`/organizations/${savedCompany.id}` as Href);
    } catch (error) {
      setSubmitError(readError(error, t("organizations.saveError")));
    } finally {
      submissionRef.current = false;
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (submissionRef.current || submitting) {
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/organizations" as Href);
  }

  const isEditing = hydrationState === "ready" && company !== null;
  const headerTitle = isEditing
    ? copy.editOrganizationTitle
    : copy.createOrganization;
  const saveLabel = submitting
    ? copy.saving
    : isEditing
      ? copy.saveChanges
      : copy.createOrganization;

  return (
    <Screen
      centered={false}
      style={{
        paddingHorizontal: responsive.horizontalPadding,
        paddingVertical: responsive.isMobile ? Spacing.three : Spacing.screen,
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: responsive.isMobile ? Spacing.sm : Spacing.md,
            maxWidth: Math.min(responsive.contentMaxWidth, 1040),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header title={headerTitle} subtitle={copy.formSubtitle} />

        {hydrationState === "loading" ? (
          <Card>
            <Text
              accessibilityLiveRegion="polite"
              accessibilityRole="text"
              style={styles.mutedText}
            >
              {copy.formLoading}
            </Text>
            <View style={styles.loadingAction}>
              <OrganizationActionButton
                accessibilityHint={copy.back}
                fullWidth={responsive.isMobile}
                label={copy.cancel}
                onPress={handleCancel}
                variant="secondary"
              />
            </View>
          </Card>
        ) : null}

        {hydrationState === "error" ? (
          <Card title={t("organizations.loadError")} variant="warning">
            <Text accessibilityRole="alert" style={styles.errorText}>
              {loadError}
            </Text>
            <Text style={styles.bodyText}>{copy.loadFailedSaveDisabled}</Text>
            <View
              style={[
                styles.actions,
                responsive.isMobile && styles.actionsMobile,
              ]}
            >
              <OrganizationActionButton
                accessibilityHint={copy.loadFailedSaveDisabled}
                fullWidth={responsive.isMobile}
                label={copy.retry}
                onPress={() => void loadCompany()}
                variant="primary"
              />
              <OrganizationActionButton
                accessibilityHint={copy.back}
                fullWidth={responsive.isMobile}
                label={copy.cancel}
                onPress={handleCancel}
                variant="secondary"
              />
            </View>
          </Card>
        ) : null}

        {hydrationState === "ready" ? (
          <>
            <Card title={t("organizations.type")}>
              <View style={styles.typeGrid}>
                <OrganizationTypeCard
                  label={t("organizations.type.company")}
                  selected
                  subtitle={copy.safeSavedFields}
                />
                <OrganizationTypeCard
                  disabled
                  label={t("organizations.type.academy")}
                  subtitle={copy.comingSoon}
                />
                <OrganizationTypeCard
                  disabled
                  label={t("organizations.type.institution")}
                  subtitle={copy.comingSoon}
                />
              </View>
              <Text style={styles.hintText}>
                {copy.organizationTypeUnavailable}
              </Text>
            </Card>

            {company ? (
              <Card title={t("organizations.currentStatus")}>
                <Text style={styles.bodyText}>
                  {t("organizations.currentStatusText")
                    .replace(
                      "{status}",
                      getCompanyStatusLabel(company.status, language)
                    )
                    .replace(
                      "{verification}",
                      getCompanyVerificationLabel(
                        company.verification_status,
                        language
                      )
                    )}
                </Text>
              </Card>
            ) : null}

            <Card title={copy.safeSavedFields} variant="muted">
              <Text style={styles.bodyText}>{copy.safeSavedFieldsText}</Text>
            </Card>

            <Card title={t("organizations.organizationData")}>
              <Input
                accessibilityLabel={t("organizations.displayName")}
                accessibilityHint={errors.name}
                accessibilityState={{ disabled: submitting }}
                aria-describedby={errors.name ? "organization-name-error" : undefined}
                aria-invalid={Boolean(errors.name)}
                editable={!submitting}
                label={`${t("organizations.displayName")} *`}
                onChangeText={(value) => updateValue(setName, value, "name")}
                placeholder={t("organizations.displayNamePlaceholder")}
                value={name}
              />
              <FieldError id="organization-name-error" message={errors.name} />

              <Input
                accessibilityLabel={t("organizations.legalName")}
                accessibilityState={{ disabled: submitting }}
                editable={!submitting}
                label={`${t("organizations.legalName")} - ${t("organizations.optionalPlaceholder")}`}
                onChangeText={(value) => updateValue(setLegalName, value)}
                placeholder={t("organizations.legalNamePlaceholder")}
                value={legalName}
              />

              <View
                style={[
                  styles.twoColumn,
                  responsive.isMobile && styles.twoColumnMobile,
                ]}
              >
                <View style={styles.column}>
                  <Input
                    accessibilityLabel={t("organizations.country")}
                    accessibilityHint={errors.country}
                    accessibilityState={{ disabled: submitting }}
                    aria-describedby={
                      errors.country ? "organization-country-error" : undefined
                    }
                    aria-invalid={Boolean(errors.country)}
                    autoCapitalize="characters"
                    editable={!submitting}
                    label={`${t("organizations.country")} *`}
                    maxLength={2}
                    onChangeText={(value) =>
                      updateValue(setCountry, value, "country")
                    }
                    placeholder={t("organizations.countryPlaceholder")}
                    value={country}
                  />
                  <FieldError
                    id="organization-country-error"
                    message={errors.country}
                  />
                </View>
                <View style={styles.column}>
                  <Input
                    accessibilityLabel={t("common.city")}
                    accessibilityHint={errors.city}
                    accessibilityState={{ disabled: submitting }}
                    aria-describedby={errors.city ? "organization-city-error" : undefined}
                    aria-invalid={Boolean(errors.city)}
                    editable={!submitting}
                    label={`${t("common.city")} *`}
                    onChangeText={(value) =>
                      updateValue(setCity, value, "city")
                    }
                    placeholder={t("organizations.cityPlaceholder")}
                    value={city}
                  />
                  <FieldError id="organization-city-error" message={errors.city} />
                </View>
              </View>

              <View
                style={[
                  styles.twoColumn,
                  responsive.isMobile && styles.twoColumnMobile,
                ]}
              >
                <View style={styles.column}>
                  <Input
                    accessibilityLabel={t("organizations.postalCode")}
                    accessibilityState={{ disabled: submitting }}
                    editable={!submitting}
                    label={`${t("organizations.postalCode")} - ${t("organizations.optionalPlaceholder")}`}
                    onChangeText={(value) => updateValue(setPostalCode, value)}
                    placeholder={t("organizations.optionalPlaceholder")}
                    value={postalCode}
                  />
                </View>
                <View style={styles.column}>
                  <Input
                    accessibilityLabel={t("organizations.address")}
                    accessibilityState={{ disabled: submitting }}
                    editable={!submitting}
                    label={t("organizations.address")}
                    onChangeText={(value) => updateValue(setAddress, value)}
                    placeholder={t("organizations.addressPlaceholder")}
                    value={address}
                  />
                </View>
              </View>

              <Input
                accessibilityLabel={t("organizations.website")}
                accessibilityHint={errors.website}
                accessibilityState={{ disabled: submitting }}
                aria-describedby={
                  errors.website ? "organization-website-error" : undefined
                }
                aria-invalid={Boolean(errors.website)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
                keyboardType="url"
                label={t("organizations.website")}
                onChangeText={(value) =>
                  updateValue(setWebsite, value, "website")
                }
                placeholder="https://example.com"
                value={website}
              />
              <FieldError
                id="organization-website-error"
                message={errors.website}
              />

              <Input
                accessibilityLabel={t("organizations.activityArea")}
                accessibilityHint={errors.industry}
                accessibilityState={{ disabled: submitting }}
                aria-describedby={
                  errors.industry ? "organization-industry-error" : undefined
                }
                aria-invalid={Boolean(errors.industry)}
                editable={!submitting}
                label={`${t("organizations.activityArea")} *`}
                onChangeText={(value) =>
                  updateValue(setIndustry, value, "industry")
                }
                placeholder={t("organizations.industryPlaceholder")}
                value={industry}
              />
              <FieldError
                id="organization-industry-error"
                message={errors.industry}
              />

              <Text style={styles.optionLabel}>
                {t("organizations.employeeCount")}
              </Text>
              <View style={styles.optionGrid}>
                {employeeCountOptions.map((option) => {
                  const selected = employeeCountRange === option;

                  return (
                    <Pressable
                      accessibilityHint={t("organizations.employeeCount")}
                      accessibilityLabel={option}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: submitting, selected }}
                      disabled={submitting}
                      key={option}
                      onPress={() => {
                        setEmployeeCountRange(selected ? "" : option);
                        setSubmitError("");
                      }}
                      style={(state) => {
                        const webState = state as WebPressableState;

                        return [
                          styles.optionButton,
                          selected && styles.optionButtonSelected,
                          webState.focused && styles.optionButtonFocused,
                          webState.pressed &&
                            !submitting &&
                            styles.optionButtonPressed,
                          submitting && styles.disabled,
                        ];
                      }}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          selected && styles.optionButtonTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Input
                accessibilityLabel={t("organizations.description")}
                accessibilityState={{ disabled: submitting }}
                editable={!submitting}
                label={t("organizations.description")}
                multiline
                onChangeText={(value) => updateValue(setDescription, value)}
                placeholder={t("organizations.descriptionPlaceholder")}
                style={styles.largeInput}
                value={description}
              />
            </Card>

            <Card title={copy.comingSoonTitle} variant="muted">
              <Text style={styles.bodyText}>{copy.comingSoonFields}</Text>
              <View style={styles.plannedList}>
                {[
                  t("organizations.contactEmail"),
                  t("organizations.contactPhone"),
                  t("organizations.registrationNumber"),
                  t("organizations.vatId"),
                  t("organizations.companyCapabilities"),
                ].map((label) => (
                  <View key={label} style={styles.plannedRow}>
                    <Text style={styles.plannedLabel}>{label}</Text>
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>
                        {copy.comingSoon} · {copy.notSaved}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {submitError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {submitError}
              </Text>
            ) : null}

            <View
              style={[
                styles.actions,
                responsive.isMobile && styles.actionsMobile,
              ]}
            >
              <OrganizationActionButton
                accessibilityHint={copy.back}
                disabled={submitting}
                fullWidth={responsive.isMobile}
                label={copy.cancel}
                onPress={handleCancel}
                variant="secondary"
              />
              <OrganizationActionButton
                accessibilityHint={copy.safeSavedFieldsText}
                disabled={submitting}
                fullWidth={responsive.isMobile}
                label={saveLabel}
                onPress={() => void handleSubmit()}
                variant="primary"
              />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function OrganizationTypeCard({
  disabled = false,
  label,
  selected = false,
  subtitle,
}: {
  disabled?: boolean;
  label: string;
  selected?: boolean;
  subtitle: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}. ${subtitle}`}
      accessibilityRole="text"
      style={[
        styles.typeCard,
        selected && styles.typeCardSelected,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.typeTitle, selected && styles.typeTitleSelected]}>
        {label}
      </Text>
      <Text style={styles.typeSubtitle}>{subtitle}</Text>
    </View>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <Text accessibilityRole="alert" nativeID={id} style={styles.fieldError}>
      {message}
    </Text>
  ) : null;
}

function validateForm({
  city,
  country,
  countryCodeError,
  industry,
  name,
  normalizedWebsite,
  t,
  website,
}: {
  city: string;
  country: string;
  countryCodeError: string;
  industry: string;
  name: string;
  normalizedWebsite: string | null;
  t: (key: string) => string;
  website: string;
}) {
  const nextErrors: FormErrors = {};

  if (!name.trim()) {
    nextErrors.name = t("organizations.error.name");
  }

  if (!/^[a-z]{2}$/i.test(country.trim())) {
    nextErrors.country = countryCodeError;
  }

  if (!city.trim()) {
    nextErrors.city = t("organizations.error.city");
  }

  if (!industry.trim()) {
    nextErrors.industry = t("organizations.error.industry");
  }

  if (website.trim() && !normalizedWebsite) {
    nextErrors.website = t("organizations.error.website");
  }

  return nextErrors;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const validProtocol = url.protocol === "http:" || url.protocol === "https:";
    const validHostname = url.hostname.includes(".");

    return validProtocol && validHostname ? url.toString() : null;
  } catch {
    return null;
  }
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.md,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  errorText: {
    color: "#BE123C",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Typography.lineHeight.body,
    marginBottom: Spacing.md,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.three,
  },
  fieldError: {
    color: "#BE123C",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: -Spacing.md,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  typeCard: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 210,
    flexGrow: 1,
    minHeight: 76,
    padding: Spacing.three,
  },
  typeCardSelected: {
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.brand,
  },
  typeTitle: {
    color: Colors.textBody,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  typeTitleSelected: {
    color: Colors.brandDeep,
  },
  typeSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.compact,
    marginTop: Spacing.sm,
  },
  twoColumn: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  twoColumnMobile: {
    flexDirection: "column",
    gap: Spacing.none,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.md,
  },
  optionButtonSelected: {
    backgroundColor: Colors.brandSoft,
    borderColor: Colors.brand,
  },
  optionButtonFocused: {
    borderColor: Colors.text,
    borderWidth: 2,
  },
  optionButtonPressed: {
    opacity: 0.78,
  },
  optionButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  optionButtonTextSelected: {
    color: Colors.brandDeep,
  },
  largeInput: {
    height: 120,
    textAlignVertical: "top",
  },
  plannedList: {
    gap: Spacing.md,
    marginTop: Spacing.three,
  },
  plannedRow: {
    alignItems: "center",
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    minHeight: 48,
    paddingTop: Spacing.md,
  },
  plannedLabel: {
    color: Colors.textBody,
    flexGrow: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  comingSoonBadge: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  comingSoonBadgeText: {
    color: Colors.textBody,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
    marginTop: Spacing.md,
  },
  actionsMobile: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  loadingAction: {
    alignItems: "flex-start",
    marginTop: Spacing.three,
  },
  disabled: {
    opacity: 0.56,
  },
});
