import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import CourseQuickView from "@/components/courses/quick-view/CourseQuickView";
import { useCourseEnrollmentMap } from "@/components/courses/quick-view/useCourseEnrollmentMap";
import { useCourseQuickView } from "@/components/courses/quick-view/useCourseQuickView";
import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
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
  buildCourseReturnPath,
} from "@/services/courses/courseNavigation";
import {
  fetchCourseCategories,
  searchCourses,
  type CourseCategory,
  type SearchCourseResult,
} from "@/services/courses/courseService";
import {
  searchLocationSuggestions,
  type LocationSuggestion,
} from "@/services/search/heroAutocomplete";
import { Colors, Layers, Spacing, Typography } from "@/theme";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const deliveryModeOptions = [
  { label: "Toate", value: "" },
  { label: "Online", value: "online" },
  { label: "La locatie", value: "onsite" },
  { label: "Hibrid", value: "hybrid" },
];

const languageOptions = [
  { label: "Toate", value: "" },
  { label: "Romana", value: "ro" },
  { label: "Germana", value: "de" },
  { label: "Engleza", value: "en" },
];

const levelOptions = [
  { label: "Toate", value: "" },
  { label: "Incepator", value: "beginner" },
  { label: "Intermediar", value: "intermediate" },
  { label: "Avansat", value: "advanced" },
  { label: "Toate nivelurile", value: "all_levels" },
];

type LocationFilterOption = HeroAutocompleteOption & {
  suggestion: LocationSuggestion;
};

type SelectedLocationFilter = {
  id: string;
  label: string;
};

type CoursesFilterSnapshot = {
  categoryId: string;
  deliveryMode: string;
  languageCode: string;
  level: string;
  location: string;
  maximumPrice: string;
  searchText: string;
  selectedLocation: SelectedLocationFilter | null;
};

export default function CoursesScreen() {
  const router = useRouter();
  const responsive = useResponsiveLayout();
  const params = useLocalSearchParams<{
    categoryId?: string | string[];
    deliveryMode?: string | string[];
    languageCode?: string | string[];
    level?: string | string[];
    location?: string | string[];
    locationId?: string | string[];
    maximumPrice?: string | string[];
    page?: string | string[];
    search?: string | string[];
  }>();
  const { language } = useLanguage();
  const { loading: authLoading, session, user } = useAuth();
  const isAuthenticated = Boolean(session);
  const enrollmentMap = useCourseEnrollmentMap(user?.id ?? null);
  const page = Math.max(parseIntegerParam(params.page, 1), 1);
  const coursesReturnPath = useMemo(
    () => buildCourseReturnPath("/courses", params),
    [params]
  );
  const routeFilterValues = useMemo(() => {
    const locationId = readParam(params.locationId);

    return {
      categoryId: readParam(params.categoryId),
      deliveryMode: readParam(params.deliveryMode),
      languageCode: readParam(params.languageCode),
      level: readParam(params.level),
      location: locationId ? readParam(params.location) : "",
      locationId,
      maximumPrice: readParam(params.maximumPrice),
      searchText: readParam(params.search),
    };
  },
    [
      params.categoryId,
      params.deliveryMode,
      params.languageCode,
      params.level,
      params.location,
      params.locationId,
      params.maximumPrice,
      params.search,
    ]);
  const routeFilterSignature = useMemo(
    () => JSON.stringify(routeFilterValues),
    [routeFilterValues]
  );
  const [searchText, setSearchText] = useState(routeFilterValues.searchText);
  const [categoryId, setCategoryId] = useState(routeFilterValues.categoryId);
  const [location, setLocation] = useState(routeFilterValues.location);
  const [deliveryMode, setDeliveryMode] = useState(
    routeFilterValues.deliveryMode
  );
  const [languageCode, setLanguageCode] = useState(
    routeFilterValues.languageCode
  );
  const [maximumPrice, setMaximumPrice] = useState(
    routeFilterValues.maximumPrice
  );
  const [level, setLevel] = useState(routeFilterValues.level);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationFilter | null>(
      routeFilterValues.locationId
        ? {
            id: routeFilterValues.locationId,
            label: routeFilterValues.location,
          }
        : null
    );
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationValidationError, setLocationValidationError] = useState<
    string | null
  >(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const locationRequestId = useRef(0);
  const [courses, setCourses] = useState<SearchCourseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const filterSnapshotRef = useRef<CoursesFilterSnapshot | null>(null);
  const syncedRouteFilterSignatureRef = useRef(routeFilterSignature);
  const {
    closeCourseQuickView,
    openCourseQuickView,
    selection: courseSelection,
  } = useCourseQuickView();
  const totalCount = courses[0]?.total_count ?? 0;
  const hasNextPage = page * 20 < totalCount;
  const hasPreviousPage = page > 1;
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
      categoryId: readParam(params.categoryId) || null,
      deliveryMode: readParam(params.deliveryMode) || null,
      languageCode: readParam(params.languageCode) || null,
      level: readParam(params.level) || null,
      locationId: readParam(params.locationId) || null,
      maximumPrice: parseOptionalNumber(readParam(params.maximumPrice)),
      page,
      pageSize: 20,
      searchText: readParam(params.search) || null,
    }),
    [
      page,
      params.categoryId,
      params.deliveryMode,
      params.languageCode,
      params.level,
      params.locationId,
      params.maximumPrice,
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
    locationRequestId.current += 1;
    setSearchText(routeFilterValues.searchText);
    setCategoryId(routeFilterValues.categoryId);
    setLocation(routeFilterValues.location);
    setDeliveryMode(routeFilterValues.deliveryMode);
    setLanguageCode(routeFilterValues.languageCode);
    setMaximumPrice(routeFilterValues.maximumPrice);
    setLevel(routeFilterValues.level);
    setSelectedLocation(
      routeFilterValues.locationId
        ? {
            id: routeFilterValues.locationId,
            label: routeFilterValues.location,
          }
        : null
    );
    setLocationSuggestions([]);
    setLocationError(null);
    setLocationValidationError(null);
    setLocationLoading(false);
    setLocationOpen(false);
    setLocationActiveIndex(-1);
  }, [filterSheetOpen, routeFilterSignature, routeFilterValues]);

  useEffect(() => {
    let mounted = true;

    fetchCourseCategories()
      .then((nextCategories) => {
        if (mounted) {
          setCategories(nextCategories);
          setCategoriesError("");
        }
      })
      .catch((nextError) => {
        if (mounted) {
          setCategories([]);
          setCategoriesError(readError(nextError));
        }
      });

    return () => {
      mounted = false;
    };
  }, [reloadAttempt]);

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError("");

      searchCourses(searchInput)
        .then((results) => {
          if (mounted) {
            setCourses(results);
          }
        })
        .catch((nextError) => {
          if (mounted) {
            setCourses([]);
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
    });
    setLocation(option.suggestion.label);
    setLocationValidationError(null);
    setLocationOpen(false);
    setLocationActiveIndex(-1);
  }

  function submitFilters(nextPage = 1) {
    const query = new URLSearchParams();
    const trimmedLocation = location.trim();
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

    addQueryParam(query, "search", searchText.trim());
    addQueryParam(query, "categoryId", categoryId);
    addQueryParam(query, "location", matchingLocation?.label ?? "");
    addQueryParam(
      query,
      "locationId",
      matchingLocation?.id ?? ""
    );
    addQueryParam(query, "deliveryMode", deliveryMode);
    addQueryParam(query, "languageCode", languageCode);
    addQueryParam(query, "maximumPrice", maximumPrice.trim());
    addQueryParam(query, "level", level);
    addQueryParam(query, "page", nextPage > 1 ? String(nextPage) : "");

    const queryString = query.toString();
    router.replace(
      `/courses${queryString ? `?${queryString}` : ""}` as Href
    );
    return true;
  }

  function clearFilters() {
    setSearchText("");
    setCategoryId("");
    setLocation("");
    setDeliveryMode("");
    setLanguageCode("");
    setMaximumPrice("");
    setLevel("");
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setLocationOpen(false);
    setLocationValidationError(null);
    router.replace("/courses" as Href);
  }

  function openFilterSheet() {
    filterSnapshotRef.current = {
      categoryId,
      deliveryMode,
      languageCode,
      level,
      location,
      maximumPrice,
      searchText,
      selectedLocation,
    };
    setFilterSheetOpen(true);
  }

  function closeFilterSheet() {
    const snapshot = filterSnapshotRef.current;

    if (snapshot) {
      locationRequestId.current += 1;
      setSearchText(snapshot.searchText);
      setCategoryId(snapshot.categoryId);
      setLocation(snapshot.location);
      setDeliveryMode(snapshot.deliveryMode);
      setLanguageCode(snapshot.languageCode);
      setMaximumPrice(snapshot.maximumPrice);
      setLevel(snapshot.level);
      setSelectedLocation(snapshot.selectedLocation);
      setLocationSuggestions([]);
      setLocationError(null);
      setLocationValidationError(null);
      setLocationLoading(false);
      setLocationOpen(false);
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
    searchText.trim(),
    categoryId,
    activeLocationId,
    deliveryMode,
    languageCode,
    maximumPrice.trim(),
    level,
  ].filter(Boolean).length;
  const primaryFilterFields = (
    <View
      style={[
        styles.filterGrid,
        usesFilterSheet && styles.filterGridMobile,
      ]}
    >
      <View style={styles.inputWrap}>
        <RabAIInput
          label="Căutare"
          onChangeText={setSearchText}
          placeholder="ex: germană, depozit, siguranță"
          value={searchText}
        />
      </View>
      <View style={[styles.inputWrap, styles.locationAutocompleteWrap]}>
        <HeroAutocompleteField
          activeIndex={locationActiveIndex}
          emptyMessage="Nu am găsit rezultate"
          errorMessage={locationValidationError ?? locationError}
          fieldId="courses-filter-location"
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
          placeholder="ex: Augsburg"
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
        label="Preț maxim"
        onChangeText={setMaximumPrice}
        placeholder="ex: 300"
        value={maximumPrice}
      />
      <FilterChips
        label="Categorie"
        onChange={setCategoryId}
        options={[
          { label: "Toate", value: "" },
          ...categories.map((category) => ({
            label: localizedCategory(category, language),
            value: category.id,
          })),
        ]}
        value={categoryId}
      />
      <FilterChips
        label="Mod de livrare"
        onChange={setDeliveryMode}
        options={deliveryModeOptions}
        value={deliveryMode}
      />
      <FilterChips
        label="Limba"
        onChange={setLanguageCode}
        options={languageOptions}
        value={languageCode}
      />
      <FilterChips
        label="Nivel"
        onChange={setLevel}
        options={levelOptions}
        value={level}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <PageContainer
        contentStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        maxWidth="content"
        scroll
        scrollEnabled={!courseSelection}
      >
        {!authLoading && !isAuthenticated ? <PublicHeader active="courses" /> : null}

      <PageHeader
        description="Caută programe active și formare relevantă pentru următorul pas profesional."
        eyebrow="Cursuri RabAI"
        style={styles.pageHeader}
        title="Cursuri pentru progres profesional"
      />

      {categoriesError ? (
        <ErrorState
          compact
          description={categoriesError}
          onRetry={() => setReloadAttempt((current) => current + 1)}
          style={styles.inlineState}
          title="Categoriile nu au putut fi încărcate"
        />
      ) : null}

      <FilterBar
        actions={
          !usesFilterSheet ? (
            <RabAIButton
              onPress={() => submitFilters(1)}
              size="sm"
              title="Caută cursuri"
            />
          ) : undefined
        }
        activeFilterCount={activeFilterCount}
        compact
        description="Caută după temă și locație; deschide opțiunile secundare numai când ai nevoie."
        onClearFilters={clearFilters}
        onOpenFilters={openFilterSheet}
        openFiltersLabel={usesFilterSheet ? "Filtrează cursurile" : "Filtre avansate"}
        title="Filtre cursuri"
      >
        {!usesFilterSheet ? primaryFilterFields : null}
      </FilterBar>

      {loading ? (
        <LoadingState title="Se încarcă cursurile..." />
      ) : error ? (
        <ErrorState
          description={error}
          onRetry={() => setReloadAttempt((current) => current + 1)}
          title="Cursurile nu au putut fi încărcate"
        />
      ) : courses.length === 0 ? (
        <EmptyState
          actionLabel={hasPreviousPage ? "Revino la prima pagină" : undefined}
          description={
            hasPreviousPage
              ? "Pagina cerută nu mai conține rezultate. Revino la începutul listei."
              : "Poți modifica filtrele sau reveni mai târziu."
          }
          onAction={hasPreviousPage ? () => submitFilters(1) : undefined}
          title="Momentan nu exista cursuri care corespund cautarii."
        />
      ) : (
          <Section
            description={`${totalCount} ${totalCount === 1 ? "rezultat" : "rezultate"}`}
            title="Cursuri găsite"
          >
            <View style={styles.resultsList}>
            {courses.map((course) => (
              <CourseSummaryCard
                course={course}
                enrollment={enrollmentMap.get(course.course_id)}
                key={course.course_id}
                language={language}
                onAction={(selectedCourse, action) =>
                  openCourseQuickView(
                    selectedCourse,
                    action,
                    coursesReturnPath
                  )
                }
                returnLabel="Înapoi la cursuri"
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
      </PageContainer>
      <FilterSheet
        applyLabel="Caută cursuri"
        onApply={applyFilterSheet}
        onClear={clearFilterSheet}
        onClose={closeFilterSheet}
        title="Filtre cursuri"
        visible={filterSheetOpen}
      >
        {usesFilterSheet ? primaryFilterFields : null}
        {advancedFilterFields}
      </FilterSheet>
      <CourseQuickView
        onClose={closeCourseQuickView}
        selection={courseSelection}
      />
    </View>
  );
}

function FilterChips({
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
    <View
      accessibilityLabel={label}
      accessibilityRole="radiogroup"
      style={styles.chipBlock}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const active = value === option.value;

          return (
            <RabAIButton
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              key={option.value || "all"}
              onPress={() => onChange(option.value)}
              size="sm"
              style={styles.filterChip}
              title={option.label}
              variant={active ? "secondary" : "outline"}
            />
          );
        })}
      </View>
    </View>
  );
}

function localizedCategory(category: CourseCategory, language: string) {
  if (language === "de") {
    return category.name_de;
  }

  if (language === "en") {
    return category.name_en;
  }

  return category.name_ro;
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

function addQueryParam(query: URLSearchParams, key: string, value: string) {
  if (value.trim()) {
    query.set(key, value.trim());
  }
}

function readError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nu am putut incarca cursurile.";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: Spacing.component,
  },
  pageHeader: {
    marginBottom: 0,
  },
  inlineState: {
    marginBottom: Spacing.component,
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
  locationAutocompleteWrap: {
    zIndex: Layers.dropdown,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.control,
  },
  chipBlock: {
    gap: Spacing.control,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  filterChip: {
    maxWidth: 260,
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
