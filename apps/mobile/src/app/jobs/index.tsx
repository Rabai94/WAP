import HeroAutocompleteField, {
  type HeroAutocompleteOption,
} from "@/components/home/HeroAutocompleteField";
import JobSummaryCard from "@/components/jobs/JobSummaryCard";
import JobQuickView from "@/components/jobs/quick-view/JobQuickView";
import { useJobQuickView } from "@/components/jobs/quick-view/useJobQuickView";
import PublicHeader from "@/components/navigation/PublicHeader";
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
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            maxWidth: responsive.contentMaxWidth,
            paddingHorizontal: responsive.horizontalPadding,
          },
        ]}
        scrollEnabled={!selection}
        showsVerticalScrollIndicator={false}
      >
        {!authLoading && !isAuthenticated ? <PublicHeader active="jobs" /> : null}

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{t("jobs.eyebrow")}</Text>
          <Text style={styles.heroTitle}>{t("jobs.title")}</Text>
          <Text style={styles.heroSubtitle}>{t("jobs.subtitle")}</Text>
        </View>

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>{t("jobs.filterTitle")}</Text>
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
              <Text style={styles.inputLabel}>Salariu minim</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={setSalaryMin}
                placeholder="ex: 2000"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                value={salaryMin}
              />
            </View>
          </View>

          <View style={styles.chipRow}>
            {employmentTypeOptions.map((option) => {
              const active = employmentType === option.value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={option.value || "all"}
                  onPress={() => {
                    setEmploymentType(option.value);
                  }}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
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

          <Pressable
            accessibilityRole="button"
            onPress={() => submitFilters(1)}
            style={[
              styles.searchButton,
              responsive.isMobile && styles.searchButtonMobile,
            ]}
          >
            <Text style={styles.searchButtonText}>{t("jobs.search.button")}</Text>
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
        ) : jobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Momentan nu exista joburi care corespund cautarii.
            </Text>
            <Text style={styles.emptyText}>
              Poti modifica filtrele sau reveni mai tarziu.
            </Text>
            <View style={styles.actionsRow}>
              <Pressable accessibilityRole="button" onPress={() => router.replace(homeRoute as any)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>{t("jobs.backToRabai")}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.resultsCard}>
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
      <JobQuickView onClose={closeJobQuickView} selection={selection} />
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
  screen: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  content: {
    alignSelf: "center",
    gap: Spacing.lg,
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
    color: "#145CFF",
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
  filterGridMobile: {
    flexDirection: "column",
  },
  inputWrap: {
    flexBasis: 240,
    flexGrow: 1,
  },
  occupationAutocompleteWrap: {
    zIndex: 30,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  filterChip: {
    backgroundColor: "#F7FAFF",
    borderColor: "#E6ECF7",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: "#EAF1FF",
    borderColor: "#145CFF",
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
  filterChipTextActive: {
    color: "#145CFF",
  },
  searchButton: {
    alignSelf: "flex-start",
    backgroundColor: "#6F5BFF",
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchButtonMobile: {
    alignSelf: "stretch",
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
  resultsHeaderMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: Spacing.xs,
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
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.cardTitleLarge,
    fontWeight: Typography.fontWeight.extraBold,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.body,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.extraBold,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  primaryButton: {
    backgroundColor: "#145CFF",
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.bold,
  },
});
