export type NationalIdentity = {
  code: string;
  name: string;
  dialCode?: string;
};

export const nationalIdentities: NationalIdentity[] = [
  { code: "RO", name: "România", dialCode: "+40" },
  { code: "DE", name: "Germania", dialCode: "+49" },
  { code: "EN", name: "English", dialCode: "+44" },
  { code: "FR", name: "Franța", dialCode: "+33" },
  { code: "CH", name: "Elveția", dialCode: "+41" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "IT", name: "Italia", dialCode: "+39" },
  { code: "ES", name: "Spania", dialCode: "+34" },
  { code: "NL", name: "Olanda", dialCode: "+31" },
  { code: "BE", name: "Belgia", dialCode: "+32" },
  { code: "PT", name: "Portugalia", dialCode: "+351" },
  { code: "DK", name: "Danemarca", dialCode: "+45" },
  { code: "SE", name: "Suedia", dialCode: "+46" },
  { code: "NO", name: "Norvegia", dialCode: "+47" },
  { code: "FI", name: "Finlanda", dialCode: "+358" },
  { code: "PL", name: "Polonia", dialCode: "+48" },
  { code: "CZ", name: "Cehia", dialCode: "+420" },
  { code: "SK", name: "Slovacia", dialCode: "+421" },
  { code: "HU", name: "Ungaria", dialCode: "+36" },
  { code: "BG", name: "Bulgaria", dialCode: "+359" },
  { code: "GR", name: "Grecia", dialCode: "+30" },
  { code: "IE", name: "Irlanda", dialCode: "+353" },
  { code: "HR", name: "Croația", dialCode: "+385" },
  { code: "SI", name: "Slovenia", dialCode: "+386" },
  { code: "EE", name: "Estonia", dialCode: "+372" },
  { code: "LV", name: "Letonia", dialCode: "+371" },
  { code: "LT", name: "Lituania", dialCode: "+370" },
  { code: "LU", name: "Luxemburg", dialCode: "+352" },
];

export function getNationalIdentityByCode(code: string) {
  const normalizedCode = normalizeIdentityCode(code);
  return nationalIdentities.find((identity) => identity.code === normalizedCode);
}

export function getLanguageNationalIdentity(code: string) {
  return getNationalIdentityByCode(normalizeIdentityCode(code)) ?? getDefaultNationalIdentity();
}

export function getDefaultNationalIdentity(): NationalIdentity {
  const germanIdentity = nationalIdentities.find(
    (identity) => identity.code === "DE"
  );

  if (germanIdentity) {
    return germanIdentity;
  }

  const [firstIdentity] = nationalIdentities;

  if (!firstIdentity) {
    throw new Error("At least one national identity is required.");
  }

  return firstIdentity;
}

function normalizeIdentityCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode === "GB") {
    return "EN";
  }

  return normalizedCode;
}
