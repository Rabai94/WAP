#!/usr/bin/env node

import { execFileSync } from "node:child_process";
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
  : collectNewAndUntrackedTargets(collectionWarnings);

const findings = [];

for (const target of targets) {
  auditFile(target, findings);
}

auditDesignLabImports(findings);

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
    "[rabai-ui-audit] No new or untracked app pages found. Pass explicit paths to audit existing pages.",
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

Without paths, only app route files newly added to the working tree/index or
untracked app route files are inspected. Explicit files or directories may be
used to audit existing app routes. The audit always exits 0 unless --strict is
provided.`);
}

function collectNewAndUntrackedTargets(warnings) {
  const repositoryPaths = new Set();
  const commands = [
    ["diff", "--name-only", "--diff-filter=A", "--", appPrefix],
    ["diff", "--cached", "--name-only", "--diff-filter=A", "--", appPrefix],
    ["ls-files", "--others", "--exclude-standard", "--", appPrefix],
  ];

  for (const command of commands) {
    try {
      const output = execFileSync("git", command, {
        cwd: repositoryRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });

      for (const line of output.split(/\r?\n/u)) {
        const candidate = normalizeRepositoryPath(line.trim());
        if (candidate) {
          repositoryPaths.add(candidate);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      warnings.push(`Could not query git targets: ${message}`);
      break;
    }
  }

  return [...repositoryPaths]
    .map((repositoryPath) => path.resolve(repositoryRoot, repositoryPath))
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
    fileName === "_layout.tsx" ||
    isDesignLabRoute(repositoryPath)
  ) {
    return;
  }

  const source = readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const colors = [...line.matchAll(/#[0-9a-fA-F]{3,8}\b/gu)].map(
      (match) => match[0],
    );

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
  auditOneOffUiComponents(lines, repositoryPath, output);

  if (
    !isRedirectOnly(source) &&
    !isRouteDelegate(source) &&
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

function auditDesignLabImports(output) {
  for (const filePath of walkDirectory(sourceDirectory)) {
    if (!isSourceFile(filePath) || isDesignLabSourceFile(filePath)) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/u);

    lines.forEach((line, index) => {
      if (/\bfrom\s+["']@\/design-lab(?:\/|["'])/u.test(line)) {
        output.push({
          file: toRepositoryPath(filePath),
          line: index + 1,
          message: "Product code imports from design-lab; migrate approved primitives first and keep experimental code isolated.",
          rule: "design-lab-import",
        });
      }
    });
  }
}

function isSourceFile(filePath) {
  return supportedExtensions.has(path.extname(filePath).toLowerCase());
}

function isDesignLabRoute(repositoryPath) {
  return repositoryPath.startsWith("apps/mobile/src/app/design-lab/");
}

function isDesignLabSourceFile(filePath) {
  const repositoryPath = toRepositoryPath(filePath);
  return (
    repositoryPath.startsWith("apps/mobile/src/design-lab/") ||
    isDesignLabRoute(repositoryPath)
  );
}

function isRouteDelegate(source) {
  const defaultImport = source.match(
    /^import\s+([A-Z][A-Za-z0-9_]*)\s+from\s+["'][^"']+["'];?\s*$/mu,
  );

  if (!defaultImport) {
    return false;
  }

  const remainder = source
    .replace(/^import\s+[^;]+;\s*$/gmu, "")
    .replace(
      new RegExp(`^export default ${defaultImport[1]};?\\s*$`, "mu"),
      "",
    )
    .trim();

  return remainder.length === 0;
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
