import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { inflateRawSync } from "node:zlib";

type ZipEntry = {
  data: Buffer;
  name: string;
};

type LocationRow = {
  country_code: "DE";
  postal_code: string;
  city: string;
  district: string | null;
  state: string;
  latitude: number | null;
  longitude: number | null;
  is_active: true;
  source: "geonames";
};

type ImportStats = {
  countryDumpRowsRead: number;
  populatedPlacesRead: number;
  postalRowsRead: number;
  validRows: number;
  duplicateRows: number;
  rejectedRows: number;
  importableRows: number;
  rejectedReasons: Record<string, number>;
};

const GEONAMES_DUMP_URL = "https://download.geonames.org/export/dump/DE.zip";
const GEONAMES_POSTAL_URL = "https://download.geonames.org/export/zip/DE.zip";
const DEFAULT_CACHE_DIR = ".cache/geonames";
const DEFAULT_BATCH_SIZE = 500;

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const dryRun = args.has("--dry-run");
const sqlOutputPath = readOptionValue("--sql-output");

loadEnvFile(path.resolve(".env"));
loadEnvFile(path.resolve("apps/mobile/.env"));

async function main() {
  const cacheDir = process.env.GEONAMES_CACHE_DIR || DEFAULT_CACHE_DIR;
  const batchSize = parsePositiveInt(
    process.env.LOCATIONS_IMPORT_BATCH_SIZE,
    DEFAULT_BATCH_SIZE
  );

  const dumpZipPath = await resolveZipPath({
    cacheDir,
    envPath: process.env.GEONAMES_DE_DUMP_ZIP,
    fallbackFileName: "DE-country-dump.zip",
    url: GEONAMES_DUMP_URL,
  });
  const postalZipPath = await resolveZipPath({
    cacheDir,
    envPath: process.env.GEONAMES_DE_POSTAL_ZIP,
    fallbackFileName: "DE-postal-codes.zip",
    url: GEONAMES_POSTAL_URL,
  });

  const dumpText = await readFirstTextFileFromZip(dumpZipPath);
  const postalText = await readFirstTextFileFromZip(postalZipPath);
  const populatedPlaces = parseCountryDump(dumpText);
  const { rows, stats } = buildLocationRows(postalText, populatedPlaces);

  printStats(stats);

  if (dryRun) {
    console.log("Dry run enabled. No rows were written.");
    return;
  }

  if (sqlOutputPath) {
    const outputPath = path.resolve(sqlOutputPath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, buildLocationsSql(rows, batchSize));
    console.log(`SQL import file written: ${outputPath}`);
    console.log(`Rows prepared for SQL import: ${rows.length}`);
    return;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || requireEnv("EXPO_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  await upsertLocations({
    batchSize,
    rows,
    serviceRoleKey,
    supabaseUrl,
  });

  const total = await countImportedLocations({ serviceRoleKey, supabaseUrl });
  console.log(`Total active DE locations in Supabase: ${total}`);

  for (const term of ["Augsburg", "München", "Berlin", "86150", "Frankfurt"]) {
    const results = await autocompleteLocation({
      searchText: term,
      serviceRoleKey,
      supabaseUrl,
    });
    const preview = results
      .slice(0, 5)
      .map((result) => result.display_name || result.city)
      .join(", ");
    console.log(`Autocomplete "${term}": ${results.length} result(s)${preview ? ` - ${preview}` : ""}`);
  }
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function resolveZipPath({
  cacheDir,
  envPath,
  fallbackFileName,
  url,
}: {
  cacheDir: string;
  envPath?: string;
  fallbackFileName: string;
  url: string;
}) {
  if (envPath) {
    const absolutePath = path.resolve(envPath);
    await assertReadableFile(absolutePath);
    return absolutePath;
  }

  await mkdir(cacheDir, { recursive: true });
  const zipPath = path.resolve(cacheDir, fallbackFileName);

  if (existsSync(zipPath)) {
    await assertReadableFile(zipPath);
    return zipPath;
  }

  console.log(`Downloading ${url}`);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "RabAI location importer (GeoNames public export)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(zipPath, bytes);
  return zipPath;
}

async function assertReadableFile(filePath: string) {
  const fileStat = await stat(filePath);

  if (!fileStat.isFile()) {
    throw new Error(`Expected a file: ${filePath}`);
  }
}

async function readFirstTextFileFromZip(zipPath: string) {
  const zipBuffer = await readFile(zipPath);
  const entries = readZipEntries(zipBuffer);
  const textEntry =
    entries.find((entry) => {
      const fileName = entry.name.split(/[\\/]/).pop()?.toLowerCase();
      return fileName === "de.txt";
    }) ||
    entries
      .filter((entry) => entry.name.toLowerCase().endsWith(".txt"))
      .sort((left, right) => right.data.length - left.data.length)[0];

  if (!textEntry) {
    throw new Error(`No .txt file found in ${zipPath}`);
  }

  return textEntry.data.toString("utf8");
}

function readZipEntries(buffer: Buffer): ZipEntry[] {
  const endOfCentralDirectory = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(endOfCentralDirectory + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(endOfCentralDirectory + 16);
  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Invalid ZIP central directory.");
    }

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer
      .subarray(offset + 46, offset + 46 + fileNameLength)
      .toString("utf8");
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);

    let data: Buffer;

    if (compressionMethod === 0) {
      data = compressed;
    } else if (compressionMethod === 8) {
      data = inflateRawSync(compressed);
    } else {
      throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${name}`);
    }

    entries.push({ data, name });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(buffer: Buffer) {
  const minimumOffset = Math.max(0, buffer.length - 65557);

  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("Invalid ZIP file: end of central directory not found.");
}

function parseCountryDump(text: string) {
  const populatedPlaces = new Set<string>();
  let rowsRead = 0;
  let populatedRows = 0;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    rowsRead += 1;
    const columns = line.split("\t");
    const name = normalizeText(columns[1]);
    const asciiName = normalizeText(columns[2]);
    const featureClass = columns[6];

    if (featureClass !== "P") {
      continue;
    }

    populatedRows += 1;

    for (const candidate of [name, asciiName]) {
      if (candidate) {
        populatedPlaces.add(normalizeKey(candidate));
      }
    }
  }

  return {
    populatedPlaces,
    populatedRows,
    rowsRead,
  };
}

function buildLocationRows(
  postalText: string,
  countryDump: ReturnType<typeof parseCountryDump>
) {
  const stats: ImportStats = {
    countryDumpRowsRead: countryDump.rowsRead,
    populatedPlacesRead: countryDump.populatedRows,
    postalRowsRead: 0,
    validRows: 0,
    duplicateRows: 0,
    rejectedRows: 0,
    importableRows: 0,
    rejectedReasons: {},
  };
  const rowsByKey = new Map<string, LocationRow>();

  for (const line of postalText.split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }

    stats.postalRowsRead += 1;
    const columns = line.split("\t");
    const countryCode = normalizeText(columns[0]).toUpperCase();
    const postalCode = normalizeText(columns[1]);
    const placeName = normalizeText(columns[2]);
    const state = normalizeText(columns[3]);
    const latitude = parseCoordinate(columns[9]);
    const longitude = parseCoordinate(columns[10]);

    if (countryCode !== "DE") {
      reject(stats, "non_de_country");
      continue;
    }

    if (!postalCode || !placeName || !state) {
      reject(stats, "missing_required_text");
      continue;
    }

    if (latitude === null || longitude === null) {
      reject(stats, "missing_coordinates");
      continue;
    }

    const { city, district } = splitCityAndDistrict(placeName);
    const row: LocationRow = {
      country_code: "DE",
      postal_code: postalCode,
      city,
      district,
      state,
      latitude,
      longitude,
      is_active: true,
      source: "geonames",
    };
    const key = locationKey(row);

    stats.validRows += 1;

    if (rowsByKey.has(key)) {
      stats.duplicateRows += 1;
      continue;
    }

    rowsByKey.set(key, row);
  }

  stats.importableRows = rowsByKey.size;

  return {
    rows: [...rowsByKey.values()],
    stats,
  };
}

function splitCityAndDistrict(placeName: string) {
  const hyphenParts = placeName.split(/\s+-\s+|-/).map((part) => normalizeText(part));

  if (hyphenParts.length >= 2 && hyphenParts[0] && hyphenParts.slice(1).join("-")) {
    return {
      city: hyphenParts[0],
      district: hyphenParts.slice(1).join("-"),
    };
  }

  return {
    city: placeName,
    district: null,
  };
}

function normalizeText(value: string | undefined) {
  return (value || "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value: string) {
  return normalizeText(value).toLocaleLowerCase("de-DE");
}

function parseCoordinate(value: string | undefined) {
  const coordinate = Number.parseFloat(value || "");

  if (!Number.isFinite(coordinate)) {
    return null;
  }

  return Number(coordinate.toFixed(6));
}

function locationKey(row: LocationRow) {
  return [
    row.country_code,
    row.postal_code,
    normalizeKey(row.city),
    normalizeKey(row.district || ""),
    normalizeKey(row.state),
  ].join("|");
}

function reject(stats: ImportStats, reason: string) {
  stats.rejectedRows += 1;
  stats.rejectedReasons[reason] = (stats.rejectedReasons[reason] || 0) + 1;
}

async function upsertLocations({
  batchSize,
  rows,
  serviceRoleKey,
  supabaseUrl,
}: {
  batchSize: number;
  rows: LocationRow[];
  serviceRoleKey: string;
  supabaseUrl: string;
}) {
  let imported = 0;

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const response = await supabaseFetch({
      body: JSON.stringify(batch),
      method: "POST",
      path: "/rest/v1/locations?on_conflict=country_code,postal_code,city,district,state",
      serviceRoleKey,
      supabaseUrl,
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
    });

    if (!response.ok) {
      throw new Error(`Import failed at batch ${start / batchSize + 1}: ${await response.text()}`);
    }

    imported += batch.length;
    console.log(`Imported batch ${Math.ceil(imported / batchSize)}: ${imported}/${rows.length}`);
  }
}

async function countImportedLocations({
  serviceRoleKey,
  supabaseUrl,
}: {
  serviceRoleKey: string;
  supabaseUrl: string;
}) {
  const response = await supabaseFetch({
    method: "HEAD",
    path: "/rest/v1/locations?country_code=eq.DE&select=id",
    serviceRoleKey,
    supabaseUrl,
    headers: {
      Prefer: "count=exact",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to count locations: ${await response.text()}`);
  }

  const contentRange = response.headers.get("content-range") || "";
  const total = contentRange.split("/")[1];
  return total || "unknown";
}

async function autocompleteLocation({
  searchText,
  serviceRoleKey,
  supabaseUrl,
}: {
  searchText: string;
  serviceRoleKey: string;
  supabaseUrl: string;
}) {
  const response = await supabaseFetch({
    body: JSON.stringify({
      country: "DE",
      result_limit: 10,
      search_text: searchText,
    }),
    method: "POST",
    path: "/rest/v1/rpc/autocomplete_locations",
    serviceRoleKey,
    supabaseUrl,
  });

  if (!response.ok) {
    throw new Error(`Autocomplete failed for ${searchText}: ${await response.text()}`);
  }

  return (await response.json()) as Array<{ city: string; display_name: string }>;
}

async function supabaseFetch({
  body,
  headers,
  method,
  path: requestPath,
  serviceRoleKey,
  supabaseUrl,
}: {
  body?: string;
  headers?: Record<string, string>;
  method: string;
  path: string;
  serviceRoleKey: string;
  supabaseUrl: string;
}) {
  return fetch(`${supabaseUrl.replace(/\/$/, "")}${requestPath}`, {
    body,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    method,
  });
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function printStats(stats: ImportStats) {
  console.log("GeoNames Germany import summary");
  console.log(`Country dump rows read: ${stats.countryDumpRowsRead}`);
  console.log(`Populated places read: ${stats.populatedPlacesRead}`);
  console.log(`Postal rows read: ${stats.postalRowsRead}`);
  console.log(`Valid rows: ${stats.validRows}`);
  console.log(`Duplicate rows: ${stats.duplicateRows}`);
  console.log(`Rejected rows: ${stats.rejectedRows}`);
  console.log(`Importable rows: ${stats.importableRows}`);

  if (Object.keys(stats.rejectedReasons).length > 0) {
    console.log("Rejected reasons:");

    for (const [reason, count] of Object.entries(stats.rejectedReasons)) {
      console.log(`- ${reason}: ${count}`);
    }
  }
}

function readOptionValue(optionName: string) {
  const equalsArg = rawArgs.find((arg) => arg.startsWith(`${optionName}=`));

  if (equalsArg) {
    return equalsArg.slice(optionName.length + 1);
  }

  const optionIndex = rawArgs.indexOf(optionName);

  if (optionIndex !== -1) {
    return rawArgs[optionIndex + 1];
  }

  return undefined;
}

function buildLocationsSql(rows: LocationRow[], batchSize: number) {
  const statements = [
    "begin;",
    "set local search_path = public, extensions;",
  ];

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const values = batch
      .map((row) =>
        [
          sqlLiteral(row.country_code),
          sqlLiteral(row.postal_code),
          sqlLiteral(row.city),
          sqlLiteral(row.district),
          sqlLiteral(row.state),
          sqlNumber(row.latitude),
          sqlNumber(row.longitude),
          "true",
          sqlLiteral(row.source),
        ].join(", ")
      )
      .map((value) => `  (${value})`)
      .join(",\n");

    statements.push(`insert into public.locations (
  country_code,
  postal_code,
  city,
  district,
  state,
  latitude,
  longitude,
  is_active,
  source
)
values
${values}
on conflict (country_code, postal_code, city, district, state)
do update set
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  is_active = excluded.is_active,
  source = excluded.source;`);
  }

  statements.push("commit;");
  return `${statements.join("\n\n")}\n`;
}

function sqlLiteral(value: string | null) {
  if (value === null) {
    return "null";
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNumber(value: number | null) {
  return value === null ? "null" : String(value);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
