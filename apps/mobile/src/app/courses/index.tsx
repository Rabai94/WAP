import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
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
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function CoursesScreen() {
  const router = useRouter();
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
  const { loading: authLoading, session } = useAuth();
  const isAuthenticated = Boolean(session);
  const page = Math.max(parseIntegerParam(params.page, 1), 1);
  const coursesReturnPath = useMemo(
    () => buildCourseReturnPath("/courses", params),
    [params]
  );
  const [searchText, setSearchText] = useState(readParam(params.search));
  const [categoryId, setCategoryId] = useState(readParam(params.categoryId));
  const [location, setLocation] = useState(readParam(params.location));
  const [deliveryMode, setDeliveryMode] = useState(
    readParam(params.deliveryMode)
  );
  const [languageCode, setLanguageCode] = useState(
    readParam(params.languageCode)
  );
  const [maximumPrice, setMaximumPrice] = useState(
    readParam(params.maximumPrice)
  );
  const [level, setLevel] = useState(readParam(params.level));
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationFilter | null>(
      readParam(params.locationId)
        ? {
            id: readParam(params.locationId),
            label: readParam(params.location),
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
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationActiveIndex, setLocationActiveIndex] = useState(-1);
  const locationRequestId = useRef(0);
  const [courses, setCourses] = useState<SearchCourseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    let mounted = true;

    fetchCourseCategories()
      .then((nextCategories) => {
        if (mounted) {
          setCategories(nextCategories);
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
  }, []);

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
  }, [searchInput]);

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
    setLocationOpen(false);
    setLocationActiveIndex(-1);
  }

  function submitFilters(nextPage = 1) {
    const query = new URLSearchParams();
    const trimmedLocation = location.trim();
    const locationMatchesSelection =
      selectedLocation && trimmedLocation === selectedLocation.label;

    addQueryParam(query, "search", searchText.trim());
    addQueryParam(query, "categoryId", categoryId);
    addQueryParam(query, "location", trimmedLocation);
    addQueryParam(
      query,
      "locationId",
      locationMatchesSelection ? selectedLocation.id : ""
    );
    addQueryParam(query, "deliveryMode", deliveryMode);
    addQueryParam(query, "languageCode", languageCode);
    addQueryParam(query, "maximumPrice", maximumPrice.trim());
    addQueryParam(query, "level", level);
    addQueryParam(query, "page", nextPage > 1 ? String(nextPage) : "");

    const queryString = query.toString();
    router.replace(`/courses${queryString ? `?${queryString}` : ""}` as any);
  }

  return (
    <PageContainer
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      maxWidth="content"
      scroll
    >
      {!authLoading && !isAuthenticated ? <PublicHeader active="courses" /> : null}

      <PageHeader
        description="Cauta programe active, furnizori verificati si certificari utile pentru munca in Germania."
        eyebrow="Cursuri RabAI"
        style={styles.pageHeader}
        title="Cursuri reale pentru urmatorul pas profesional."
        titleSize="hero"
      />

      <RabAICard padding="lg" title="Filtreaza cursurile" variant="outlined">
        {categoriesError ? (
          <ErrorState
            compact
            description={categoriesError}
            style={styles.inlineState}
            title="Categoriile nu au putut fi încărcate"
          />
        ) : null}

        <View style={styles.filterGrid}>
            <View style={styles.inputWrap}>
              <RabAIInput
                label="Cautare"
                onChangeText={setSearchText}
                placeholder="ex: germana, depozit, siguranta"
                value={searchText}
              />
            </View>

            <View style={[styles.inputWrap, styles.locationAutocompleteWrap]}>
              <HeroAutocompleteField
                activeIndex={locationActiveIndex}
                emptyMessage="Nu am gasit rezultate"
                errorMessage={locationError}
                fieldId="courses-filter-location"
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
                placeholder="ex: Augsburg"
                queryText={location}
                suggestions={locationOptions}
                value={location}
              />
            </View>

            <View style={styles.inputWrap}>
              <RabAIInput
                keyboardType="numeric"
                label="Pret maxim"
                onChangeText={setMaximumPrice}
                placeholder="ex: 300"
                value={maximumPrice}
              />
            </View>
        </View>

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

        <RabAIButton
          onPress={() => submitFilters(1)}
          style={styles.searchButton}
          title="Cauta cursuri"
        />
      </RabAICard>

      {loading ? (
        <LoadingState title="Se încarcă cursurile..." />
      ) : error ? (
        <ErrorState
          description={error}
          title="Cursurile nu au putut fi încărcate"
        />
      ) : courses.length === 0 ? (
        <EmptyState
          description="Poti modifica filtrele sau reveni mai tarziu."
          title="Momentan nu exista cursuri care corespund cautarii."
        />
      ) : (
          <RabAICard padding="lg" variant="outlined">
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Cursuri gasite</Text>
              <Text style={styles.resultsCount}>{totalCount} rezultate</Text>
            </View>

            {courses.map((course) => (
              <CourseSummaryCard
                course={course}
                key={course.course_id}
                language={language}
                returnLabel="Înapoi la cursuri"
                returnTo={coursesReturnPath}
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
    </PageContainer>
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
    marginTop: Spacing.component,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  filterChip: {
    maxWidth: 260,
  },
  searchButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.component,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "space-between",
    marginBottom: Spacing.component,
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
