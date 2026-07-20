import RequireAuth from "@/components/RequireAuth";
import {
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton as Button,
  RabAICard as Card,
  RabAIInput as Input,
} from "@/components/ui";
import type { OrganizationType } from "@/domain/account";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  saveOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type FormErrors = Partial<
  Record<
    "city" | "country" | "industry" | "legalName" | "name" | "website",
    string
  >
>;

type CompanyCapability = "publish_jobs" | "publish_tasks" | "offer_services";
type CourseDeliveryMode = "online" | "onsite" | "hybrid";

const organizationTypes: OrganizationType[] = [
  "company",
  "academy",
  "institution",
];

const employeeCountOptions = ["1-10", "11-50", "51-200", "201-500", "500+"];
const companyCapabilityOptions: CompanyCapability[] = [
  "publish_jobs",
  "publish_tasks",
  "offer_services",
];
const courseDeliveryModes: CourseDeliveryMode[] = ["online", "onsite", "hybrid"];

export default function OrganizationCreateScreen() {
  return (
    <RequireAuth>
      <OrganizationCreateContent />
    </RequireAuth>
  );
}

function OrganizationCreateContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;
  const [organizationType, setOrganizationType] =
    useState<OrganizationType>("company");
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [country, setCountry] = useState("DE");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [website, setWebsite] = useState("");
  const [vatId, setVatId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [employeeCountRange, setEmployeeCountRange] = useState("");
  const [companyCapabilities, setCompanyCapabilities] = useState<
    CompanyCapability[]
  >(["publish_jobs"]);
  const [educationArea, setEducationArea] = useState("");
  const [courseDeliveryMode, setCourseDeliveryMode] =
    useState<CourseDeliveryMode>("online");
  const [accreditationStatus, setAccreditationStatus] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const companyLoadRequestId = useRef(0);
  const canEditOrganizationFields = !submitting;
  const canSaveCompany = !submitting && organizationType === "company";

  const loadCompany = useCallback(async () => {
    const requestId = companyLoadRequestId.current + 1;
    companyLoadRequestId.current = requestId;

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const nextCompany = await fetchOwnCompany(userId);

      if (companyLoadRequestId.current !== requestId) {
        return;
      }

      setCompany(nextCompany);

      if (nextCompany) {
        setName(nextCompany.name ?? "");
        setLegalName(nextCompany.legal_name ?? "");
        setCountry(nextCompany.country_code ?? "DE");
        setIndustry(nextCompany.industry ?? "");
        setCity(nextCompany.city ?? "");
        setPostalCode(nextCompany.postal_code ?? "");
        setAddress(nextCompany.address ?? "");
        setWebsite(nextCompany.website ?? "");
        setEmployeeCountRange(nextCompany.employee_count_range ?? "");
        setDescription(nextCompany.description ?? "");
      }
    } catch (error) {
      if (companyLoadRequestId.current === requestId) {
        setLoadError(readError(error, t));
      }
    } finally {
      if (companyLoadRequestId.current === requestId) {
        setLoading(false);
      }
    }
  }, [t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadCompany();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      companyLoadRequestId.current += 1;
    };
  }, [loadCompany]);

  async function handleSubmit() {
    if (submitting || organizationType !== "company") {
      return;
    }

    const normalizedWebsite = normalizeWebsite(website);
    const nextErrors = validateForm({
      city,
      country,
      industry,
      legalName,
      name,
      normalizedWebsite,
      t,
      website,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSaveError("");

    try {
      await saveOwnCompany({
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

      router.replace("/organizations" as any);
    } catch (error) {
      setSaveError(readError(error, t));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCompanyCapability(capability: CompanyCapability) {
    setCompanyCapabilities((current) => {
      if (current.includes(capability)) {
        return current.filter((item) => item !== capability);
      }

      return [...current, capability];
    });
  }

  return (
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="form"
      scroll
    >
      <PageHeader
        description={t("organizations.createSubtitle")}
        title={t("organizations.createTitle")}
      />

      {loading ? (
        <LoadingState title={t("organizations.createLoading")} />
      ) : loadError ? (
        <ErrorState
          description={loadError}
          onRetry={() => void loadCompany()}
          retryLabel={getRetryLabel(language)}
          title={t("organizations.loadError")}
        />
      ) : (
        <>
        {saveError ? (
          <ErrorState
            compact
            description={saveError}
            title={t("organizations.saveError")}
          />
        ) : null}

        <Card title={t("organizations.type")}>
          <View
            accessibilityLabel={t("organizations.type")}
            accessibilityRole="radiogroup"
            style={styles.optionGrid}
          >
            {organizationTypes.map((type) => {
              const active = organizationType === type;
              const disabled = type === "institution";

              return (
                <Card
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active, disabled }}
                  disabled={disabled}
                  interactive
                  key={type}
                  onPress={() => setOrganizationType(type)}
                  padding="sm"
                  selected={active}
                  style={styles.typeButton}
                  variant="filled"
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      active && styles.typeButtonTextActive,
                    ]}
                  >
                    {t(`organizations.type.${type}`)}
                  </Text>
                  {type === "institution" ? (
                    <Text style={styles.comingSoonText}>
                      {t("organizations.institutionLater")}
                    </Text>
                  ) : type === "academy" ? (
                    <Text style={styles.comingSoonText}>
                      {t("organizations.academyPrepared")}
                    </Text>
                  ) : null}
                </Card>
              );
            })}
          </View>
        </Card>

        {organizationType !== "company" ? (
          <Card title={t("organizations.preparedTitle")} variant="warning">
            <Text style={styles.bodyText}>{t("organizations.preparedText")}</Text>
          </Card>
        ) : null}

        {company ? (
          <Card title={t("organizations.currentStatus")}>
            <Text style={styles.bodyText}>
              {t("organizations.currentStatusText")
                .replace("{status}", company.status)
                .replace("{verification}", company.verification_status)}
            </Text>
          </Card>
        ) : null}

        <Card title={t("organizations.verificationStatusTitle")}>
          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>
              {t("organizations.unverifiedPendingStatus")}
            </Text>
            <Text style={styles.bodyText}>
              {t("organizations.verificationRequirementText")}
            </Text>
          </View>
        </Card>

        <Card title={t("organizations.verificationInfoTitle")}>
          <Text style={styles.bodyText}>{t("organizations.verificationInfoText")}</Text>
          <View style={styles.exampleList}>
            <InfoListItem label={t("organizations.verificationExample.registrationDocument")} />
            <InfoListItem label={t("organizations.verificationExample.vatTaxNumber")} />
            <InfoListItem label={t("organizations.verificationExample.representativeAuthorization")} />
            <InfoListItem label={t("organizations.verificationExample.businessAddress")} />
            <InfoListItem label={t("organizations.verificationExample.insuranceDocuments")} />
          </View>
        </Card>

        <Card title={t("organizations.organizationData")}>
          <Input
            editable={canEditOrganizationFields}
            errorText={errors.name}
            label={t("organizations.displayName")}
            onChangeText={setName}
            placeholder={t("organizations.displayNamePlaceholder")}
            required
            value={name}
          />

          <Input
            editable={canEditOrganizationFields}
            errorText={errors.legalName}
            label={t("organizations.legalName")}
            onChangeText={setLegalName}
            placeholder={t("organizations.legalNamePlaceholder")}
            required
            value={legalName}
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Input
                autoCapitalize="characters"
                editable={canEditOrganizationFields}
                errorText={errors.country}
                label={t("organizations.country")}
                onChangeText={setCountry}
                placeholder={t("organizations.countryPlaceholder")}
                required
                value={country}
              />
            </View>
            <View style={styles.column}>
              <Input
                editable={canEditOrganizationFields}
                errorText={errors.city}
                label={t("common.city")}
                onChangeText={setCity}
                placeholder={t("organizations.cityPlaceholder")}
                required
                value={city}
              />
            </View>
          </View>

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.address")}
            onChangeText={setAddress}
            placeholder={t("organizations.addressPlaceholder")}
            value={address}
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Input
                autoCapitalize="none"
                editable={canEditOrganizationFields}
                keyboardType="email-address"
                label={t("organizations.contactEmail")}
                onChangeText={setContactEmail}
                placeholder="contact@example.com"
                value={contactEmail}
              />
            </View>
            <View style={styles.column}>
              <Input
                editable={canEditOrganizationFields}
                keyboardType="phone-pad"
                label={t("organizations.contactPhone")}
                onChangeText={setContactPhone}
                placeholder="+49..."
                value={contactPhone}
              />
            </View>
          </View>

          <Input
            autoCapitalize="none"
            editable={canEditOrganizationFields}
            errorText={errors.website}
            keyboardType="url"
            label={t("organizations.website")}
            onChangeText={setWebsite}
            placeholder="https://example.com"
            value={website}
          />

          <Input
            editable={canEditOrganizationFields}
            errorText={errors.industry}
            label={t("organizations.activityArea")}
            onChangeText={setIndustry}
            placeholder={t("organizations.industryPlaceholder")}
            required
            value={industry}
          />

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.description")}
            multiline
            onChangeText={setDescription}
            placeholder={t("organizations.descriptionPlaceholder")}
            value={description}
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Input
                editable={canEditOrganizationFields}
                label={t("organizations.registrationNumber")}
                onChangeText={setRegistrationNumber}
                placeholder={t("organizations.optionalPlaceholder")}
                value={registrationNumber}
              />
            </View>
            <View style={styles.column}>
              <Input
                editable={canEditOrganizationFields}
                label={t("organizations.vatId")}
                onChangeText={setVatId}
                placeholder={t("organizations.optionalPlaceholder")}
                value={vatId}
              />
            </View>
          </View>
        </Card>

        <Card title={t("organizations.operationalProfile")}>
          {organizationType === "academy" ? (
            <>
              <Input
                editable={canEditOrganizationFields}
                label={t("organizations.trainingAreas")}
                onChangeText={setEducationArea}
                placeholder={t("organizations.trainingAreasPlaceholder")}
                value={educationArea}
              />
              <Text style={styles.optionLabel}>
                {t("organizations.courseDeliveryMode")}
              </Text>
              <View
                accessibilityLabel={t("organizations.courseDeliveryMode")}
                accessibilityRole="radiogroup"
                style={styles.optionGrid}
              >
                {courseDeliveryModes.map((mode) => {
                  const active = courseDeliveryMode === mode;

                  return (
                    <Button
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      disabled={submitting}
                      key={mode}
                      onPress={() => setCourseDeliveryMode(mode)}
                      size="sm"
                      style={styles.optionButton}
                      title={t(`organizations.courseDeliveryMode.${mode}`)}
                      variant={active ? "secondary" : "outline"}
                    />
                  );
                })}
              </View>
              <Input
                editable={canEditOrganizationFields}
                label={t("organizations.accreditationStatus")}
                onChangeText={setAccreditationStatus}
                placeholder={t("organizations.accreditationStatusPlaceholder")}
                value={accreditationStatus}
              />
            </>
          ) : (
            <>
              <Text style={styles.optionLabel}>{t("organizations.employeeCount")}</Text>
              <View
                accessibilityLabel={t("organizations.employeeCount")}
                accessibilityRole="radiogroup"
                style={styles.optionGrid}
              >
                {employeeCountOptions.map((option) => {
                  const active = employeeCountRange === option;

                  return (
                    <Button
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      disabled={submitting || organizationType !== "company"}
                      key={option}
                      onPress={() => setEmployeeCountRange(option)}
                      size="sm"
                      style={styles.optionButton}
                      title={option}
                      variant={active ? "secondary" : "outline"}
                    />
                  );
                })}
              </View>

              <Text style={styles.optionLabel}>
                {t("organizations.companyCapabilities")}
              </Text>
              <View
                accessibilityLabel={t("organizations.companyCapabilities")}
                style={styles.optionGrid}
              >
                {companyCapabilityOptions.map((option) => {
                  const active = companyCapabilities.includes(option);

                  return (
                    <Button
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      disabled={submitting || organizationType !== "company"}
                      key={option}
                      onPress={() => toggleCompanyCapability(option)}
                      size="sm"
                      style={styles.optionButton}
                      title={t(`organizations.capability.${option}`)}
                      variant={active ? "secondary" : "outline"}
                    />
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.hintText}>
            {t("organizations.preparedFieldsNote")}
          </Text>
        </Card>

        <Button
          disabled={!canSaveCompany}
          loading={submitting}
          loadingLabel={t("organizations.saving")}
          onPress={() => void handleSubmit()}
          title={t("organizations.save")}
        />
        </>
      )}
    </PageContainer>
  );
}

function InfoListItem({ label }: { label: string }) {
  return (
    <View style={styles.exampleItem}>
      <Text style={styles.exampleBullet}>-</Text>
      <Text style={styles.exampleText}>{label}</Text>
    </View>
  );
}

function validateForm({
  city,
  country,
  industry,
  legalName,
  name,
  normalizedWebsite,
  t,
  website,
}: {
  city: string;
  country: string;
  industry: string;
  legalName: string;
  name: string;
  normalizedWebsite: string | null;
  t: (key: string) => string;
  website: string;
}) {
  const nextErrors: FormErrors = {};

  if (!legalName.trim()) {
    nextErrors.legalName = t("organizations.error.legalName");
  }

  if (!name.trim()) {
    nextErrors.name = t("organizations.error.name");
  }

  if (!country.trim()) {
    nextErrors.country = t("organizations.error.country");
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

function getRetryLabel(language: string) {
  if (language === "de") {
    return "Erneut versuchen";
  }

  if (language === "en") {
    return "Try again";
  }

  return "Reîncearcă";
}

function readError(error: unknown, t: (key: string) => string) {
  return error instanceof Error ? error.message : t("organizations.saveError");
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
  statusBox: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    borderRadius: Radius.control,
    borderWidth: 1,
    padding: Spacing.component,
  },
  statusTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.control,
  },
  exampleList: {
    gap: Spacing.control,
    marginTop: Spacing.component,
  },
  exampleItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.control,
  },
  exampleBullet: {
    color: Colors.primary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
  },
  exampleText: {
    color: Colors.textBody,
    flex: 1,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  typeButton: {
    flexBasis: 200,
    flexGrow: 1,
    minWidth: 0,
  },
  typeButtonText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  typeButtonTextActive: {
    color: Colors.primaryPressed,
  },
  comingSoonText: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.compact,
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
  optionButton: {
    flexBasis: 120,
    flexGrow: 1,
    minWidth: 0,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.component,
  },
});
