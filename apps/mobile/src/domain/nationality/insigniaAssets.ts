import type { ImageSourcePropType } from "react-native";

export const expectedInsigniaAssetCodes = [
  "RO",
  "DE",
  "EN",
  "FR",
  "CH",
  "AT",
  "IT",
  "ES",
  "NL",
  "BE",
] as const;

export type InsigniaAssetCode = (typeof expectedInsigniaAssetCodes)[number];

// Add static requires here only after the corresponding PNG files exist.
// Example: RO: require("@/assets/insignias/ro.png")
export const insigniaAssets: Partial<
  Record<InsigniaAssetCode, ImageSourcePropType>
> = {};

export function getInsigniaAsset(code: string) {
  const normalizedCode = normalizeInsigniaAssetCode(code);

  if (!isExpectedInsigniaAssetCode(normalizedCode)) {
    return undefined;
  }

  return insigniaAssets[normalizedCode];
}

export function getExistingInsigniaAssetCodes() {
  return expectedInsigniaAssetCodes.filter((code) => Boolean(insigniaAssets[code]));
}

export function getMissingInsigniaAssetCodes() {
  return expectedInsigniaAssetCodes.filter((code) => !insigniaAssets[code]);
}

function normalizeInsigniaAssetCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode === "GB") {
    return "EN";
  }

  return normalizedCode;
}

function isExpectedInsigniaAssetCode(
  code: string
): code is InsigniaAssetCode {
  return expectedInsigniaAssetCodes.includes(code as InsigniaAssetCode);
}
