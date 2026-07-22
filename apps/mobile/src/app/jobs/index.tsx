import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import JobSummaryCard from "@/components/jobs/JobSummaryCard";
import JobQuickView from "@/components/jobs/quick-view/JobQuickView";
import { useJobQuickView } from "@/components/jobs/quick-view/useJobQuickView";
import PublicHeader from "@/components/navigation/PublicHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAICard,
  RabAIInput,
} from "@/components/ui";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  searchJobs,
  type SearchJobResult,
} from "@/services/jobs/jobFlowService";
import { buildInternalReturnPath } from "@/services/jobs/jobNavigation";
import {
  searchLocationSuggestions,
  searchOccupationSuggestions,
  type LocationSuggestion,
  type OccupationSuggestion,
} from "@/services/search/heroAutocomplete";
import { Colors, Layers, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const employmentTypeOptions = [
  { label: "Toate", value: "" },
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Mini job", value: "mini_job" },
  { label: "Temporar", value: "temporary" },
  { label: "Contract", value: "contract" },
  { label: "Freelance", value: "freelance" },
];

type OccupationFilterOption = HeroAutocompleteOption & {
  suggestion: OccupationSuggestion;
};

type LocationFilterOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

type SelectedOccupationFilter = {
  id: string;
  label: string;
  slug: string;
};

type SelectedLocationFilter = {
  id: string;
  label: string;
  latitude: number | null;
  longitude: number | null;
};

export default function JobsScreen() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const params = useLocalSearchParams<{
    employmentType?: string | string[];
    lat?: string | string[];
    lng?: string | string[];
    location?: string | string[];
    locationId?: string | string[];
    occupation?: string | string[];
    occupationId?: string | string[];
    page?: string | string[];
    salaryMin?: string | string[];
    search?: string | string[];
  }>();
  const { language, t } = useLanguage();
  const { loading: authLoading, session } = useAuth();
  const isAuthenticated = Boolean(session);
  const homeRoute = isAuthenticated ? "/engine" : "/";
  const page = Math.max(parseIntegerParam(params.page, 1), 1);
  const jobsReturnPath = useMemo(
    () => buildInternalReturnPath("/jobs", params),
    [params]
  );
  const initialOccupation = readParam(params.occupation) || readParam(params.search);
  const initialLocation = readParam(params.location);
  const initialEmploymentType = readParam(params.employmentType);
  const initialSalaryMin = readParam(params.salaryMin);
  const initialOccupationId = readParam(params.occupationId);
  const initialLocationId = readParam(params.locationId);
  const [occupation, setOccupation] = useState(initialOccupation);
  const [location, setLocation] = useState(initialLocation);
  const [employmentType, setEmploymentType] = useState(initialEmploymentType);
  const [salaryMin, setSalaryMin] = useState(initialSalaryMin);
  const [selectedOccupation, setSelectedOccupation] =
    useState<SelectedOccupationFilter | null>(
      initialOccupationId
        ? {
            id: initialOccupationId,
            label: initialOccupation,
            slug: normalizeSlugParam(initialOccupation) ?? initialOccupation,
          }
        : null
    );
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationFilter | null>(
      initialLocationId
        ? {
            id: initialLocationId,
            label: initialLocation,
            latitude: parseOptionalNumber(readParam(params.lat)),
            longitude: parseOptionalNumber(readParam(params.lng)),
          }
        : null
    );
  const [occupationSuggestions, setOccupationSuggestions] = useState<
    OccupationSuggestion[]
  >([]);
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [occupationLoading, setOccupationLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [occupationError, setOccupationError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [occupationOpen, setOccupationOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [occupationActiveIndex, setOccupationActiveIndex] = useState(-1);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const occupationRequestId = useRef(0);
  const locationRequestId = useRef(0);
  const [jobs, setJobs] = useState<SearchJobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { closeJobQuickView, openJobQuickView, selection } = useJobQuickView();
  const totalCount = jobs[0]?.total_count ?? 0;
  const hasNextPage = page * 20 < totalCount;
  const hasPreviousPage = page > 1;
  const occupationOptions = useMemo<OccupationFilterOption[]>(
    () =>
      occupationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        subtitle: suggestion.categoryLabel,
        title: suggestion.label,
      })),
    [occupationSuggestions]
  );
  const locationOptions = useMemo<LocationFilterOption[]>(
    () =>
      locationSuggestions.map((suggestion) => ({
        id: suggestion.id,
        suggestion,
        title: suggestion.label,
      })),
    [locationSuggestions]
  );

  const searchInput = useMemo(
    () => ({
      employmentType: readParam(params.employmentType) || null,
      latitude: parseOptionalNumber(readParam(params.lat)),
      locationId: readParam(params.locationId) || null,
      longitude: parseOptionalNumber(readParam(params.lng)),
      occupationId: readParam(params.occupationId) || null,
      occupationSlug: readParam(params.occupationId)
        ? null
        : normalizeSlugParam(readParam(params.occupation) || readParam(params.search)),
      page,
      salaryMin: parseOptionalNumber(readParam(params.salaryMin)),
    }),
    [
      page,
      params.employmentType,
      params.lat,
      params.lng,
      params.locationId,
      params.occupation,
      params.occupationId,
      params.salaryMin,
      params.search,
    ]
  );

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError("");

      searchJobs(searchInput)
        .then((results) => {
          if (mounted) {
            setJobs(results);
          }
        })
        .catch((nextError) => {
          if (mounted) {
            setJobs([]);
            setError(readError(nextError));
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    }, 0);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    const trimmedOccupation = occupation.trim();
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
  }, [language, occupation]);

  useEffect(() => {
    const trimmedLocation = location.trim();
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
  }, [location]);

  function handleOccupationTextChange(text: string) {
    setOccupation(text);

    if (
      selectedOccupation &&
      text !== selectedOccupation.label &&
      text !== selectedOccupation.slug
    ) {
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

  function handleOccupationSelect(option: OccupationFilterOption) {
    setSelectedOccupation({
      id: option.suggestion.id,
      label: option.suggestion.label,
      slug: option.suggestion.slug,
    });
    setOccupation(option.suggestion.label);
    setOccupationOpen(false);
    setOccupationActiveIndex(-1);
  }

  function handleLocationTextChange(text: string) {
    setLocation(text);

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

  function handleLocationSelect(option: LocationFilterOption) {
    setSelectedLocation({
      id: option.suggestion.id,
      label: option.suggestion.label,
      latitude: option.suggestion.latitude,
      longitude: option.suggestion.longitude,
    });
    setLocation(option.suggestion.label);
    setLocationOpen(false);
    setLocationActiveIndex(-1);
  }

  function submitFilters(nextPage = 1) {
    const query = new URLSearchParams();
    const trimmedOccupation = occupation.trim();
    const trimmedLocation = location.trim();
    const occupationMatchesSelection =
      selectedOccupation &&
      (trimmedOccupation === selectedOccupation.label ||
        trimmedOccupation === selectedOccupation.slug);
    const locationMatchesSelection =
      selectedLocation && trimmedLocation === selectedLocation.label;

    addQueryParam(
      query,
      "occupation",
      occupationMatchesSelection
        ? selectedOccupation.slug
        : trimmedOccupation
    );
    addQueryParam(
      query,
      "occupationId",
      occupationMatchesSelection ? selectedOccupation.id : ""
    );
    addQueryParam(query, "location", location.trim());
    addQueryParam(
      query,
      "locationId",
      locationMatchesSelection ? selectedLocation.id : ""
    );
    addQueryParam(
      query,
      "lat",
      locationMatchesSelection && selectedLocation.latitude !== null
        ? String(selectedLocation.latitude)
        : ""
    );
    addQueryParam(
      query,
      "lng",
      locationMatchesSelection && selectedLocation.longitude !== null
        ? String(selectedLocation.longitude)
        : ""
    );
    addQueryParam(query, "employmentType", employmentType);
    addQueryParam(query, "salaryMin", salaryMin.trim());
    addQueryParam(query, "page", nextPage > 1 ? String(nextPage) : "");

    const queryString = query.toString();
    router.replace(`/jobs${queryString ? `?${queryString}` : ""}` as any);
  }

  return (
    <PageContainer maxWidth="none" padded={false} safeArea={false}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: responsive.contentMaxWidth,
            paddingHorizontal: responsive.horizontalPadding,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!selection}
        showsVerticalScrollIndicator={false}
      >
        {!authLoading && !isAuthenticated ? <PublicHeader active="jobs" /> : null}

        <PageHeader
          description={t("jobs.subtitle")}
          eyebrow={t("jobs.eyebrow")}
          style={styles.pageHeader}
          title={t("jobs.title")}
          titleSize="hero"
        />

        <RabAICard padding="lg" title={t("jobs.filterTitle")} variant="outlined">
          <View
            style={[
              styles.filterGrid,
              responsive.isMobile && styles.filterGridMobile,
            ]}
          >
            <View
              style={[
                styles.inputWrap,
                styles.occupationAutocompleteWrap,
                { flexBasis: responsive.isMobile ? "100%" : 240 },
              ]}
            >
              <HeroAutocompleteField
                activeIndex={occupationActiveIndex}
                emptyMessage="Nu am gasit rezultate"
                errorMessage={occupationError}
                fieldId="jobs-filter-occupation"
                isOpen={occupationOpen && occupation.trim().length >= 2}
                label="Ocupatie"
                loading={occupationLoading}
                onActiveIndexChange={setOccupationActiveIndex}
                onChangeText={handleOccupationTextChange}
                onFocus={() => {
                  if (occupation.trim().length >= 2) {
                    setOccupationOpen(true);
                  }
                }}
                onRequestClose={() => {
                  setOccupationOpen(false);
                }}
                onSelect={handleOccupationSelect}
                placeholder={t("jobs.search.whatPlaceholder")}
                queryText={occupation}
                suggestions={occupationOptions}
                value={occupation}
              />
            </View>
            <View
              style={[
                styles.inputWrap,
                styles.locationAutocompleteWrap,
                { flexBasis: responsive.isMobile ? "100%" : 240 },
              ]}
            >
              <HeroAutocompleteField
                activeIndex={locationActiveIndex}
                emptyMessage="Nu am gasit rezultate"
                errorMessage={locationError}
                fieldId="jobs-filter-location"
                isOpen={locationOpen && location.trim().length >= 2}
                label="Locatie"
                loading={locationLoading}
                onActiveIndexChange={setLocationActiveIndex}
                onChangeText={handleLocationTextChange}
                onFocus={() => {
                  if (location.trim().length >= 2) {
                    setLocationOpen(true);
                  }
                }}
                onRequestClose={() => {
                  setLocationOpen(false);
                }}
                onSelect={handleLocationSelect}
                placeholder={t("jobs.search.locationPlaceholder")}
                queryText={location}
                suggestions={locationOptions}
                value={location}
              />
            </View>
            <View
              style={[
                styles.inputWrap,
                { flexBasis: responsive.isMobile ? "100%" : 220 },
              ]}
            >
              <RabAIInput
                keyboardType="numeric"
                label="Salariu minim"
                onChangeText={setSalaryMin}
                placeholder="ex: 2000"
                value={salaryMin}
              />
            </View>
          </View>

          <View
            accessibilityLabel="Tipul angajării"
            accessibilityRole="radiogroup"
            style={styles.chipRow}
          >
            {employmentTypeOptions.map((option) => {
              const active = employmentType === option.value;

              return (
                <RabAIButton
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  key={option.value || "all"}
                  onPress={() => {
                    setEmploymentType(option.value);
                  }}
                  size="sm"
                  title={option.label}
                  variant={active ? "secondary" : "outline"}
                />
              );
            })}
          </View>

          <RabAIButton
            fullWidth={responsive.isMobile}
            onPress={() => submitFilters(1)}
            style={styles.searchButton}
            title={t("jobs.search.button")}
          />
        </RabAICard>

        {loading ? (
          <LoadingState title="Se încarcă joburile..." />
        ) : error ? (
          <ErrorState
            description={error}
            title="Joburile nu au putut fi încărcate"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            actionLabel={t("jobs.backToRabai")}
            description="Poti modifica filtrele sau reveni mai tarziu."
            onAction={() => router.replace(homeRoute as any)}
            title="Momentan nu exista joburi care corespund cautarii."
          />
        ) : (
          <RabAICard padding="lg" variant="outlined">
            <View
              style={[
                styles.resultsHeader,
                responsive.isMobile && styles.resultsHeaderMobile,
              ]}
            >
              <Text style={styles.resultsTitle}>Joburi gasite</Text>
              <Text style={styles.resultsCount}>{totalCount} rezultate</Text>
            </View>

            {jobs.map((job) => (
              <JobSummaryCard
                key={job.job_id}
                job={job}
                language={language}
                onAction={(selectedJob, action) =>
                  openJobQuickView(selectedJob, action, jobsReturnPath)
                }
                returnLabel="Înapoi la joburi"
              />
            ))}

            <View style={styles.paginationRow}>
              <RabAIButton
                disabled={!hasPreviousPage}
                onPress={() => submitFilters(page - 1)}
                size="sm"
                title="Inapoi"
                variant="outline"
              />
              <Text style={styles.pageText}>Pagina {page}</Text>
              <RabAIButton
                disabled={!hasNextPage}
                onPress={() => submitFilters(page + 1)}
                size="sm"
                title="Urmatoarea"
                variant="outline"
              />
            </View>
          </RabAICard>
        )}
      </ScrollView>
      <JobQuickView onClose={closeJobQuickView} selection={selection} />
    </PageContainer>
  );
}

function readParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseIntegerParam(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(readParam(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSlugParam(value: string) {
  const trimmed = value.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : null;
}

function addQueryParam(query: URLSearchParams, key: string, value: string) {
  if (value.trim()) {
    query.set(key, value.trim());
  }
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca joburile.";
}

const styles = StyleSheet.create({
  content: {
    alignSelf: "center",
    gap: Spacing.component,
    paddingBottom: Spacing.section,
    paddingTop: Spacing.section,
    width: "100%",
  },
  pageHeader: {
    marginBottom: 0,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.component,
  },
  filterGridMobile: {
    flexDirection: "column",
  },
  inputWrap: {
    flexBasis: 240,
    flexGrow: 1,
    minWidth: 0,
  },
  occupationAutocompleteWrap: {
    zIndex: Layers.dropdown + 1,
  },
  locationAutocompleteWrap: {
    zIndex: Layers.dropdown,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    marginTop: Spacing.component,
  },
  searchButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.component,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.component,
  },
  resultsHeaderMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: Spacing.compact,
  },
  resultsTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.bold,
  },
  resultsCount: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  paginationRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "center",
    marginTop: Spacing.component,
  },
  pageText: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
