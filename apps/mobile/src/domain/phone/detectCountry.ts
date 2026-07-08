import type { EuropeanCountry } from "./europeanCountries";

type NavigatorLike = {
  language?: unknown;
};

export function detectEuropeanCountryFromLocale(
  countries: readonly EuropeanCountry[]
) {
  const fallbackCountry = getFallbackCountry(countries);
  const locale = getDeviceLocale();
  const detectedCountryCode = getCountryCodeFromLocale(locale);

  if (!detectedCountryCode) {
    return fallbackCountry;
  }

  return (
    countries.find((country) => country.code === detectedCountryCode) ??
    fallbackCountry
  );
}

function getDeviceLocale() {
  const navigatorLanguage = getNavigatorLanguage();

  if (navigatorLanguage) {
    return navigatorLanguage;
  }

  const intlApi = (globalThis as { Intl?: typeof Intl }).Intl;

  if (intlApi?.DateTimeFormat) {
    return intlApi.DateTimeFormat().resolvedOptions().locale;
  }

  return undefined;
}

function getNavigatorLanguage() {
  const navigatorLike = (globalThis as { navigator?: NavigatorLike }).navigator;
  const language = navigatorLike?.language;

  return typeof language === "string" ? language : undefined;
}

function getCountryCodeFromLocale(locale?: string) {
  if (!locale) {
    return undefined;
  }

  const localeParts = locale.replace("_", "-").split("-");
  const countryCode = localeParts
    .slice(1)
    .find((part) => /^[a-zA-Z]{2}$/.test(part));

  return countryCode?.toUpperCase();
}

function getFallbackCountry(countries: readonly EuropeanCountry[]) {
  const germanCountry = countries.find((country) => country.code === "DE");

  if (germanCountry) {
    return germanCountry;
  }

  const [firstCountry] = countries;

  if (!firstCountry) {
    throw new Error("At least one European country is required.");
  }

  return firstCountry;
}
