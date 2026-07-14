import type { LanguageCode } from "@/i18n/translations";
import { supabase } from "@/infrastructure/auth/supabase/supabaseClient";

export type OccupationSuggestion = {
  id: string;
  slug: string;
  label: string;
  categoryLabel: string;
};

export type LocationSuggestion = {
  id: string;
  countryCode: string;
  postalCode: string;
  city: string;
  district: string | null;
  state: string;
  latitude: number | null;
  longitude: number | null;
  label: string;
};

type CategoryRow = {
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
};

type OccupationRow = {
  id: string;
  slug: string;
  name_ro: string;
  name_de: string;
  name_en: string;
  aliases: string[] | null;
  category: CategoryRow | CategoryRow[] | null;
};

type LocationRpcRow = {
  id: string;
  country_code: string;
  postal_code: string;
  city: string;
  district: string | null;
  state: string;
  display_name: string;
  latitude: number | null;
  longitude: number | null;
};

const MAX_OCCUPATION_ROWS = 120;

export async function searchOccupationSuggestions(
  searchText: string,
  language: LanguageCode,
  limit = 8
): Promise<OccupationSuggestion[]> {
  const query = normalizeInput(searchText);

  if (query.length < 2) {
    return [];
  }

  const safeLimit = Math.min(Math.max(limit, 1), 8);
  const ilikeQuery = query.replace(/[(),]/g, " ");
  const pattern = `%${ilikeQuery}%`;
  const selectQuery =
    "id, slug, name_ro, name_de, name_en, aliases, category:job_categories!inner(slug, name_ro, name_de, name_en)";

  const nameMatches = await supabase
    .from("occupations")
    .select(selectQuery)
    .eq("is_active", true)
    .eq("category.is_active", true)
    .or(
      `name_ro.ilike.${pattern},name_de.ilike.${pattern},name_en.ilike.${pattern}`
    )
    .limit(MAX_OCCUPATION_ROWS)
    .returns<OccupationRow[]>();

  if (nameMatches.error) {
    throw nameMatches.error;
  }

  const fallbackRows = await supabase
    .from("occupations")
    .select(selectQuery)
    .eq("is_active", true)
    .eq("category.is_active", true)
    .order("slug", { ascending: true })
    .limit(MAX_OCCUPATION_ROWS)
    .returns<OccupationRow[]>();

  if (fallbackRows.error) {
    throw fallbackRows.error;
  }

  const rowsById = new Map<string, OccupationRow>();

  for (const row of [...(nameMatches.data ?? []), ...(fallbackRows.data ?? [])]) {
    if (occupationScore(row, query, language) < Number.POSITIVE_INFINITY) {
      rowsById.set(row.id, row);
    }
  }

  return Array.from(rowsById.values())
    .sort((left, right) => {
      const leftScore = occupationScore(left, query, language);
      const rightScore = occupationScore(right, query, language);

      if (leftScore !== rightScore) {
        return leftScore - rightScore;
      }

      return localizedName(left, language).localeCompare(
        localizedName(right, language),
        language
      );
    })
    .slice(0, safeLimit)
    .map((row) => {
      const category = Array.isArray(row.category)
        ? row.category[0]
        : row.category;

      return {
        id: row.id,
        slug: row.slug,
        label: localizedName(row, language),
        categoryLabel: category ? localizedName(category, language) : "",
      };
    });
}

export async function searchLocationSuggestions(
  searchText: string,
  limit = 10
): Promise<LocationSuggestion[]> {
  const query = normalizeInput(searchText);

  if (query.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .rpc("autocomplete_locations", {
      country: "DE",
      result_limit: Math.min(Math.max(limit, 1), 10),
      search_text: query,
    });

  if (error) {
    throw error;
  }

  const suggestions = new Map<string, LocationSuggestion>();

  for (const row of ((data ?? []) as unknown as LocationRpcRow[])) {
    const label = formatLocationLabel(row);
    const key = [
      row.country_code,
      row.postal_code,
      row.display_name,
      row.state,
    ]
      .join("|")
      .toLocaleLowerCase("de-DE");

    if (!suggestions.has(key)) {
      suggestions.set(key, {
        id: row.id,
        countryCode: row.country_code,
        postalCode: row.postal_code,
        city: row.city,
        district: row.district,
        state: row.state,
        latitude: row.latitude,
        longitude: row.longitude,
        label,
      });
    }
  }

  return Array.from(suggestions.values()).slice(0, 10);
}

function formatLocationLabel(row: LocationRpcRow) {
  const place = row.postal_code
    ? `${row.postal_code} ${row.display_name}`
    : row.display_name;

  return row.state ? `${place}, ${row.state}` : place;
}

function occupationScore(
  row: OccupationRow,
  searchText: string,
  language: LanguageCode
) {
  const fields = [
    localizedName(row, language),
    row.name_ro,
    row.name_de,
    row.name_en,
    ...(row.aliases ?? []),
  ].map(normalizeForMatch);
  const needle = normalizeForMatch(searchText);

  if (fields.some((field) => field === needle)) {
    return 0;
  }

  if (fields.some((field) => field.startsWith(needle))) {
    return 1;
  }

  if (fields.some((field) => field.includes(needle))) {
    return 2;
  }

  return Number.POSITIVE_INFINITY;
}

function localizedName(
  row: Pick<OccupationRow, "name_ro" | "name_de" | "name_en">,
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

function normalizeInput(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-DE")
    .trim();
}
