import CourseSummaryCard from "@/components/courses/CourseSummaryCard";
import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import AuthenticatedHeader from "@/components/navigation/AuthenticatedHeader";
import PublicHeader from "@/components/navigation/PublicHeader";
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
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
  const { session } = useAuth();
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
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isAuthenticated ? (
          <AuthenticatedHeader active="courses" />
        ) : (
          <PublicHeader active="courses" />
        )}

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Cursuri RabAI</Text>
          <Text style={styles.heroTitle}>Cursuri reale pentru urmatorul pas profesional.</Text>
          <Text style={styles.heroSubtitle}>
            Cauta programe active, furnizori verificati si certificari utile pentru munca in Germania.
          </Text>
        </View>

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filtreaza cursurile</Text>
          {categoriesError ? (
            <Text style={styles.inlineErrorText}>{categoriesError}</Text>
          ) : null}

          <View style={styles.filterGrid}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Cautare</Text>
              <TextInput
                onChangeText={setSearchText}
                placeholder="ex: germana, depozit, siguranta"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
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
              <Text style={styles.inputLabel}>Pret maxim</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={setMaximumPrice}
                placeholder="ex: 300"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
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

          <Pressable accessibilityRole="button" onPress={() => submitFilters(1)} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Cauta cursuri</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.resultsCard}>
            <LoadingSkeleton />
          </View>
        ) : error ? (
          <View style={styles.resultsCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Momentan nu exista cursuri care corespund cautarii.
            </Text>
            <Text style={styles.emptyText}>
              Poti modifica filtrele sau reveni mai tarziu.
            </Text>
          </View>
        ) : (
          <View style={styles.resultsCard}>
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
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasPreviousPage }}
                disabled={!hasPreviousPage}
                onPress={() => submitFilters(page - 1)}
                style={[
                  styles.pageButton,
                  !hasPreviousPage && styles.pageButtonDisabled,
                ]}
              >
                <Text style={styles.pageButtonText}>Inapoi</Text>
              </Pressable>
              <Text style={styles.pageText}>Pagina {page}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasNextPage }}
                disabled={!hasNextPage}
                onPress={() => submitFilters(page + 1)}
                style={[
                  styles.pageButton,
                  !hasNextPage && styles.pageButtonDisabled,
                ]}
              >
                <Text style={styles.pageButtonText}>Urmatoarea</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
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
    <View style={styles.chipBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const active = value === option.value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option.value || "all"}
              onPress={() => onChange(option.value)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
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

function LoadingSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonLineLarge} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </>
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
    backgroundColor: "#F5F8FF",
  },
  content: {
    alignSelf: "center",
    gap: Spacing.lg,
    maxWidth: 1080,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    width: "100%",
  },
  publicHeader: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  publicLink: {
    paddingVertical: Spacing.sm,
  },
  publicLinkText: {
    color: "#145CFF",
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  publicPrimaryButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  publicPrimaryButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  publicSecondaryButton: {
    backgroundColor: "#F3F7FF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  publicSecondaryButtonText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  heroEyebrow: {
    color: "#6E1DFF",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: Colors.text,
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.extraBold,
  },
  heroSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  filterTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  inputWrap: {
    flexBasis: 240,
    flexGrow: 1,
  },
  locationAutocompleteWrap: {
    zIndex: 20,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7FAFF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipBlock: {
    marginTop: Spacing.md,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  filterChip: {
    backgroundColor: "#F7FAFF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.round,
    borderWidth: 1,
    maxWidth: 260,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: "#F1E9FF",
    borderColor: "#6E1DFF",
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  filterChipTextActive: {
    color: "#5D37EA",
  },
  searchButton: {
    alignSelf: "flex-start",
    backgroundColor: "#6E1DFF",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  resultsCard: {
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  resultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  resultsCount: {
    color: Colors.textMuted,
    fontSize: Typography.body,
  },
  paginationRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  pageButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  pageText: {
    color: Colors.text,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  skeletonCard: {
    borderColor: "#E6ECF7",
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  skeletonLineLarge: {
    backgroundColor: "#E6ECF7",
    borderRadius: Radius.round,
    height: 18,
    marginBottom: Spacing.md,
    width: "60%",
  },
  skeletonLine: {
    backgroundColor: "#EEF3FA",
    borderRadius: Radius.round,
    height: 14,
    marginBottom: Spacing.sm,
    width: "82%",
  },
  skeletonLineShort: {
    backgroundColor: "#EEF3FA",
    borderRadius: Radius.round,
    height: 14,
    width: "42%",
  },
  emptyCard: {
    alignItems: "flex-start",
    backgroundColor: Colors.white,
    borderColor: "#E6ECF7",
    borderRadius: Radius.xxl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  inlineErrorText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
});
