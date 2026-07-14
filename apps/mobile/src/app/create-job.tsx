import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import RequireAuth from "@/components/RequireAuth";
import { Button, Card, Header, Input, Screen } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchCurrentUserCompany,
  fetchJobCategories,
  fetchOccupations,
  publishJob,
  type CompanySummary,
  type JobCategory,
  type JobOccupation,
} from "@/services/jobs/jobFlowService";
import {
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/search/heroAutocomplete";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type LocationOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

type FormErrors = Partial<
  Record<
    | "category"
    | "description"
    | "expiresAt"
    | "location"
    | "occupation"
    | "salary"
    | "title",
    string
  >
>;

const salaryTypes = [
  { label: "Pe ora", value: "hourly" },
  { label: "Lunar", value: "monthly" },
  { label: "Anual", value: "yearly" },
  { label: "Fix", value: "fixed" },
];

const employmentTypes = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Mini job", value: "mini_job" },
  { label: "Temporar", value: "temporary" },
  { label: "Contract", value: "contract" },
  { label: "Freelance", value: "freelance" },
];

const experienceLevels = [
  { label: "Entry", value: "entry" },
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Oricare", value: "any" },
];

const languageOptions = [
  { label: "Romana", value: "ro" },
  { label: "Germana", value: "de" },
  { label: "Engleza", value: "en" },
  { label: "Oricare", value: "any" },
];

export default function CreateJobScreen() {
  return (
    <RequireAuth requiredRole="business">
      <CreateJobContent />
    </RequireAuth>
  );
}

function CreateJobContent() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanySummary | null>(null);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [occupations, setOccupations] = useState<JobOccupation[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedOccupationId, setSelectedOccupationId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [salaryType, setSalaryType] = useState("monthly");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [workingHours, setWorkingHours] = useState("");
  const [jobLanguage, setJobLanguage] = useState("de");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const locationRequestId = useRef(0);

  const locationOptions = useMemo<LocationOption[]>(
    () =>
      locationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        title: suggestion.label,
      })),
    [locationSuggestions]
  );

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedOccupation = occupations.find(
    (occupation) => occupation.id === selectedOccupationId
  );

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      if (!user?.id) {
        return;
      }

      setLoadingInitialData(true);
      setLoadError("");

      try {
        const [nextCompany, nextCategories] = await Promise.all([
          fetchCurrentUserCompany(user.id),
          fetchJobCategories(),
        ]);

        if (!mounted) {
          return;
        }

        setCompany(nextCompany);
        setCategories(nextCategories);
      } catch (error) {
        if (mounted) {
          setLoadError(readError(error));
        }
      } finally {
        if (mounted) {
          setLoadingInitialData(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    if (!selectedCategoryId) {
      return;
    }

    fetchOccupations(selectedCategoryId)
      .then((nextOccupations) => {
        if (!mounted) {
          return;
        }

        setOccupations(nextOccupations);
        setSelectedOccupationId((currentOccupationId) => {
          const stillValid = nextOccupations.some(
            (occupation) => occupation.id === currentOccupationId
          );

          return stillValid ? currentOccupationId : "";
        });
      })
      .catch((error) => {
        if (mounted) {
          setLoadError(readError(error));
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategoryId]);

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

  async function handlePublish() {
    if (submitting) {
      return;
    }

    const salaryFromValue = parseOptionalNumber(salaryFrom);
    const salaryToValue = parseOptionalNumber(salaryTo);
    const nextErrors = validateForm({
      description,
      expiresAt,
      salaryFrom: salaryFromValue,
      salaryTo: salaryToValue,
      selectedCategoryId,
      selectedLocation,
      selectedOccupation,
      selectedOccupationId,
      title,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!company) {
      setLoadError("Nu exista o companie activa asociata contului curent.");
      return;
    }

    setSubmitting(true);
    setLoadError("");

    try {
      const jobId = await publishJob({
        categoryId: selectedCategoryId,
        description: description.trim(),
        employmentType,
        experienceLevel,
        expiresAt: normalizeDate(expiresAt),
        language: jobLanguage,
        locationId: selectedLocation?.id ?? "",
        occupationId: selectedOccupationId,
        salaryFrom: salaryFromValue,
        salaryTo: salaryToValue,
        salaryType,
        title: title.trim(),
        workingHours: workingHours.trim() || null,
      });

      router.replace(`/job-published?jobId=${encodeURIComponent(jobId)}` as any);
    } catch (error) {
      setLoadError(readError(error));
    } finally {
      setSubmitting(false);
    }
  }

  const formDisabled = loadingInitialData || !company || submitting;

  return (
    <Screen centered={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={t("createJob.title")}
          subtitle={t("createJob.subtitle")}
        />

        {loadingInitialData ? (
          <Card>
            <Text style={styles.mutedText}>Se incarca datele reale...</Text>
          </Card>
        ) : null}

        {company ? (
          <Card title="Companie">
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.mutedText}>Status: {company.status}</Text>
            <Text style={styles.mutedText}>
              Verificare: {company.verification_status}
            </Text>
          </Card>
        ) : !loadingInitialData ? (
          <Card variant="warning">
            <Text style={styles.warningText}>
              Nu exista o companie activa si verificata asociata contului tau.
              Publicarea este blocata pana cand profilul firmei este creat si
              verificat.
            </Text>
          </Card>
        ) : null}

        {loadError ? <Text style={styles.formError}>{loadError}</Text> : null}

        <Card title="Detalii job">
          <Input
            editable={!formDisabled}
            label="Titlul jobului"
            onChangeText={setTitle}
            placeholder="ex: Lucrator depozit"
            value={title}
          />
          <FieldError message={errors.title} />

          <OptionSection
            disabled={formDisabled}
            error={errors.category}
            label="Categoria"
            onSelect={(value) => {
              setSelectedCategoryId(value);
              setSelectedOccupationId("");
            }}
            options={categories.map((category) => ({
              label: localizedName(category, language),
              value: category.id,
            }))}
            value={selectedCategoryId}
          />

          <OptionSection
            disabled={formDisabled || !selectedCategory}
            error={errors.occupation}
            label="Ocupatia"
            onSelect={setSelectedOccupationId}
            options={occupations.map((occupation) => ({
              label: localizedName(occupation, language),
              value: occupation.id,
            }))}
            value={selectedOccupationId}
          />

          <View style={styles.locationField}>
            <HeroAutocompleteField
              activeIndex={locationActiveIndex}
              emptyMessage="Nu am gasit rezultate"
              errorMessage={locationError}
              fieldId="create-job-location"
              isOpen={locationOpen && locationText.trim().length >= 2}
              label="Locatia"
              loading={locationLoading}
              onActiveIndexChange={setLocationActiveIndex}
              onChangeText={handleLocationTextChange}
              onFocus={() => {
                if (locationText.trim().length >= 2) {
                  setLocationOpen(true);
                }
              }}
              onRequestClose={() => {
                setLocationOpen(false);
              }}
              onSelect={handleLocationSelect}
              placeholder="ex: 86150 Augsburg"
              queryText={locationText}
              suggestions={locationOptions}
              value={locationText}
            />
          </View>
          <FieldError message={errors.location} />

          <Input
            editable={!formDisabled}
            label="Descrierea"
            multiline
            onChangeText={setDescription}
            placeholder="Descrie responsabilitatile, cerintele si beneficiile."
            style={styles.bigInput}
            value={description}
          />
          <FieldError message={errors.description} />
        </Card>

        <Card title="Conditii">
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Input
                editable={!formDisabled}
                keyboardType="decimal-pad"
                label="Salariu minim"
                onChangeText={setSalaryFrom}
                placeholder="ex: 2200"
                value={salaryFrom}
              />
            </View>
            <View style={styles.column}>
              <Input
                editable={!formDisabled}
                keyboardType="decimal-pad"
                label="Salariu maxim"
                onChangeText={setSalaryTo}
                placeholder="ex: 2800"
                value={salaryTo}
              />
            </View>
          </View>
          <FieldError message={errors.salary} />

          <OptionSection
            disabled={formDisabled}
            label="Tipul salariului"
            onSelect={setSalaryType}
            options={salaryTypes}
            value={salaryType}
          />

          <OptionSection
            disabled={formDisabled}
            label="Tipul contractului"
            onSelect={setEmploymentType}
            options={employmentTypes}
            value={employmentType}
          />

          <OptionSection
            disabled={formDisabled}
            label="Nivelul de experienta"
            onSelect={setExperienceLevel}
            options={experienceLevels}
            value={experienceLevel}
          />

          <Input
            editable={!formDisabled}
            label="Programul de lucru"
            onChangeText={setWorkingHours}
            placeholder="ex: 40h / saptamana, schimburi"
            value={workingHours}
          />

          <OptionSection
            disabled={formDisabled}
            label="Limba necesara"
            onSelect={setJobLanguage}
            options={languageOptions}
            value={jobLanguage}
          />

          <Input
            editable={!formDisabled}
            label="Data expirarii"
            onChangeText={setExpiresAt}
            placeholder="YYYY-MM-DD"
            value={expiresAt}
          />
          <FieldError message={errors.expiresAt} />
        </Card>

        <Button
          disabled={formDisabled}
          onPress={handlePublish}
          title={submitting ? "Se publica..." : t("createJob.publish")}
        />

        <Button
          title={t("common.back")}
          variant="ghost"
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/business-dashboard" as any);
            }
          }}
        />
      </ScrollView>
    </Screen>
  );
}

function OptionSection({
  disabled,
  error,
  label,
  onSelect,
  options,
  value,
}: {
  disabled?: boolean;
  error?: string;
  label: string;
  onSelect: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <View style={styles.optionSection}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionGrid}>
        {options.length === 0 ? (
          <Text style={styles.mutedText}>Nu exista optiuni disponibile.</Text>
        ) : (
          options.map((option) => {
            const active = option.value === value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled, selected: active }}
                disabled={disabled}
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                }}
                style={[
                  styles.optionButton,
                  active && styles.optionButtonActive,
                  disabled && styles.optionButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active && styles.optionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
      <FieldError message={error} />
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <Text style={styles.fieldError}>{message}</Text> : null;
}

function validateForm({
  description,
  expiresAt,
  salaryFrom,
  salaryTo,
  selectedCategoryId,
  selectedLocation,
  selectedOccupation,
  selectedOccupationId,
  title,
}: {
  description: string;
  expiresAt: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  selectedCategoryId: string;
  selectedLocation: LocationSuggestion | null;
  selectedOccupation?: JobOccupation;
  selectedOccupationId: string;
  title: string;
}) {
  const nextErrors: FormErrors = {};

  if (!title.trim()) {
    nextErrors.title = "Titlul este obligatoriu.";
  }

  if (!selectedCategoryId) {
    nextErrors.category = "Categoria este obligatorie.";
  }

  if (!selectedOccupationId) {
    nextErrors.occupation = "Ocupatia este obligatorie.";
  }

  if (selectedOccupationId && !selectedOccupation) {
    nextErrors.occupation = "Selecteaza o ocupatie valida.";
  }

  if (
    selectedOccupation &&
    selectedCategoryId &&
    selectedOccupation.category_id !== selectedCategoryId
  ) {
    nextErrors.occupation = "Ocupatia nu apartine categoriei selectate.";
  }

  if (!selectedLocation) {
    nextErrors.location = "Selecteaza o locatie din lista.";
  }

  if (!description.trim()) {
    nextErrors.description = "Descrierea este obligatorie.";
  }

  if (salaryFrom !== null && salaryTo !== null && salaryFrom > salaryTo) {
    nextErrors.salary = "Salariul minim nu poate fi mai mare decat salariul maxim.";
  }

  if (expiresAt.trim() && !normalizeDate(expiresAt)) {
    nextErrors.expiresAt = "Foloseste formatul YYYY-MM-DD.";
  }

  return nextErrors;
}

function parseOptionalNumber(value: string) {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const date = new Date(`${trimmed}T23:59:59.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function localizedName(
  row: Pick<JobCategory | JobOccupation, "name_ro" | "name_de" | "name_en">,
  language: LanguageCode
) {
  if (language === "de") {
    return row.name_de;
  }

  if (language === "en") {
    return row.name_en;
  }

  return row.name_ro;
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "A aparut o eroare. Incearca din nou.";
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingBottom: Spacing.five,
  },
  companyName: {
    color: Colors.text,
    fontSize: Typography.cardTitle,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.sm,
  },
  mutedText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  warningText: {
    color: Colors.text,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  formError: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
    lineHeight: Typography.lineHeight.body,
  },
  fieldError: {
    color: Colors.danger,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: -Spacing.md,
  },
  optionSection: {
    marginBottom: Spacing.lg,
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
  locationField: {
    marginBottom: Spacing.xxl,
    zIndex: 20,
  },
  bigInput: {
    height: 112,
    textAlignVertical: "top",
  },
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  column: {
    flexBasis: 220,
    flexGrow: 1,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});
