import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import RequireAuth from "@/components/RequireAuth";
import {
  Button,
  Card,
  DefinitionList,
  ErrorState,
  Input,
  LoadingState,
  PageContainer,
  PageHeader,
  Section,
  StatusBadge,
} from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { LanguageCode } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchOwnJobForEdit,
  fetchCurrentUserCompany,
  fetchJobCategories,
  fetchOccupations,
  publishJob,
  updateOwnJob,
  type CompanySummary,
  type EditableJob,
  type JobCategory,
  type JobOccupation,
} from "@/services/jobs/jobFlowService";
import {
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/search/heroAutocomplete";
import {
  Colors,
  ControlHeight,
  Layers,
  Radius,
  Spacing,
  Typography,
} from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
    <RequireAuth>
      <CreateJobContent />
    </RequireAuth>
  );
}

function CreateJobContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ jobId?: string | string[] }>();
  const editingJobId = readParam(params.jobId);
  const isEditMode = Boolean(editingJobId);
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;
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
  const [initialLoadError, setInitialLoadError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const initialDataRequestId = useRef(0);
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

  const hydrateJob = useCallback(
    (job: EditableJob) => {
      setSelectedCategoryId(job.category_id);
      setSelectedOccupationId(job.occupation_id);
      setTitle(job.title);
      setDescription(job.description);
      setSalaryFrom(job.salary_from === null ? "" : String(job.salary_from));
      setSalaryTo(job.salary_to === null ? "" : String(job.salary_to));
      setSalaryType(job.salary_type);
      setEmploymentType(job.employment_type);
      setExperienceLevel(job.experience_level);
      setWorkingHours(job.working_hours ?? "");
      setJobLanguage(job.language);
      setExpiresAt(formatDateForInput(job.expires_at));

      if (job.location) {
        const locationSuggestion: LocationSuggestion = {
          city: job.location.city,
          countryCode: job.location.country_code,
          district: job.location.district,
          id: job.location.id,
          label: formatLocationLabel(job.location),
          latitude: job.location.latitude,
          longitude: job.location.longitude,
          postalCode: job.location.postal_code,
          state: job.location.state,
        };

        setSelectedLocation(locationSuggestion);
        setLocationText(locationSuggestion.label);
      }
    },
    []
  );

  const loadInitialData = useCallback(async () => {
    if (!userId) {
      return;
    }

    const requestId = ++initialDataRequestId.current;
    setLoadingInitialData(true);
    setInitialLoadError("");
    setLoadError("");

    try {
      const [nextCompany, nextCategories, editableJob] = await Promise.all([
        fetchCurrentUserCompany(userId),
        fetchJobCategories(),
        editingJobId ? fetchOwnJobForEdit(editingJobId) : Promise.resolve(null),
      ]);

      if (initialDataRequestId.current !== requestId) {
        return;
      }

      setCompany(nextCompany);
      setCategories(nextCategories);

      if (editableJob) {
        hydrateJob(editableJob);
      }
    } catch (error) {
      if (initialDataRequestId.current === requestId) {
        setInitialLoadError(readError(error));
      }
    } finally {
      if (initialDataRequestId.current === requestId) {
        setLoadingInitialData(false);
      }
    }
  }, [editingJobId, hydrateJob, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadInitialData();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      initialDataRequestId.current += 1;
    };
  }, [loadInitialData]);

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

    if (!selectedLocation?.id || !selectedOccupationId) {
      setLoadError("Selecteaza o locatie si o ocupatie valida.");
      return;
    }

    setSubmitting(true);
    setLoadError("");

    try {
      const jobPayload = {
        categoryId: selectedCategoryId,
        description: description.trim(),
        employmentType,
        experienceLevel,
        expiresAt: normalizeDate(expiresAt),
        language: jobLanguage,
        locationId: selectedLocation.id,
        occupationId: selectedOccupationId,
        salaryFrom: salaryFromValue,
        salaryTo: salaryToValue,
        salaryType,
        title: title.trim(),
        workingHours: workingHours.trim() || null,
      };
      const jobId =
        isEditMode && editingJobId
          ? await updateOwnJob({
              ...jobPayload,
              jobId: editingJobId,
            })
          : await publishJob(jobPayload);

      router.replace(
        isEditMode
          ? ("/organizations" as any)
          : (`/job-published?jobId=${encodeURIComponent(jobId)}` as any)
      );
    } catch (error) {
      setLoadError(readError(error));
    } finally {
      setSubmitting(false);
    }
  }

  const formDisabled = loadingInitialData || !company || submitting;

  return (
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="form"
      scroll
    >
        <PageHeader
          backLabel={t("common.back")}
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/organizations" as never);
            }
          }}
          title={isEditMode ? "Editeaza jobul" : t("createJob.title")}
          description={
            isEditMode
              ? "Actualizeaza detaliile jobului companiei tale."
              : t("createJob.subtitle")
          }
        />

        {loadingInitialData ? (
          <LoadingState title="Se încarcă datele reale..." />
        ) : initialLoadError ? (
          <ErrorState
            description={initialLoadError}
            onRetry={() => void loadInitialData()}
            title="Datele jobului nu au putut fi încărcate"
          />
        ) : !company ? (
          <ErrorState
            description="Nu există o companie activă și verificată asociată contului. Publicarea rămâne blocată până la completarea organizației."
            title="Publicarea nu este disponibilă"
          />
        ) : (
          <>
            <Section title="Companie">
              <DefinitionList
                columns={2}
                items={[
                  { label: "Nume", value: company.name },
                  {
                    label: "Status",
                    value: <StatusBadge status={company.status} />,
                  },
                  {
                    label: "Verificare",
                    value: <StatusBadge status={company.verification_status} />,
                  },
                ]}
              />
            </Section>

            {loadError ? (
              <Text
                accessibilityLiveRegion="assertive"
                role="alert"
                style={styles.formError}
              >
                {loadError}
              </Text>
            ) : null}

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
              title={
                submitting
                  ? isEditMode
                    ? "Se salveaza..."
                    : "Se publica..."
                  : isEditMode
                    ? "Salveaza modificarile"
                    : t("createJob.publish")
              }
            />
          </>
        )}
    </PageContainer>
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
      <View
        accessibilityLabel={label}
        accessibilityRole="radiogroup"
        style={styles.optionGrid}
      >
        {options.length === 0 ? (
          <Text style={styles.mutedText}>Nu exista optiuni disponibile.</Text>
        ) : (
          options.map((option) => {
            const active = option.value === value;

            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: active, disabled }}
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

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDateForInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
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
    marginTop: Spacing.none,
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
    justifyContent: "center",
    minHeight: ControlHeight.minimumTouch,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionButtonActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldPrimary,
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
    color: Colors.goldPressed,
  },
  locationField: {
    marginBottom: Spacing.xxl,
    zIndex: Layers.dropdown,
  },
  bigInput: {
    // Multi-line job descriptions need a stable editing area.
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
});
