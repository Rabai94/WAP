import RequireAuth from "@/components/RequireAuth";
import { getOrganizationCopy } from "@/components/organizations/organizationCopy";
import {
  getCompanyStatusLabel,
  getCompanyVerificationLabel,
} from "@/components/organizations/organizationProfile";
import {
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIBadge as Badge,
  RabAIButton as Button,
  RabAICard as Card,
  RabAIInput as Input,
} from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  saveOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Spacing, Typography } from "@/theme";
import { type Href, useRouter } from "expo-router";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";

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
        readError(error, translationRef.current("organizations.loadError"))
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
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="form"
      scroll
    >
      <PageHeader description={copy.formSubtitle} title={headerTitle} />

      {hydrationState === "loading" ? (
        <>
          <LoadingState title={copy.formLoading} />
          <Button
            accessibilityHint={copy.back}
            fullWidth={responsive.isMobile}
            onPress={handleCancel}
            title={copy.cancel}
            variant="secondary"
          />
        </>
      ) : null}

      {hydrationState === "error" ? (
        <>
          <ErrorState
            description={`${loadError} ${copy.loadFailedSaveDisabled}`}
            onRetry={() => void loadCompany()}
            retryLabel={copy.retry}
            title={t("organizations.loadError")}
          />
          <Button
            accessibilityHint={copy.back}
            fullWidth={responsive.isMobile}
            onPress={handleCancel}
            title={copy.cancel}
            variant="secondary"
          />
        </>
      ) : null}

      {hydrationState === "ready" ? (
        <>
          <Card title={t("organizations.type")}>
            <View style={styles.typeBadgeRow}>
              <Badge
                label={`${t("organizations.type.company")} · ${copy.safeSavedFields}`}
                tone="primary"
              />
              <Badge
                label={`${t("organizations.type.academy")} · ${copy.comingSoon}`}
              />
              <Badge
                label={`${t("organizations.type.institution")} · ${copy.comingSoon}`}
              />
            </View>
            <Text style={styles.hintText}>{copy.organizationTypeUnavailable}</Text>
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

          <Card title={copy.safeSavedFields} variant="filled">
            <Text style={styles.bodyText}>{copy.safeSavedFieldsText}</Text>
          </Card>

          <Card title={t("organizations.organizationData")}>
            <Input
              accessibilityLabel={t("organizations.displayName")}
              editable={!submitting}
              errorText={errors.name}
              label={t("organizations.displayName")}
              onChangeText={(value) => updateValue(setName, value, "name")}
              placeholder={t("organizations.displayNamePlaceholder")}
              required
              value={name}
            />

            <Input
              accessibilityLabel={t("organizations.legalName")}
              editable={!submitting}
              label={t("organizations.legalName")}
              onChangeText={(value) => updateValue(setLegalName, value)}
              placeholder={t("organizations.legalNamePlaceholder")}
              value={legalName}
            />

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Input
                  autoCapitalize="characters"
                  editable={!submitting}
                  errorText={errors.country}
                  label={t("organizations.country")}
                  maxLength={2}
                  onChangeText={(value) =>
                    updateValue(setCountry, value, "country")
                  }
                  placeholder={t("organizations.countryPlaceholder")}
                  required
                  value={country}
                />
              </View>
              <View style={styles.column}>
                <Input
                  editable={!submitting}
                  errorText={errors.city}
                  label={t("common.city")}
                  onChangeText={(value) => updateValue(setCity, value, "city")}
                  placeholder={t("organizations.cityPlaceholder")}
                  required
                  value={city}
                />
              </View>
            </View>

            <Input
              editable={!submitting}
              errorText={errors.industry}
              label={t("organizations.industry")}
              onChangeText={(value) =>
                updateValue(setIndustry, value, "industry")
              }
              placeholder={t("organizations.industryPlaceholder")}
              required
              value={industry}
            />

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Input
                  editable={!submitting}
                  label={t("organizations.postalCode")}
                  onChangeText={(value) => updateValue(setPostalCode, value)}
                  placeholder={t("organizations.postalCodePlaceholder")}
                  value={postalCode}
                />
              </View>
              <View style={styles.column}>
                <Input
                  editable={!submitting}
                  label={t("organizations.address")}
                  onChangeText={(value) => updateValue(setAddress, value)}
                  placeholder={t("organizations.addressPlaceholder")}
                  value={address}
                />
              </View>
            </View>

            <Input
              autoCapitalize="none"
              editable={!submitting}
              errorText={errors.website}
              keyboardType="url"
              label={t("organizations.website")}
              onChangeText={(value) =>
                updateValue(setWebsite, value, "website")
              }
              placeholder={t("organizations.websitePlaceholder")}
              value={website}
            />

            <Text style={styles.optionLabel}>
              {t("organizations.employeeCount")}
            </Text>
            <View
              accessibilityLabel={t("organizations.employeeCount")}
              accessibilityRole="radiogroup"
              style={styles.optionGrid}
            >
              {employeeCountOptions.map((option) => {
                const selected = employeeCountRange === option;

                return (
                  <Button
                    accessibilityHint={t("organizations.employeeCount")}
                    accessibilityLabel={option}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    disabled={submitting}
                    key={option}
                    onPress={() =>
                      updateValue(
                        setEmployeeCountRange,
                        selected ? "" : option
                      )
                    }
                    size="sm"
                    style={styles.optionButton}
                    title={option}
                    variant={selected ? "secondary" : "outline"}
                  />
                );
              })}
            </View>

            <Input
              accessibilityLabel={t("organizations.description")}
              editable={!submitting}
              label={t("organizations.description")}
              multiline
              onChangeText={(value) => updateValue(setDescription, value)}
              placeholder={t("organizations.descriptionPlaceholder")}
              style={styles.largeInput}
              value={description}
            />
          </Card>

          <Card title={copy.comingSoonTitle} variant="filled">
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
                  <Badge
                    label={`${copy.comingSoon} · ${copy.notSaved}`}
                    tone="warning"
                  />
                </View>
              ))}
            </View>
          </Card>

          {submitError ? (
            <ErrorState
              compact
              description={submitError}
              title={t("organizations.saveError")}
            />
          ) : null}

          <View
            style={[
              styles.actions,
              responsive.isMobile && styles.actionsMobile,
            ]}
          >
            <Button
              accessibilityHint={copy.back}
              disabled={submitting}
              fullWidth={responsive.isMobile}
              onPress={handleCancel}
              title={copy.cancel}
              variant="secondary"
            />
            <Button
              accessibilityHint={copy.safeSavedFieldsText}
              disabled={submitting}
              fullWidth={responsive.isMobile}
              loading={submitting}
              loadingLabel={copy.saving}
              onPress={() => void handleSubmit()}
              title={saveLabel}
            />
          </View>
        </>
      ) : null}
    </PageContainer>
  );
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
    gap: Spacing.section,
  },
  bodyText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.component,
  },
  typeBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.component,
  },
  column: {
    flexBasis: 240,
    flexGrow: 1,
    minWidth: 0,
  },
  optionLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.control,
    marginTop: Spacing.component,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  optionButton: {
    flexBasis: 120,
    flexGrow: 1,
    minWidth: 0,
  },
  largeInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  plannedList: {
    gap: Spacing.control,
    marginTop: Spacing.component,
  },
  plannedRow: {
    alignItems: "center",
    borderTopColor: Colors.borderMuted,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "space-between",
    minHeight: 48,
    paddingTop: Spacing.control,
  },
  plannedLabel: {
    color: Colors.textBody,
    flexGrow: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  actionsMobile: {
    alignItems: "stretch",
    flexDirection: "column",
  },
});
