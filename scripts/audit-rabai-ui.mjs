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

  if (fileName === "_layout.ts" || fileName === "_layout.tsx") {
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

    if (/<Pressable\b/u.test(line)) {
      output.push({
        file: repositoryPath,
        line: index + 1,
        message: "Raw Pressable found; reuse a components/ui primitive or document why a semantic control cannot be used.",
        rule: "raw-pressable",
      });
    }
  });

  if (!isRedirectOnly(source) && !/<PageContainer(?:\s|>)/u.test(source)) {
    output.push({
      file: repositoryPath,
      line: null,
      message: "Page does not render PageContainer.",
      rule: "missing-page-container",
    });
  }
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
