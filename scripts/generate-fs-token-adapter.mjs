import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourcePath = path.join(repositoryRoot, "sources/fs.tokens.json");
const cssOutputPath = path.join(repositoryRoot, "app/fs-tokens.generated.css");
const gameColorsOutputPath = path.join(
  repositoryRoot,
  "src/ui/fs-game-colors.generated.ts",
);

const semanticMappings = [
  ["--fs-surface-background", ["fs-colors", "FS-Semantic-Colors", "Surface", "color-surface-background"]],
  ["--fs-surface-elevation-1", ["fs-colors", "FS-Semantic-Colors", "Surface", "color-surface-elevation-1"]],
  ["--fs-surface-elevation-2", ["fs-colors", "FS-Semantic-Colors", "Surface", "color-surface-elevation-2"]],
  ["--fs-surface-overlay", ["fs-colors", "FS-Semantic-Colors", "Surface", "color-surface-overlay"]],
  ["--fs-content-inverse", ["fs-colors", "FS-Semantic-Colors", "Content", "color-content-inverse"]],
  ["--fs-content-elevation-2", ["fs-colors", "FS-Semantic-Colors", "Content", "color-content-elevation-2"]],
  ["--fs-content-elevation-1", ["fs-colors", "FS-Semantic-Colors", "Content", "color-content-elevation-1"]],
  ["--fs-content-primary", ["fs-colors", "FS-Semantic-Colors", "Content", "color-content-primary"]],
  ["--fs-content-disabled", ["fs-colors", "FS-Semantic-Colors", "Content", "color-content-disabled"]],
  ["--fs-action-primary", ["fs-colors", "FS-Semantic-Colors", "Action", "color-action-primary"]],
  ["--fs-action-hover", ["fs-colors", "FS-Semantic-Colors", "Action", "color-action-hover"]],
  ["--fs-action-link", ["fs-colors", "FS-Semantic-Colors", "Action", "color-action-link"]],
  ["--fs-action-disabled", ["fs-colors", "FS-Semantic-Colors", "Action", "color-action-disabled"]],
  ["--fs-feedback-success", ["fs-colors", "FS-Semantic-Colors", "Feedback", "color-feedback-success"]],
  ["--fs-feedback-warning", ["fs-colors", "FS-Semantic-Colors", "Feedback", "color-feedback-warning"]],
  ["--fs-feedback-error", ["fs-colors", "FS-Semantic-Colors", "Feedback", "color-feedback-error"]],
  ["--fs-feedback-info", ["fs-colors", "FS-Semantic-Colors", "Feedback", "color-feedback-info"]],
  ["--fs-border-subtle", ["fs-colors", "FS-Semantic-Colors", "Borders", "color-border-subtle"]],
  ["--fs-border-strong", ["fs-colors", "FS-Semantic-Colors", "Borders", "color-border-strong"]],
  ["--fs-border-focus", ["fs-colors", "FS-Semantic-Colors", "Borders", "color-border-focus"]],
];

const primitiveMappings = [
  ["--fs-red", ["fs-colors", "FS-Primitive-Colors", "color-red"]],
  ["--fs-vermilion", ["fs-colors", "FS-Primitive-Colors", "color-vermilion"]],
  ["--fs-orange", ["fs-colors", "FS-Primitive-Colors", "color-orange"]],
  ["--fs-amber", ["fs-colors", "FS-Primitive-Colors", "color-amber"]],
  ["--fs-yellow", ["fs-colors", "FS-Primitive-Colors", "color-yellow"]],
  ["--fs-green", ["fs-colors", "FS-Primitive-Colors", "color-green"]],
  ["--fs-cyan", ["fs-colors", "FS-Primitive-Colors", "color-cyan"]],
  ["--fs-blue", ["fs-colors", "FS-Primitive-Colors", "color-blue"]],
  ["--fs-indigo", ["fs-colors", "FS-Primitive-Colors-extended", "color-indigo"]],
  ["--fs-violet", ["fs-colors", "FS-Primitive-Colors", "color-violet"]],
  ["--fs-magenta", ["fs-colors", "FS-Primitive-Colors", "color-magenta"]],
];

const spacingMappings = [
  ["--space-3xs", ["fs-spacing", "Spacing", "space-3xs"]],
  ["--space-2xs", ["fs-spacing", "Spacing", "space-2xs"]],
  ["--space-xs", ["fs-spacing", "Spacing", "space-xs"]],
  ["--space-sm", ["fs-spacing", "Spacing", "space-sm"]],
  ["--space-md", ["fs-spacing", "Spacing", "space-md"]],
  ["--space-lg", ["fs-spacing", "Spacing", "space-lg"]],
  ["--space-xl", ["fs-spacing", "Spacing", "space-xl"]],
  ["--space-2xl", ["fs-spacing", "Spacing", "space-2xl"]],
  ["--space-3xl", ["fs-spacing", "Spacing", "space-3xl"]],
];

const typographyMappings = [
  ["--font-base", ["fs-typography", "FontFamilies", "font-family-base"], "font-family"],
  ["--font-mono", ["fs-typography", "FontFamilies", "font-family-mono"], "font-family"],
  ["--font-size-xs", ["fs-typography", "FontSizes", "font-size-xs"], "dimension"],
  ["--font-size-sm", ["fs-typography", "FontSizes", "font-size-sm"], "dimension"],
  ["--font-size-md", ["fs-typography", "FontSizes", "font-size-md"], "dimension"],
  ["--font-size-lg", ["fs-typography", "FontSizes", "font-size-lg"], "dimension"],
  ["--font-size-xl", ["fs-typography", "FontSizes", "font-size-xl"], "dimension"],
  ["--font-weight-regular", ["fs-typography", "FontWeights", "font-weight-regular"], "number"],
  ["--font-weight-medium", ["fs-typography", "FontWeights", "font-weight-medium"], "number"],
  ["--font-weight-semibold", ["fs-typography", "FontWeights", "font-weight-semibold"], "number"],
  ["--font-weight-bold", ["fs-typography", "FontWeights", "font-weight-bold"], "number"],
  ["--line-height-tight", ["fs-typography", "LineHeights", "line-height-tight"], "number"],
  ["--line-height-normal", ["fs-typography", "LineHeights", "line-height-normal"], "number"],
  ["--line-height-relaxed", ["fs-typography", "LineHeights", "line-height-relaxed"], "number"],
];

const bannerMappings = [
  ["Indigo", ["fs-colors", "FS-Primitive-Colors-extended", "color-indigo"]],
  ["Vermilion", ["fs-colors", "FS-Primitive-Colors", "color-vermilion"]],
  ["Amber", ["fs-colors", "FS-Primitive-Colors", "color-amber"]],
  ["Green", ["fs-colors", "FS-Primitive-Colors", "color-green"]],
  ["Violet", ["fs-colors", "FS-Primitive-Colors", "color-violet"]],
];

function fail(message) {
  throw new Error(`FS token adapter: ${message}`);
}

function tokenValue(source, tokenPath, mode, kind) {
  let current = source;
  for (const segment of tokenPath) {
    if (
      current === null ||
      typeof current !== "object" ||
      !(segment in current)
    ) {
      fail(`missing token path ${tokenPath.join(".")}`);
    }
    current = current[segment];
  }

  const modeNode = current?.[mode];
  if (modeNode === null || typeof modeNode !== "object") {
    fail(`missing mode "${mode}" at ${tokenPath.join(".")}`);
  }

  const value = modeNode.$value;
  if (typeof value !== "string" || value.length === 0) {
    fail(`expected a non-empty string $value at ${tokenPath.join(".")}.${mode}`);
  }

  const validators = {
    color: /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
    dimension: /^-?(?:\d+|\d*\.\d+)(?:rem|em|px|%)$/,
    number: /^-?(?:\d+|\d*\.\d+)$/,
  };
  if (kind in validators && !validators[kind].test(value)) {
    fail(`invalid ${kind} value at ${tokenPath.join(".")}.${mode}: ${value}`);
  }
  if (kind === "font-family" && value.trim().length === 0) {
    fail(`invalid font-family value at ${tokenPath.join(".")}.${mode}`);
  }

  return value;
}

function assertUniqueCssNames(mappingGroups) {
  const seen = new Set();
  for (const mappings of mappingGroups) {
    for (const [cssName] of mappings) {
      if (seen.has(cssName)) {
        fail(`duplicate CSS variable mapping: ${cssName}`);
      }
      seen.add(cssName);
    }
  }
}

function cssDeclarations(source, mappings, mode, defaultKind) {
  return mappings.map(([cssName, tokenPath, kind = defaultKind]) => {
    return `  ${cssName}: ${tokenValue(source, tokenPath, mode, kind)};`;
  });
}

function generateCss(source) {
  assertUniqueCssNames([
    semanticMappings,
    primitiveMappings,
    spacingMappings,
    typographyMappings,
  ]);

  const lines = [
    "/* AUTO-GENERATED by scripts/generate-fs-token-adapter.mjs.",
    " * Source: sources/fs.tokens.json",
    " * Do not edit directly. Run: npm run tokens:generate",
    " */",
    "",
    ":root {",
    "  /* FS semantic colors: UI roles */",
    ...cssDeclarations(source, semanticMappings, "default", "color"),
    "",
    "  /* FS primitive colors: game objects and gameplay visuals */",
    ...cssDeclarations(source, primitiveMappings, "default", "color"),
    "",
    "  /* FS spacing */",
    ...cssDeclarations(source, spacingMappings, "default", "dimension"),
    "",
    "  /* FS typography */",
    ...cssDeclarations(source, typographyMappings, "default"),
    "}",
    "",
    ':root[data-theme="dark"] {',
    "  /* FS semantic colors: UI roles */",
    ...cssDeclarations(source, semanticMappings, "dark", "color"),
    "",
    "  /* FS primitive colors: game objects and gameplay visuals */",
    ...cssDeclarations(source, primitiveMappings, "dark", "color"),
    "}",
    "",
  ];

  return lines.join("\n");
}

function generateGameColors(source) {
  const colors = bannerMappings.map(([name, tokenPath]) => {
    const value = tokenValue(source, tokenPath, "default", "color");
    return `  { name: ${JSON.stringify(name)}, value: ${JSON.stringify(value)} },`;
  });

  return [
    "// AUTO-GENERATED by scripts/generate-fs-token-adapter.mjs.",
    "// Source: sources/fs.tokens.json",
    "// Do not edit directly. Run: npm run tokens:generate",
    "",
    "// Default-mode primitive values remain literal to preserve saved campaign data.",
    "export const FS_BANNER_COLORS = [",
    ...colors,
    "] as const;",
    "",
  ].join("\n");
}

async function readSource() {
  let sourceText;
  try {
    sourceText = await readFile(sourcePath, "utf8");
  } catch (error) {
    fail(`could not read ${path.relative(repositoryRoot, sourcePath)}: ${error.message}`);
  }

  try {
    return JSON.parse(sourceText);
  } catch (error) {
    fail(`invalid JSON in ${path.relative(repositoryRoot, sourcePath)}: ${error.message}`);
  }
}

async function checkOutput(outputPath, expected) {
  const relativePath = path.relative(repositoryRoot, outputPath);
  let actual;
  try {
    actual = await readFile(outputPath, "utf8");
  } catch {
    fail(`missing generated output ${relativePath}; run npm run tokens:generate`);
  }
  if (actual !== expected) {
    fail(`stale generated output ${relativePath}; run npm run tokens:generate`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.length === 0 ? "--write" : args[0];
  if (args.length > 1 || !["--write", "--check"].includes(mode)) {
    fail('usage: node scripts/generate-fs-token-adapter.mjs [--write|--check]');
  }

  const source = await readSource();
  const outputs = [
    [cssOutputPath, generateCss(source)],
    [gameColorsOutputPath, generateGameColors(source)],
  ];

  if (mode === "--check") {
    for (const [outputPath, expected] of outputs) {
      await checkOutput(outputPath, expected);
    }
    console.log("FS token adapters are synchronized.");
    return;
  }

  for (const [outputPath, contents] of outputs) {
    await writeFile(outputPath, contents, "utf8");
    console.log(`Generated ${path.relative(repositoryRoot, outputPath)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
