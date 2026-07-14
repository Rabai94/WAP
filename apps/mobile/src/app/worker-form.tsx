import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "@/components/ui";
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
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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

const languageOptions = [
  { label: "Romana", value: "ro" },
  { label: "Germana", value: "de" },
  { label: "Engleza", value: "en" },
];

const availabilityOptions = [
  { label: "Disponibil acum", value: "available" },
  { label: "Disponibil in curand", value: "soon" },
  { label: "Angajat momentan", value: "employed" },
  { label: "Indisponibil", value: "unavailable" },
];

const workAuthorizationOptions = [
  { label: "Cetatean UE", value: "eu_citizen" },
  { label: "Permis de munca", value: "work_permit" },
  { label: "Are nevoie de permis", value: "needs_permit" },
  { label: "De clarificat", value: "unknown" },
];

export default function WorkerFormScreen() {
  return (
    <RequireAuth requiredRole="worker">
      <WorkerFormContent />
    </RequireAuth>
  );
}

function WorkerFormContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
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

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user?.id) {
        return;
      }

      setLoadingProfile(true);
      setLoadError("");

      try {
        const profile = await fetchOwnWorkerProfile(user.id);

        if (mounted && profile) {
          hydrateProfile(profile);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(readError(error));
        }
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [hydrateProfile, user?.id]);

  useEffect(() => {
    const trimmedLocation = locationText.trim();
    locationRequestId.current += 1;
    const requestId = locationRequestId.current;

    if (trimmedLocation.length < 2) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLocationLoading(true);
      setLocationError(null);

      searchLocationSuggestions(trimmedLocation, 10)
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
          setLocationError("Nu am putut incarca locatiile.");
        })
        .finally(() => {
          if (locationRequestId.current === requestId) {
            setLocationLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [locationText]);

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
          setOccupationError("Nu am putut incarca ocupatiile.");
        })
        .finally(() => {
          if (occupationRequestId.current === requestId) {
            setOccupationLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [language, occupationText]);

  function handleLocationTextChange(text: string) {
    setLocationText(text);

    if (selectedLocation && text !== selectedLocation.label) {
      setSelectedLocation(null);
    }

    if (text.trim().length < 2) {
      locationRequestId.current += 1;
      setLocationSuggestions([]);
      setLocationActiveIndex(-1);
      setLocationError(null);
      setLocationLoading(false);
    } else {
      setLocationOpen(true);
    }
  }

  function handleLocationSelect(option: LocationOption) {
    setSelectedLocation(option.suggestion);
    setLocationText(option.suggestion.label);
    setLocationOpen(false);
    setLocationActiveIndex(-1);
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

  function handleOccupationSelect(option: OccupationOption) {
    setSelectedOccupation(option.suggestion);
    setOccupationText(option.suggestion.label);
    setOccupationOpen(false);
    setOccupationActiveIndex(-1);
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setLoadError("");

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
      router.replace("/worker-dashboard" as any);
    } catch (error) {
      setLoadError(readError(error));
    } finally {
      setSubmitting(false);
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    const parsedExperience = Number(experienceYears);

    if (!firstName.trim()) {
      nextErrors.firstName = "Prenumele este obligatoriu.";
    }

    if (!lastName.trim()) {
      nextErrors.lastName = "Numele este obligatoriu.";
    }

    if (!selectedLocation) {
      nextErrors.location = "Alege o locatie din lista.";
    }

    if (!selectedOccupation) {
      nextErrors.occupation = "Alege o ocupatie din lista.";
    }

    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      nextErrors.experienceYears = "Experienta trebuie sa fie 0 sau mai mare.";
    }

    if (phone.trim() && !/^[+0-9 ()-]{7,32}$/.test(phone.trim())) {
      nextErrors.phone = "Telefonul nu pare valid.";
    }

    return nextErrors;
  }

  return (
    <Screen centered={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/engine" as any)}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Acasa</Text>
          </Pressable>
        </View>

        <Header
          title="Profil worker"
          subtitle="Completeaza profilul real folosit pentru aplicari la joburi."
        />

        {loadingProfile ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca profilul...</Text>
          </Card>
        ) : null}

        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

        <Card title="Date personale">
          <View style={styles.twoColumn}>
            <View style={styles.fieldColumn}>
              <Input
                label="Prenume"
                onChangeText={setFirstName}
                placeholder="ex: Ion"
                value={firstName}
              />
              <FieldError message={errors.firstName} />
            </View>
            <View style={styles.fieldColumn}>
              <Input
                label="Nume"
                onChangeText={setLastName}
                placeholder="ex: Popescu"
                value={lastName}
              />
              <FieldError message={errors.lastName} />
            </View>
          </View>

          <Input
            label="Telefon"
            onChangeText={setPhone}
            placeholder="ex: +49 151 12345678"
            value={phone}
          />
          <FieldError message={errors.phone} />
        </Card>

        <Card title="Profil profesional">
          <View style={styles.autocompleteStack}>
            <View style={styles.autocompleteWrap}>
              <HeroAutocompleteField
                activeIndex={locationActiveIndex}
                emptyMessage="Nu am gasit rezultate"
                errorMessage={locationError}
                fieldId="worker-location"
                isOpen={locationOpen && locationText.trim().length >= 2}
                label="Locatie"
                loading={locationLoading}
                onActiveIndexChange={setLocationActiveIndex}
                onChangeText={handleLocationTextChange}
                onFocus={() => {
                  if (locationText.trim().length >= 2) {
                    setLocationOpen(true);
                  }
                }}
                onRequestClose={() => setLocationOpen(false)}
                onSelect={handleLocationSelect}
                placeholder="ex: Augsburg"
                queryText={locationText}
                suggestions={locationOptions}
                value={locationText}
              />
              <FieldError message={errors.location} />
            </View>

            <View style={styles.autocompleteWrap}>
              <HeroAutocompleteField
                activeIndex={occupationActiveIndex}
                emptyMessage="Nu am gasit rezultate"
                errorMessage={occupationError}
                fieldId="worker-occupation"
                isOpen={occupationOpen && occupationText.trim().length >= 2}
                label="Ocupatie"
                loading={occupationLoading}
                onActiveIndexChange={setOccupationActiveIndex}
                onChangeText={handleOccupationTextChange}
                onFocus={() => {
                  if (occupationText.trim().length >= 2) {
                    setOccupationOpen(true);
                  }
                }}
                onRequestClose={() => setOccupationOpen(false)}
                onSelect={handleOccupationSelect}
                placeholder="ex: lucrator depozit"
                queryText={occupationText}
                suggestions={occupationOptions}
                value={occupationText}
              />
              <FieldError message={errors.occupation} />
            </View>
          </View>

          <Input
            keyboardType="numeric"
            label="Ani experienta"
            onChangeText={setExperienceYears}
            placeholder="0"
            value={experienceYears}
          />
          <FieldError message={errors.experienceYears} />

          <SegmentedControl
            label="Limba preferata"
            onChange={setPreferredLanguage}
            options={languageOptions}
            value={preferredLanguage}
          />

          <SegmentedControl
            label="Disponibilitate"
            onChange={setAvailabilityStatus}
            options={availabilityOptions}
            value={availabilityStatus}
          />

          <SegmentedControl
            label="Drept de munca"
            onChange={setWorkAuthorizationStatus}
            options={workAuthorizationOptions}
            value={workAuthorizationStatus}
          />

          <Text style={styles.label}>Scurta descriere profesionala</Text>
          <TextInput
            multiline
            onChangeText={setProfessionalSummary}
            placeholder="Experienta, roluri cautate, disponibilitate sau certificari relevante."
            placeholderTextColor={Colors.placeholder}
            style={[styles.summaryInput, styles.summaryInputMultiline]}
            value={professionalSummary}
          />
        </Card>

        <Button
          disabled={submitting}
          title={submitting ? "Se salveaza..." : "Salveaza profilul"}
          onPress={handleSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.fieldError}>{message}</Text>;
}

function SegmentedControl({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <View style={styles.segmentBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  active && styles.segmentButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
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

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut salva profilul worker.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  topBar: {
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  homeButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  homeButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  fieldColumn: {
    flexBasis: 260,
    flexGrow: 1,
  },
  autocompleteStack: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 20,
  },
  autocompleteWrap: {
    zIndex: 20,
  },
  label: {
    color: Colors.text,
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  summaryInput: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    fontSize: Typography.body,
    padding: Spacing.xxl,
  },
  summaryInputMultiline: {
    minHeight: 140,
    textAlignVertical: "top",
  },
  segmentBlock: {
    marginBottom: Spacing.xxl,
  },
  segmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  segmentButton: {
    backgroundColor: "#F4F7FB",
    borderColor: Colors.border,
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  segmentButtonActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  segmentButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  segmentButtonTextActive: {
    color: "#145CFF",
  },
  fieldError: {
    color: Colors.danger,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: -Spacing.lg,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  mutedText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
