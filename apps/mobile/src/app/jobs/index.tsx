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
  FilterBar,
  FilterSheet,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  RabAIInput,
  Section,
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
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
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

type JobsFilterSnapshot = {
  occupation: string;
  location: string;
  employmentType: string;
  salaryMin: string;
  selectedOccupation: SelectedOccupationFilter | null;
  selectedLocation: SelectedLocationFilter | null;
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
  const routeFilterValues = useMemo(() => {
    const locationId = readParam(params.locationId);

    return {
      employmentType: readParam(params.employmentType),
      latitude: parseOptionalNumber(readParam(params.lat)),
      location: locationId ? readParam(params.location) : "",
      locationId,
      longitude: parseOptionalNumber(readParam(params.lng)),
      occupation:
        readParam(params.occupation) || readParam(params.search),
      occupationId: readParam(params.occupationId),
      salaryMin: readParam(params.salaryMin),
    };
  },
    [
      params.employmentType,
      params.lat,
      params.lng,
      params.location,
      params.locationId,
      params.occupation,
      params.occupationId,
      params.salaryMin,
      params.search,
    ]);
  const routeFilterSignature = useMemo(
    () => JSON.stringify(routeFilterValues),
    [routeFilterValues]
  );
  const [occupation, setOccupation] = useState(routeFilterValues.occupation);
  const [location, setLocation] = useState(routeFilterValues.location);
  const [employmentType, setEmploymentType] = useState(
    routeFilterValues.employmentType
  );
  const [salaryMin, setSalaryMin] = useState(routeFilterValues.salaryMin);
  const [selectedOccupation, setSelectedOccupation] =
    useState<SelectedOccupationFilter | null>(
      routeFilterValues.occupationId
        ? {
            id: routeFilterValues.occupationId,
            label: routeFilterValues.occupation,
            slug:
              normalizeSlugParam(routeFilterValues.occupation) ??
              routeFilterValues.occupation,
          }
        : null
    );
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationFilter | null>(
      routeFilterValues.locationId
        ? {
            id: routeFilterValues.locationId,
            label: routeFilterValues.location,
            latitude: routeFilterValues.latitude,
            longitude: routeFilterValues.longitude,
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
  const [locationValidationError, setLocationValidationError] = useState<
    string | null
  >(null);
  const [occupationOpen, setOccupationOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [occupationActiveIndex, setOccupationActiveIndex] = useState(-1);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const occupationRequestId = useRef(0);
  const locationRequestId = useRef(0);
  const [jobs, setJobs] = useState<SearchJobResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const filterSnapshotRef = useRef<JobsFilterSnapshot | null>(null);
  const syncedRouteFilterSignatureRef = useRef(routeFilterSignature);
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
    if (
      filterSheetOpen ||
      syncedRouteFilterSignatureRef.current === routeFilterSignature
    ) {
      return;
    }

    syncedRouteFilterSignatureRef.current = routeFilterSignature;
    occupationRequestId.current += 1;
    locationRequestId.current += 1;
    setOccupation(routeFilterValues.occupation);
    setLocation(routeFilterValues.location);
    setEmploymentType(routeFilterValues.employmentType);
    setSalaryMin(routeFilterValues.salaryMin);
    setSelectedOccupation(
      routeFilterValues.occupationId
        ? {
            id: routeFilterValues.occupationId,
            label: routeFilterValues.occupation,
            slug:
              normalizeSlugParam(routeFilterValues.occupation) ??
              routeFilterValues.occupation,
          }
        : null
    );
    setSelectedLocation(
      routeFilterValues.locationId
        ? {
            id: routeFilterValues.locationId,
            label: routeFilterValues.location,
            latitude: routeFilterValues.latitude,
            longitude: routeFilterValues.longitude,
          }
        : null
    );
    setOccupationSuggestions([]);
    setLocationSuggestions([]);
    setOccupationError(null);
    setLocationError(null);
    setLocationValidationError(null);
    setOccupationLoading(false);
    setLocationLoading(false);
    setOccupationOpen(false);
    setLocationOpen(false);
    setOccupationActiveIndex(-1);
    setLocationActiveIndex(-1);
  }, [filterSheetOpen, routeFilterSignature, routeFilterValues]);

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
  }, [reloadAttempt, searchInput]);

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
    setLocationValidationError(null);

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
    setLocationValidationError(null);
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
    const matchingLocation =
      selectedLocation?.id && trimmedLocation === selectedLocation.label
        ? selectedLocation
        : null;

    if (trimmedLocation && !matchingLocation) {
      setLocationValidationError(
        "Selecteaz\u0103 o loca\u021bie din lista de sugestii."
      );
      setLocationOpen(true);
      return false;
    }

    setLocationValidationError(null);

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
    addQueryParam(query, "location", matchingLocation?.label ?? "");
    addQueryParam(
      query,
      "locationId",
      matchingLocation?.id ?? ""
    );
    addQueryParam(
      query,
      "lat",
      matchingLocation?.latitude !== null &&
        matchingLocation?.latitude !== undefined
        ? String(matchingLocation.latitude)
        : ""
    );
    addQueryParam(
      query,
      "lng",
      matchingLocation?.longitude !== null &&
        matchingLocation?.longitude !== undefined
        ? String(matchingLocation.longitude)
        : ""
    );
    addQueryParam(query, "employmentType", employmentType);
    addQueryParam(query, "salaryMin", salaryMin.trim());
    addQueryParam(query, "page", nextPage > 1 ? String(nextPage) : "");

    const queryString = query.toString();
    router.replace(`/jobs${queryString ? `?${queryString}` : ""}` as Href);
    return true;
  }

  function clearFilters() {
    setOccupation("");
    setLocation("");
    setEmploymentType("");
    setSalaryMin("");
    setSelectedOccupation(null);
    setSelectedLocation(null);
    setOccupationSuggestions([]);
    setLocationSuggestions([]);
    setOccupationOpen(false);
    setLocationOpen(false);
    setLocationValidationError(null);
    router.replace("/jobs");
  }

  function openFilterSheet() {
    filterSnapshotRef.current = {
      employmentType,
      location,
      occupation,
      salaryMin,
      selectedLocation,
      selectedOccupation,
    };
    setFilterSheetOpen(true);
  }

  function closeFilterSheet() {
    const snapshot = filterSnapshotRef.current;

    if (snapshot) {
      occupationRequestId.current += 1;
      locationRequestId.current += 1;
      setOccupation(snapshot.occupation);
      setLocation(snapshot.location);
      setEmploymentType(snapshot.employmentType);
      setSalaryMin(snapshot.salaryMin);
      setSelectedOccupation(snapshot.selectedOccupation);
      setSelectedLocation(snapshot.selectedLocation);
      setOccupationSuggestions([]);
      setLocationSuggestions([]);
      setOccupationError(null);
      setLocationError(null);
      setLocationValidationError(null);
      setOccupationLoading(false);
      setLocationLoading(false);
      setOccupationOpen(false);
      setLocationOpen(false);
      setOccupationActiveIndex(-1);
      setLocationActiveIndex(-1);
    }

    filterSnapshotRef.current = null;
    setFilterSheetOpen(false);
  }

  function applyFilterSheet() {
    if (!submitFilters(1)) {
      return;
    }

    filterSnapshotRef.current = null;
    setFilterSheetOpen(false);
  }

  function clearFilterSheet() {
    filterSnapshotRef.current = null;
    setFilterSheetOpen(false);
    clearFilters();
  }

  const usesFilterSheet = responsive.isMobile || responsive.isTablet;
  const activeLocationId =
    selectedLocation?.id && location.trim() === selectedLocation.label
      ? selectedLocation.id
      : "";
  const activeFilterCount = [
    occupation.trim(),
    activeLocationId,
    employmentType,
    salaryMin.trim(),
  ].filter(Boolean).length;
  const primaryFilterFields = (
    <View
      style={[
        styles.filterGrid,
        usesFilterSheet && styles.filterGridMobile,
      ]}
    >
      <View
        style={[
          styles.inputWrap,
          styles.occupationAutocompleteWrap,
          { flexBasis: usesFilterSheet ? "100%" : 260 },
        ]}
      >
        <HeroAutocompleteField
          activeIndex={occupationActiveIndex}
          emptyMessage="Nu am găsit rezultate"
          errorMessage={occupationError}
          fieldId="jobs-filter-occupation"
          isOpen={occupationOpen && occupation.trim().length >= 2}
          label="Ocupație"
          loading={occupationLoading}
          onActiveIndexChange={setOccupationActiveIndex}
          onChangeText={handleOccupationTextChange}
          onFocus={() => {
            if (occupation.trim().length >= 2) {
              setOccupationOpen(true);
            }
          }}
          onRequestClose={() => setOccupationOpen(false)}
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
          { flexBasis: usesFilterSheet ? "100%" : 260 },
        ]}
      >
        <HeroAutocompleteField
          activeIndex={locationActiveIndex}
          emptyMessage="Nu am găsit rezultate"
          errorMessage={locationValidationError ?? locationError}
          fieldId="jobs-filter-location"
          isOpen={locationOpen && location.trim().length >= 2}
          label="Locație"
          loading={locationLoading}
          onActiveIndexChange={setLocationActiveIndex}
          onChangeText={handleLocationTextChange}
          onFocus={() => {
            if (location.trim().length >= 2) {
              setLocationOpen(true);
            }
          }}
          onRequestClose={() => setLocationOpen(false)}
          onSelect={handleLocationSelect}
          placeholder={t("jobs.search.locationPlaceholder")}
          queryText={location}
          suggestions={locationOptions}
          value={location}
        />
      </View>
    </View>
  );
  const advancedFilterFields = (
    <View style={styles.advancedFilters}>
      <RabAIInput
        keyboardType="numeric"
        label="Salariu minim"
        onChangeText={setSalaryMin}
        placeholder="ex: 2000"
        value={salaryMin}
      />
      <View
        accessibilityLabel="Tipul angajării"
        accessibilityRole="radiogroup"
        style={styles.chipBlock}
      >
        <Text style={styles.filterLabel}>Tipul angajării</Text>
        <View style={styles.chipRow}>
          {employmentTypeOptions.map((option) => {
            const active = employmentType === option.value;

            return (
              <RabAIButton
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                key={option.value || "all"}
                onPress={() => setEmploymentType(option.value)}
                size="sm"
                title={option.label}
                variant={active ? "secondary" : "ghost"}
              />
            );
          })}
        </View>
      </View>
    </View>
  );

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
        />

        <FilterBar
          actions={
            !usesFilterSheet ? (
              <RabAIButton
                onPress={() => submitFilters(1)}
                size="sm"
                title={t("jobs.search.button")}
              />
            ) : undefined
          }
          activeFilterCount={activeFilterCount}
          compact
          description="Caută după ocupație și locație; păstrează opțiunile avansate într-un singur loc."
          onClearFilters={clearFilters}
          onOpenFilters={openFilterSheet}
          openFiltersLabel={usesFilterSheet ? "Filtrează joburile" : "Filtre avansate"}
          title={t("jobs.filterTitle")}
        >
          {!usesFilterSheet ? primaryFilterFields : null}
        </FilterBar>

        {loading ? (
          <LoadingState title="Se încarcă joburile..." />
        ) : error ? (
          <ErrorState
            description={error}
            onRetry={() => setReloadAttempt((current) => current + 1)}
            title="Joburile nu au putut fi încărcate"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            actionLabel={
              hasPreviousPage ? "Revino la prima pagină" : t("jobs.backToRabai")
            }
            description={
              hasPreviousPage
                ? "Pagina cerută nu mai conține rezultate. Revino la începutul listei."
                : "Poți modifica filtrele sau reveni mai târziu."
            }
            onAction={() =>
              hasPreviousPage ? submitFilters(1) : router.replace(homeRoute)
            }
            title="Momentan nu exista joburi care corespund cautarii."
          />
        ) : (
          <Section
            description={`${totalCount} ${totalCount === 1 ? "rezultat" : "rezultate"}`}
            title="Joburi găsite"
          >
            <View style={styles.resultsList}>
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
            </View>

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
          </Section>
        )}
      </ScrollView>
      <FilterSheet
        applyLabel={t("jobs.search.button")}
        onApply={applyFilterSheet}
        onClear={clearFilterSheet}
        onClose={closeFilterSheet}
        title="Filtre joburi"
        visible={filterSheetOpen}
      >
        {usesFilterSheet ? primaryFilterFields : null}
        {advancedFilterFields}
      </FilterSheet>
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
  advancedFilters: {
    gap: Spacing.component,
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
  },
  chipBlock: {
    gap: Spacing.control,
  },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.supporting,
    fontWeight: Typography.fontWeight.semibold,
  },
  resultsList: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
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
