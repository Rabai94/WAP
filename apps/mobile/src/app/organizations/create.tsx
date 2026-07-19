import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "@/components/ui";
import type { OrganizationType } from "@/domain/account";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnCompany,
  saveOwnCompany,
  type CompanyProfile,
} from "@/services/company/companyService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const responsive = useResponsiveLayout();
  const { t } = useLanguage();
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const canEditOrganizationFields = !submitting;
  const canSaveCompany = !loading && !submitting && organizationType === "company";

  useEffect(() => {
    let mounted = true;

    async function loadCompany() {
      if (!user?.id) {
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const nextCompany = await fetchOwnCompany(user.id);

        if (!mounted) {
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
        if (mounted) {
          setLoadError(readError(error, t));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadCompany();

    return () => {
      mounted = false;
    };
  }, [t, user?.id]);

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
    setLoadError("");

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
      setLoadError(readError(error, t));
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
            maxWidth: responsive.contentMaxWidth,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={t("organizations.createTitle")}
          subtitle={t("organizations.createSubtitle")}
        />

        <Card title={t("organizations.type")}>
          <View style={styles.optionGrid}>
            {organizationTypes.map((type) => {
              const active = organizationType === type;
              const disabled = type === "institution";

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled, selected: active }}
                  disabled={disabled}
                  key={type}
                  onPress={() => setOrganizationType(type)}
                  style={[
                    styles.typeButton,
                    responsive.isMobile && styles.fullWidthItem,
                    active && styles.typeButtonActive,
                    disabled && styles.typeButtonDisabled,
                  ]}
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
                </Pressable>
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

        {loading ? (
          <Card>
            <Text style={styles.mutedText}>
              {t("organizations.createLoading")}
            </Text>
          </Card>
        ) : null}

        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

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
            label={t("organizations.displayName")}
            onChangeText={setName}
            placeholder={t("organizations.displayNamePlaceholder")}
            value={name}
          />
          <FieldError message={errors.name} />

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.legalName")}
            onChangeText={setLegalName}
            placeholder={t("organizations.legalNamePlaceholder")}
            value={legalName}
          />
          <FieldError message={errors.legalName} />

          <View
            style={[
              styles.twoColumn,
              responsive.isMobile && styles.twoColumnMobile,
            ]}
          >
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
              <Input
                autoCapitalize="characters"
                editable={canEditOrganizationFields}
                label={t("organizations.country")}
                onChangeText={setCountry}
                placeholder={t("organizations.countryPlaceholder")}
                value={country}
              />
              <FieldError message={errors.country} />
            </View>
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
              <Input
                editable={canEditOrganizationFields}
                label={t("common.city")}
                onChangeText={setCity}
                placeholder={t("organizations.cityPlaceholder")}
                value={city}
              />
              <FieldError message={errors.city} />
            </View>
          </View>

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.address")}
            onChangeText={setAddress}
            placeholder={t("organizations.addressPlaceholder")}
            value={address}
          />

          <View
            style={[
              styles.twoColumn,
              responsive.isMobile && styles.twoColumnMobile,
            ]}
          >
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
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
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
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
            keyboardType="url"
            label={t("organizations.website")}
            onChangeText={setWebsite}
            placeholder="https://example.com"
            value={website}
          />
          <FieldError message={errors.website} />

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.activityArea")}
            onChangeText={setIndustry}
            placeholder={t("organizations.industryPlaceholder")}
            value={industry}
          />
          <FieldError message={errors.industry} />

          <Input
            editable={canEditOrganizationFields}
            label={t("organizations.description")}
            multiline
            onChangeText={setDescription}
            placeholder={t("organizations.descriptionPlaceholder")}
            style={styles.bigInput}
            value={description}
          />

          <View
            style={[
              styles.twoColumn,
              responsive.isMobile && styles.twoColumnMobile,
            ]}
          >
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
              <Input
                editable={canEditOrganizationFields}
                label={t("organizations.registrationNumber")}
                onChangeText={setRegistrationNumber}
                placeholder={t("organizations.optionalPlaceholder")}
                value={registrationNumber}
              />
            </View>
            <View
              style={[
                styles.column,
                responsive.isMobile && styles.fullWidthItem,
              ]}
            >
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
              <View style={styles.optionGrid}>
                {courseDeliveryModes.map((mode) => {
                  const active = courseDeliveryMode === mode;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      disabled={submitting}
                      key={mode}
                      onPress={() => setCourseDeliveryMode(mode)}
                      style={[
                        styles.optionButton,
                        active && styles.optionButtonActive,
                        submitting && styles.optionButtonDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {t(`organizations.courseDeliveryMode.${mode}`)}
                      </Text>
                    </Pressable>
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
              <View style={styles.optionGrid}>
                {employeeCountOptions.map((option) => {
                  const active = employeeCountRange === option;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      disabled={submitting || organizationType !== "company"}
                      key={option}
                      onPress={() => setEmployeeCountRange(option)}
                      style={[
                        styles.optionButton,
                        active && styles.optionButtonActive,
                        (submitting || organizationType !== "company") &&
                          styles.optionButtonDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.optionLabel}>
                {t("organizations.companyCapabilities")}
              </Text>
              <View style={styles.optionGrid}>
                {companyCapabilityOptions.map((option) => {
                  const active = companyCapabilities.includes(option);

                  return (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      disabled={submitting || organizationType !== "company"}
                      key={option}
                      onPress={() => toggleCompanyCapability(option)}
                      style={[
                        styles.optionButton,
                        active && styles.optionButtonActive,
                        (submitting || organizationType !== "company") &&
                          styles.optionButtonDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          active && styles.optionTextActive,
                        ]}
                      >
                        {t(`organizations.capability.${option}`)}
                      </Text>
                    </Pressable>
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
          title={submitting ? t("organizations.saving") : t("organizations.save")}
          onPress={handleSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text style={styles.fieldError}>{message}</Text> : null;
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

function readError(error: unknown, t: (key: string) => string) {
  return error instanceof Error ? error.message : t("organizations.saveError");
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
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  statusBox: {
    backgroundColor: "#FFF7E8",
    borderColor: "#F6D7A8",
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  statusTitle: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  exampleList: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  exampleItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  exampleBullet: {
    color: Colors.brand,
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
  fieldError: {
    color: Colors.danger,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: -Spacing.md,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: Spacing.lg,
  },
  typeButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  typeButtonDisabled: {
    opacity: 0.56,
  },
  typeButtonText: {
    color: Colors.textBody,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  typeButtonTextActive: {
    color: "#145CFF",
  },
  comingSoonText: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  twoColumnMobile: {
    flexDirection: "column",
  },
  column: {
    flexBasis: 220,
    flexGrow: 1,
  },
  fullWidthItem: {
    flexBasis: "100%",
  },
  optionLabel: {
    color: Colors.text,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  optionButtonDisabled: {
    opacity: 0.56,
  },
  optionText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  optionTextActive: {
    color: "#145CFF",
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.lg,
  },
  bigInput: {
    height: 120,
    textAlignVertical: "top",
  },
});
