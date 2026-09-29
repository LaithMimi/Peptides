// Dev helper: deep-merges a JSON fragment into messages/<locale>.json.
// Usage: node scripts/merge-messages.mjs <locale> <fragment.json>
// Existing keys not in the fragment are kept; keys in the fragment overwrite.
import { readFileSync, writeFileSync } from "node:fs";

const [locale, fragmentPath] = process.argv.slice(2);
if (!locale || !fragmentPath) {
  console.error("Usage: node scripts/merge-messages.mjs <locale> <fragment.json>");
  process.exit(1);
}

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = merge(target[key] ?? {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

const file = `messages/${locale}.json`;
const current = JSON.parse(readFileSync(file, "utf8"));
const fragment = JSON.parse(readFileSync(fragmentPath, "utf8"));
writeFileSync(file, JSON.stringify(merge(current, fragment), null, 2) + "\n");
console.log(`Merged ${fragmentPath} into ${file}`);
