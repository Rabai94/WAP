import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import RequireAuth from "@/components/RequireAuth";
import {
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
  RabAIInput,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  searchLocationSuggestions,
  searchOccupationSuggestions,
  type LocationSuggestion,
  type OccupationSuggestion,
} from "@/services/search/heroAutocomplete";
import {
  fetchOwnWorkerProfile,
  saveOwnWorkerProfile,
  type WorkerProfile,
} from "@/services/worker/workerService";
import { Colors, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type LocationOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

type OccupationOption = HeroAutocompleteOption & {
  suggestion: OccupationSuggestion;
};

type FormErrors = Partial<
  Record<
    | "experienceYears"
    | "firstName"
    | "lastName"
    | "location"
    | "occupation"
    | "phone",
    string
  >
>;

const languageOptions = ["ro", "de", "en"] as const;
const availabilityOptions = ["available", "soon", "employed", "unavailable"] as const;
const workAuthorizationOptions = [
  "eu_citizen",
  "work_permit",
  "needs_permit",
  "unknown",
] as const;

export default function ProfileEditScreen() {
  return (
    <RequireAuth>
      <ProfileEditContent />
    </RequireAuth>
  );
}

function ProfileEditContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationText, setLocationText] = useState("");
  const [occupationText, setOccupationText] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [selectedOccupation, setSelectedOccupation] =
    useState<OccupationSuggestion | null>(null);
  const [experienceYears, setExperienceYears] = useState("0");
  const [preferredLanguage, setPreferredLanguage] = useState("de");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [workAuthorizationStatus, setWorkAuthorizationStatus] =
    useState("unknown");
  const [professionalSummary, setProfessionalSummary] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [occupationSuggestions, setOccupationSuggestions] = useState<
    OccupationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [occupationLoading, setOccupationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [occupationError, setOccupationError] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [occupationOpen, setOccupationOpen] = useState(false);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const [occupationActiveIndex, setOccupationActiveIndex] = useState(-1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const profileLoadRequestId = useRef(0);
  const locationRequestId = useRef(0);
  const occupationRequestId = useRef(0);

  const locationOptions = useMemo<LocationOption[]>(
    () =>
      locationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        title: suggestion.label,
      })),
    [locationSuggestions]
  );

  const occupationOptions = useMemo<OccupationOption[]>(
    () =>
      occupationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        subtitle: suggestion.categoryLabel,
        title: suggestion.label,
      })),
    [occupationSuggestions]
  );

  const hydrateProfile = useCallback(
    (profile: WorkerProfile) => {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhone(profile.phone ?? "");
      setExperienceYears(String(profile.experience_years ?? 0));
      setPreferredLanguage(profile.preferred_language);
      setAvailabilityStatus(profile.availability_status);
      setWorkAuthorizationStatus(profile.work_authorization_status);
      setProfessionalSummary(profile.professional_summary ?? "");

      if (profile.location) {
        const locationSuggestion: LocationSuggestion = {
          city: profile.location.city,
          countryCode: profile.location.country_code,
          district: profile.location.district,
          id: profile.location.id,
          label: formatLocationLabel(profile.location),
          latitude: profile.location.latitude,
          longitude: profile.location.longitude,
          postalCode: profile.location.postal_code,
          state: profile.location.state,
        };

        setSelectedLocation(locationSuggestion);
        setLocationText(locationSuggestion.label);
      }

      if (profile.occupation) {
        const occupationSuggestion: OccupationSuggestion = {
          categoryLabel: profile.occupation.category
            ? localizedName(profile.occupation.category, language)
            : "",
          id: profile.occupation.id,
          label: localizedName(profile.occupation, language),
          slug: profile.occupation.slug,
        };

        setSelectedOccupation(occupationSuggestion);
        setOccupationText(occupationSuggestion.label);
      }
    },
    [language]
  );

  const loadProfile = useCallback(async () => {
    const requestId = profileLoadRequestId.current + 1;
    profileLoadRequestId.current = requestId;

    if (!userId) {
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    setLoadError("");

    try {
      const profile = await fetchOwnWorkerProfile(userId);

      if (profileLoadRequestId.current === requestId && profile) {
        hydrateProfile(profile);
      }
    } catch (error) {
      if (profileLoadRequestId.current === requestId) {
        setLoadError(readError(error, t));
      }
    } finally {
      if (profileLoadRequestId.current === requestId) {
        setLoadingProfile(false);
      }
    }
  }, [hydrateProfile, t, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      profileLoadRequestId.current += 1;
    };
  }, [loadProfile]);

  useEffect(() => {
    const searchQuery = normalizeLocationSearchQuery(locationText);
    locationRequestId.current += 1;
    const requestId = locationRequestId.current;

    if (searchQuery.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLocationLoading(true);
      setLocationError(null);

      searchLocationSuggestions(searchQuery, 10)
        .then((suggestions) => {
          if (locationRequestId.current !== requestId) {
            return;
          }

          setLocationSuggestions(suggestions);
          setLocationActiveIndex(suggestions.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (locationRequestId.current !== requestId) {
            return;
          }

          setLocationSuggestions([]);
          setLocationActiveIndex(-1);
          setLocationError(t("profileEdit.locationError"));
        })
        .finally(() => {
          if (locationRequestId.current === requestId) {
            setLocationLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationText, t]);

  useEffect(() => {
    const trimmedOccupation = occupationText.trim();
    occupationRequestId.current += 1;
    const requestId = occupationRequestId.current;

    if (trimmedOccupation.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setOccupationLoading(true);
      setOccupationError(null);

      searchOccupationSuggestions(trimmedOccupation, language, 8)
        .then((suggestions) => {
          if (occupationRequestId.current !== requestId) {
            return;
          }

          setOccupationSuggestions(suggestions);
          setOccupationActiveIndex(suggestions.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (occupationRequestId.current !== requestId) {
            return;
          }

          setOccupationSuggestions([]);
          setOccupationActiveIndex(-1);
          setOccupationError(t("profileEdit.occupationError"));
        })
        .finally(() => {
          if (occupationRequestId.current === requestId) {
            setOccupationLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [language, occupationText, t]);

  function handleLocationTextChange(text: string) {
    setLocationText(text);

    if (selectedLocation && text !== selectedLocation.label) {
      setSelectedLocation(null);
    }

    if (normalizeLocationSearchQuery(text).length < 2) {
      locationRequestId.current += 1;
      setLocationSuggestions([]);
      setLocationActiveIndex(-1);
      setLocationError(null);
      setLocationLoading(false);
    } else {
      setLocationOpen(true);
    }
  }

  function handleOccupationTextChange(text: string) {
    setOccupationText(text);

    if (selectedOccupation && text !== selectedOccupation.label) {
      setSelectedOccupation(null);
    }

    if (text.trim().length < 2) {
      occupationRequestId.current += 1;
      setOccupationSuggestions([]);
      setOccupationActiveIndex(-1);
      setOccupationError(null);
      setOccupationLoading(false);
    } else {
      setOccupationOpen(true);
    }
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const nextErrors = validateForm({
      experienceYears,
      firstName,
      lastName,
      phone,
      selectedLocation,
      selectedOccupation,
      t,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSaveError("");

    try {
      await saveOwnWorkerProfile({
        availabilityStatus,
        experienceYears: Number(experienceYears),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        locationId: selectedLocation?.id ?? "",
        occupationId: selectedOccupation?.id ?? "",
        phone: phone.trim() || null,
        preferredLanguage,
        professionalSummary: professionalSummary.trim() || null,
        workAuthorizationStatus,
      });
      router.replace("/profile" as any);
    } catch (error) {
      setSaveError(readError(error, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="form"
      scroll
    >
      <PageHeader
        description={t("profileEdit.subtitle")}
        title={t("profileEdit.title")}
      />

      {loadingProfile ? (
        <LoadingState title={t("profileEdit.loading")} />
      ) : loadError ? (
        <ErrorState
          description={loadError}
          onRetry={() => void loadProfile()}
          retryLabel={getRetryLabel(language)}
          title={t("profileEdit.title")}
        />
      ) : (
        <>
          {saveError ? (
            <ErrorState
              compact
              description={saveError}
              title={t("profileEdit.saveError")}
            />
          ) : null}

          <RabAICard title={t("profileEdit.personalTitle")}>
            <View style={styles.twoColumn}>
              <View style={styles.fieldColumn}>
                <RabAIInput
                  disabled={submitting}
                  errorText={errors.firstName}
                  label={t("profileEdit.firstName")}
                  onChangeText={setFirstName}
                  placeholder={t("profileEdit.firstNamePlaceholder")}
                  required
                  value={firstName}
                />
              </View>
              <View style={styles.fieldColumn}>
                <RabAIInput
                  disabled={submitting}
                  errorText={errors.lastName}
                  label={t("profileEdit.lastName")}
                  onChangeText={setLastName}
                  placeholder={t("profileEdit.lastNamePlaceholder")}
                  required
                  value={lastName}
                />
              </View>
            </View>

            <RabAIInput
              disabled={submitting}
              errorText={errors.phone}
              label={t("common.phone")}
              onChangeText={setPhone}
              placeholder="+49 151 12345678"
              value={phone}
            />
          </RabAICard>

          <RabAICard title={t("profileEdit.professionalTitle")}>
            <View style={styles.autocompleteStack}>
              <HeroAutocompleteField
                activeIndex={locationActiveIndex}
                disabled={submitting}
                dropdownMode="inline"
                emptyMessage={t("profileEdit.noResults")}
                errorMessage={locationError}
                fieldId="profile-location"
                isOpen={
                  locationOpen &&
                  normalizeLocationSearchQuery(locationText).length >= 2
                }
                label={t("common.location")}
                loading={locationLoading}
                onActiveIndexChange={setLocationActiveIndex}
                onChangeText={handleLocationTextChange}
                onFocus={() => {
                  if (normalizeLocationSearchQuery(locationText).length >= 2) {
                    setLocationOpen(true);
                  }
                }}
                onRequestClose={() => setLocationOpen(false)}
                onSelect={(option) => {
                  setSelectedLocation(option.suggestion);
                  setLocationText(option.suggestion.label);
                  setLocationOpen(false);
                  setLocationActiveIndex(-1);
                }}
                placeholder={t("profileEdit.locationPlaceholder")}
                queryText={locationText}
                required
                suggestions={locationOptions}
                validationError={errors.location}
                value={locationText}
              />

              <HeroAutocompleteField
                activeIndex={occupationActiveIndex}
                disabled={submitting}
                dropdownMode="inline"
                emptyMessage={t("profileEdit.noResults")}
                errorMessage={occupationError}
                fieldId="profile-occupation"
                isOpen={occupationOpen && occupationText.trim().length >= 2}
                label={t("profileUnified.occupation")}
                loading={occupationLoading}
                onActiveIndexChange={setOccupationActiveIndex}
                onChangeText={handleOccupationTextChange}
                onFocus={() => {
                  if (occupationText.trim().length >= 2) {
                    setOccupationOpen(true);
                  }
                }}
                onRequestClose={() => setOccupationOpen(false)}
                onSelect={(option) => {
                  setSelectedOccupation(option.suggestion);
                  setOccupationText(option.suggestion.label);
                  setOccupationOpen(false);
                  setOccupationActiveIndex(-1);
                }}
                placeholder={t("profileEdit.occupationPlaceholder")}
                queryText={occupationText}
                required
                suggestions={occupationOptions}
                validationError={errors.occupation}
                value={occupationText}
              />
            </View>

            <RabAIInput
              disabled={submitting}
              errorText={errors.experienceYears}
              keyboardType="numeric"
              label={t("profileUnified.experience")}
              onChangeText={setExperienceYears}
              placeholder="0"
              required
              value={experienceYears}
            />

            <SegmentedControl
              disabled={submitting}
              label={t("profileUnified.preferredLanguage")}
              onChange={setPreferredLanguage}
              options={languageOptions.map((value) => ({
                label: t(`profile.language.${value}`),
                value,
              }))}
              value={preferredLanguage}
            />

            <SegmentedControl
              disabled={submitting}
              label={t("profileUnified.availability")}
              onChange={setAvailabilityStatus}
              options={availabilityOptions.map((value) => ({
                label: t(`profileUnified.availability.${value}`),
                value,
              }))}
              value={availabilityStatus}
            />

            <SegmentedControl
              disabled={submitting}
              label={t("profileUnified.workAuthorization")}
              onChange={setWorkAuthorizationStatus}
              options={workAuthorizationOptions.map((value) => ({
                label: t(`profileUnified.workAuthorization.${value}`),
                value,
              }))}
              value={workAuthorizationStatus}
            />

            <RabAIInput
              disabled={submitting}
              label={t("profileEdit.summary")}
              multiline
              onChangeText={setProfessionalSummary}
              placeholder={t("profileEdit.summaryPlaceholder")}
              value={professionalSummary}
            />
          </RabAICard>

          <View style={styles.formActions}>
            <RabAIButton
              disabled={submitting}
              onPress={() => router.replace("/profile" as any)}
              style={styles.formAction}
              title={t("common.cancel")}
              variant="secondary"
            />
            <RabAIButton
              disabled={submitting}
              loading={submitting}
              loadingLabel={t("profileEdit.saving")}
              onPress={() => void handleSubmit()}
              style={styles.formAction}
              title={t("profileEdit.save")}
            />
          </View>
        </>
      )}
    </PageContainer>
  );
}

function SegmentedControl({
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={styles.segmentBlock}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const active = option.value === value;

          return (
            <RabAIButton
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
              size="sm"
              style={styles.segmentButton}
              title={option.label}
              variant={active ? "secondary" : "outline"}
            />
          );
        })}
      </View>
    </View>
  );
}

function validateForm({
  experienceYears,
  firstName,
  lastName,
  phone,
  selectedLocation,
  selectedOccupation,
  t,
}: {
  experienceYears: string;
  firstName: string;
  lastName: string;
  phone: string;
  selectedLocation: LocationSuggestion | null;
  selectedOccupation: OccupationSuggestion | null;
  t: (key: string) => string;
}) {
  const nextErrors: FormErrors = {};
  const parsedExperience = Number(experienceYears);

  if (!firstName.trim()) {
    nextErrors.firstName = t("profileEdit.error.firstName");
  }

  if (!lastName.trim()) {
    nextErrors.lastName = t("profileEdit.error.lastName");
  }

  if (!selectedLocation) {
    nextErrors.location = t("profileEdit.error.location");
  }

  if (!selectedOccupation) {
    nextErrors.occupation = t("profileEdit.error.occupation");
  }

  if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
    nextErrors.experienceYears = t("profileEdit.error.experience");
  }

  if (phone.trim() && !/^[+0-9 ()-]{7,32}$/.test(phone.trim())) {
    nextErrors.phone = t("profileEdit.error.phone");
  }

  return nextErrors;
}

function localizedName(
  row: { name_ro: string; name_de: string; name_en: string },
  language: string
) {
  if (language === "de") {
    return row.name_de;
  }

  if (language === "en") {
    return row.name_en;
  }

  return row.name_ro;
}

function formatLocationLabel(location: {
  city: string;
  district: string | null;
  postal_code: string;
  state: string;
}) {
  const cityLabel = location.district
    ? `${location.city}-${location.district}`
    : location.city;

  return `${location.postal_code} ${cityLabel}, ${location.state}`;
}

function normalizeLocationSearchQuery(value: string) {
  const [cityQuery = ""] = value.trim().split(",", 1);
  return cityQuery.trim();
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
  return error instanceof Error ? error.message : t("profileEdit.saveError");
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.section,
  },
  formActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  formAction: {
    flexBasis: "45%",
    flexGrow: 1,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.component,
  },
  fieldColumn: {
    flexBasis: 240,
    flexGrow: 1,
    minWidth: 0,
  },
  autocompleteStack: {
    gap: Spacing.component,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.bold,
  },
  segmentBlock: {
    gap: Spacing.control,
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  segmentButton: {
    flexBasis: 128,
    flexGrow: 1,
    minWidth: 0,
  },
});
