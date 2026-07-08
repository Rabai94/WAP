import {
  getDefaultNationalIdentity,
  getNationalIdentityByCode,
} from "@/domain/nationality/nationalities";

export type EuropeanCountry = {
  name: string;
  code: string;
  dialCode: string;
  identityCode: string;
};

const countryCodes = [
  "DE",
  "RO",
  "AT",
  "FR",
  "IT",
  "ES",
  "PT",
  "NL",
  "BE",
  "DK",
  "SE",
  "NO",
  "FI",
  "PL",
  "CZ",
  "SK",
  "HU",
  "BG",
  "GR",
  "IE",
  "HR",
  "SI",
  "EE",
  "LV",
  "LT",
  "LU",
  "CH",
] as const;

export const europeanCountries: EuropeanCountry[] = countryCodes.map((code) => {
  const identity = getNationalIdentityByCode(code) ?? getDefaultNationalIdentity();

  return {
    name: identity.name,
    code: identity.code,
    dialCode: identity.dialCode ?? "",
    identityCode: identity.code,
  };
});
