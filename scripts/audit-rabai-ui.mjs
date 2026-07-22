#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const appDirectory = path.join(
  repositoryRoot,
  "apps",
  "mobile",
  "src",
  "app",
);
const sourceDirectory = path.join(repositoryRoot, "apps", "mobile", "src");
const publicDirectory = path.join(repositoryRoot, "apps", "mobile", "public");
const appPrefix = "apps/mobile/src/app/";
const supportedExtensions = new Set([".ts", ".tsx"]);

const options = parseArguments(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const collectionWarnings = [];
const targets = options.paths.length > 0
  ? collectExplicitTargets(options.paths, collectionWarnings)
  : collectProductionTargets();

const findings = [];

for (const target of targets) {
  auditFile(target, findings);
}

auditSourceStructures(findings);
auditForbiddenProductionPaths(findings);
auditForbiddenSourceReferences(findings);
auditForbiddenPublicAssets(findings);

for (const warning of collectionWarnings) {
  console.warn(`[rabai-ui-audit] ${warning}`);
}

for (const finding of findings) {
  const location = finding.line
    ? `${finding.file}:${finding.line}`
    : finding.file;
  console.warn(`[rabai-ui-audit] ${location} [${finding.rule}] ${finding.message}`);
}

const warningCount = collectionWarnings.length + findings.length;

if (targets.length === 0 && collectionWarnings.length === 0) {
  console.log(
    "[rabai-ui-audit] No production app route files found.",
  );
} else {
  console.log(
    `[rabai-ui-audit] Audited ${targets.length} file(s); ${warningCount} warning(s).`,
  );
}

if (options.strict && warningCount > 0) {
  process.exitCode = 1;
}

function parseArguments(argumentsList) {
  const parsed = {
    help: false,
    paths: [],
    strict: false,
  };

  for (const argument of argumentsList) {
    if (argument === "--strict") {
      parsed.strict = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      parsed.help = true;
      continue;
    }

    if (argument.startsWith("--")) {
      parsed.paths.push(argument);
      continue;
    }

    parsed.paths.push(argument);
  }

  return parsed;
}

function printHelp() {
  console.log(`RabAI UI advisory audit

Usage:
  npm run ui:audit
  npm run ui:audit -- --strict
  npm run ui:audit -- apps/mobile/src/app/example.tsx
  npm run ui:audit -- --strict apps/mobile/src/app/example.tsx

Without paths, every production app route is inspected. Explicit files or
directories may be used for a focused audit. Source-wide forbidden references
are checked in both modes. The audit exits 0 unless --strict is provided.`);
}

function collectProductionTargets() {
  return [...walkDirectory(appDirectory)]
    .filter(isAuditableFile)
    .sort(comparePaths);
}

function collectExplicitTargets(inputPaths, warnings) {
  const targets = new Set();

  for (const inputPath of inputPaths) {
    const resolvedPath = resolveInputPath(inputPath);

    if (!resolvedPath || !existsSync(resolvedPath)) {
      warnings.push(`Explicit path does not exist: ${inputPath}`);
      continue;
    }

    const metadata = statSync(resolvedPath);

    if (metadata.isDirectory()) {
      for (const file of walkDirectory(resolvedPath)) {
        if (isAuditableFile(file)) {
          targets.add(path.resolve(file));
        }
      }
      continue;
    }

    if (!isAuditableFile(resolvedPath)) {
      warnings.push(
        `Skipped non-app or unsupported file: ${toRepositoryPath(resolvedPath)}`,
      );
      continue;
    }

    targets.add(path.resolve(resolvedPath));
  }

  return [...targets].sort(comparePaths);
}

function resolveInputPath(inputPath) {
  const fromCurrentDirectory = path.resolve(process.cwd(), inputPath);
  if (existsSync(fromCurrentDirectory)) {
    return fromCurrentDirectory;
  }

  const fromRepositoryRoot = path.resolve(repositoryRoot, inputPath);
  return existsSync(fromRepositoryRoot) ? fromRepositoryRoot : null;
}

function* walkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walkDirectory(entryPath);
    } else if (entry.isFile()) {
      yield entryPath;
    }
  }
}

function isAuditableFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const relativePath = toRepositoryPath(absolutePath);
  return (
    relativePath.startsWith(appPrefix) &&
    supportedExtensions.has(path.extname(absolutePath).toLowerCase()) &&
    existsSync(absolutePath)
  );
}

function auditFile(filePath, output) {
  const repositoryPath = toRepositoryPath(filePath);
  const fileName = path.basename(filePath);

  if (
    fileName === "_layout.ts" ||
    fileName === "_layout.tsx"
  ) {
    return;
  }

  const source = readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const colors = [
      ...line.matchAll(/#[0-9a-fA-F]{3,8}\b/gu),
      ...line.matchAll(/\b(?:rgb|hsl)a?\s*\([^)]*\)/gu),
    ].map((match) => match[0]);

    if (colors.length > 0) {
      output.push({
        file: repositoryPath,
        line: index + 1,
        message: `Hardcoded color ${[...new Set(colors)].join(", ")}; use a semantic theme token.`,
        rule: "hardcoded-color",
      });
    }

    const fontSizeMatch = line.match(/\bfontSize\s*:\s*(\d+(?:\.\d+)?)/u);
    if (
      fontSizeMatch &&
      Number(fontSizeMatch[1]) < 13 &&
      !hasSmallTextException(lines, index)
    ) {
      output.push({
        file: repositoryPath,
        line: index + 1,
        message: `fontSize ${fontSizeMatch[1]} is below the 13px minimum; document a justified exception with rabai-ui-audit: allow-small-text — motiv.`,
        rule: "small-text",
      });
    }
  });

  auditNestedPressables(source, repositoryPath, output);
  auditNestedCards(source, repositoryPath, output);
  auditHandlerlessControls(source, repositoryPath, output);
  auditOneOffUiComponents(lines, repositoryPath, output);

  if (
    !isRedirectOnly(source) &&
    !isRouteDelegate(source, filePath) &&
    !/<PageContainer(?:\s|>)/u.test(source)
  ) {
    output.push({
      file: repositoryPath,
      line: null,
      message: "Page does not render PageContainer.",
      rule: "missing-page-container",
    });
  }
}

function hasSmallTextException(lines, index) {
  const documentedLines = [lines[index], lines[index - 1]]
    .filter(Boolean)
    .join(" ");
  return /rabai-ui-audit:\s*allow-small-text\s+[—-]\s+\S/u.test(documentedLines);
}

function auditNestedPressables(source, repositoryPath, output) {
  const tagPattern = /<\/?Pressable\b[^>]*>/gu;
  const openPressables = [];

  for (const match of source.matchAll(tagPattern)) {
    const tag = match[0];

    if (tag.startsWith("</")) {
      openPressables.pop();
      continue;
    }

    if (tag.endsWith("/>")) {
      continue;
    }

    if (openPressables.length > 0) {
      output.push({
        file: repositoryPath,
        line: lineForOffset(source, match.index ?? 0),
        message: "Nested Pressable found; compose semantic controls without nesting interactive targets.",
        rule: "nested-pressable",
      });
    }

    openPressables.push(match.index ?? 0);
  }
}

function auditNestedCards(source, repositoryPath, output) {
  const tagPattern = /<\/?(?:RabAICard|Card)\b[^>]*>/gu;
  const openCards = [];

  for (const match of source.matchAll(tagPattern)) {
    const tag = match[0];

    if (tag.startsWith("</")) {
      openCards.pop();
      continue;
    }

    if (tag.endsWith("/>")) {
      continue;
    }

    if (openCards.length > 0) {
      output.push({
        file: repositoryPath,
        line: lineForOffset(source, match.index ?? 0),
        message: "Nested Card found; use sections, rows, or a single composed surface.",
        rule: "card-in-card",
      });
    }

    openCards.push(match.index ?? 0);
  }
}

function auditHandlerlessControls(source, repositoryPath, output) {
  const tagPattern =
    /<(RabAIButton|Button|RabAIIconButton|IconButton)\b[\s\S]*?>/gu;

  for (const match of source.matchAll(tagPattern)) {
    const tag = match[0];

    if (
      /\bonPress\s*=/u.test(tag) ||
      /\bhref\s*=/u.test(tag) ||
      /\bdisabled(?:\s|=|\/?>)/u.test(tag) ||
      /\{\.\.\./u.test(tag)
    ) {
      continue;
    }

    output.push({
      file: repositoryPath,
      line: lineForOffset(source, match.index ?? 0),
      message: `${match[1]} has no detectable onPress/href handler or explicit disabled state.`,
      rule: "control-without-handler",
    });
  }
}

function auditOneOffUiComponents(lines, repositoryPath, output) {
  lines.forEach((line, index) => {
    const match = line.match(
      /\b(?:function|const)\s+([A-Z][A-Za-z0-9]*(?:Button|Card|Input))\b/u,
    );

    if (match) {
      output.push({
        file: repositoryPath,
        line: index + 1,
        message: `Local UI component ${match[1]} found; reuse a components/ui primitive or move an approved primitive into the shared UI layer.`,
        rule: "one-off-ui-component",
      });
    }
  });
}

function auditSourceStructures(output) {
  for (const filePath of walkDirectory(sourceDirectory)) {
    const repositoryPath = toRepositoryPath(filePath);

    if (
      path.extname(filePath).toLowerCase() !== ".tsx" ||
      repositoryPath.startsWith(appPrefix)
    ) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");
    auditNestedPressables(source, repositoryPath, output);
    auditNestedCards(source, repositoryPath, output);
    auditHandlerlessControls(source, repositoryPath, output);
  }
}

function auditForbiddenSourceReferences(output) {
  const forbiddenPatterns = [
    {
      message: "FloatingMessagesButton is forbidden in the product shell.",
      pattern: /\bFloatingMessagesButton\b/u,
      rule: "floating-messages-button",
    },
    {
      message: "Product source must not reference the eliminated design-lab.",
      pattern: /(?:design-lab|engine-a|engine-b|engine-c|rabai-signature-preview)/u,
      rule: "design-lab-reference",
    },
    {
      message: "Experimental theme tokens must not be used in product source.",
      pattern: /\bexperimentalTokens\b/u,
      rule: "experimental-token-reference",
    },
  ];

  for (const filePath of walkDirectory(sourceDirectory)) {
    if (!isSourceFile(filePath)) {
      continue;
    }

    const repositoryPath = toRepositoryPath(filePath);
    const source = readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/u);

    lines.forEach((line, index) => {
      for (const forbidden of forbiddenPatterns) {
        if (forbidden.pattern.test(line)) {
          output.push({
            file: repositoryPath,
            line: index + 1,
            message: forbidden.message,
            rule: forbidden.rule,
          });
        }
      }
    });
  }
}

function auditForbiddenProductionPaths(output) {
  const forbiddenPathPatterns = [
    {
      message: "The eliminated design-lab must not exist in production source.",
      pattern: /(?:^|\/)design-lab(?:\/|\.|$)/u,
      rule: "design-lab-path",
    },
    {
      message: "Experimental engine variants must not exist in production source.",
      pattern: /(?:^|\/)(?:engine-a|engine-b|engine-c)(?:\/|\.|$)/u,
      rule: "experimental-engine-path",
    },
  ];

  for (const filePath of walkDirectory(sourceDirectory)) {
    const repositoryPath = toRepositoryPath(filePath);

    for (const forbidden of forbiddenPathPatterns) {
      if (forbidden.pattern.test(repositoryPath)) {
        output.push({
          file: repositoryPath,
          line: null,
          message: forbidden.message,
          rule: forbidden.rule,
        });
      }
    }
  }
}

function auditForbiddenPublicAssets(output) {
  const forbiddenAssets = [
    {
      file: path.join(
        publicDirectory,
        "images",
        "rabai-home-hero-background-v001.png",
      ),
      message: "Legacy RabAI wallpaper is copied into every web export; remove it from public assets.",
      rule: "forbidden-public-wallpaper",
    },
  ];

  for (const forbidden of forbiddenAssets) {
    if (!existsSync(forbidden.file)) {
      continue;
    }

    output.push({
      file: toRepositoryPath(forbidden.file),
      line: null,
      message: forbidden.message,
      rule: forbidden.rule,
    });
  }
}

function isSourceFile(filePath) {
  return supportedExtensions.has(path.extname(filePath).toLowerCase());
}

function isRouteDelegate(source, routeFilePath) {
  const defaultImport = source.match(
    /^import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+["'][^"']+["'];?\s*$/mu,
  );

  if (defaultImport) {
    const remainder = source
      .replace(/^import\s+[^;]+;\s*$/gmu, "")
      .replace(
        new RegExp(`^export default ${defaultImport[1]};?\\s*$`, "mu"),
        "",
      )
      .trim();

    if (remainder.length === 0) {
      return true;
    }
  }

  const componentImports = source.matchAll(
    /^import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+["']([^"']+)["'];?\s*$/gmu,
  );

  for (const componentImport of componentImports) {
    const [, componentName, moduleName] = componentImport;

    if (!new RegExp(`<${componentName}(?:\\s|/?>)`, "u").test(source)) {
      continue;
    }

    const componentFile = resolveSourceModule(moduleName, routeFilePath);
    if (
      componentFile &&
      /<PageContainer(?:\s|>)/u.test(readFileSync(componentFile, "utf8"))
    ) {
      return true;
    }
  }

  return false;
}

function resolveSourceModule(moduleName, importerPath) {
  let modulePath;

  if (moduleName.startsWith("@/")) {
    modulePath = path.join(sourceDirectory, moduleName.slice(2));
  } else if (moduleName.startsWith(".")) {
    modulePath = path.resolve(path.dirname(importerPath), moduleName);
  } else {
    return null;
  }

  const candidates = [
    modulePath,
    `${modulePath}.ts`,
    `${modulePath}.tsx`,
    path.join(modulePath, "index.ts"),
    path.join(modulePath, "index.tsx"),
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function lineForOffset(source, offset) {
  return source.slice(0, offset).split(/\r?\n/u).length;
}

function isRedirectOnly(source) {
  const openingTags = [...source.matchAll(/<(?!\/)([A-Z][A-Za-z0-9_.]*)\b/gu)]
    .map((match) => match[1])
    .filter(Boolean);

  return openingTags.length > 0 && openingTags.every((tag) => tag === "Redirect");
}

function normalizeRepositoryPath(repositoryPath) {
  return repositoryPath.replaceAll("\\", "/").replace(/^\.\//u, "");
}

function toRepositoryPath(filePath) {
  return normalizeRepositoryPath(path.relative(repositoryRoot, filePath));
}

function comparePaths(left, right) {
  return toRepositoryPath(left).localeCompare(toRepositoryPath(right), "en");
}
