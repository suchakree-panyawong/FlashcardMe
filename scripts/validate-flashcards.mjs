import fs from "node:fs";

const file = process.argv[2] ?? "data/isc2-cc-master-flashcards-2026-clean.json";

const requiredFields = [
  "id",
  "vocab",
  "vocabThai",
  "meaning",
  "domain",
  "pattern",
  "scenario",
  "nextReviewDate",
  "category",
  "createdAt",
];
const validCategories = new Set(["general", "cert"]);
const mojibakeMarkers = ["Ã", "Â", "â", "ð", "�", "à¸", "à¹"];
const hasThai = (value) => Array.from(value).some((character) => {
  const codePoint = character.codePointAt(0) ?? 0;
  return codePoint >= 0x0e00 && codePoint <= 0x0e7f;
});
const hasMojibake = (value) => mojibakeMarkers.some((marker) => value.includes(marker));

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

const issues = [];
const ids = new Set();
const vocabs = new Set();

if (!Array.isArray(data)) issues.push("Root value must be an array");

for (const [index, card] of (Array.isArray(data) ? data : []).entries()) {
  const label = `record ${index + 1}`;
  if (!card || typeof card !== "object") {
    issues.push(`${label}: must be an object`);
    continue;
  }

  for (const field of requiredFields) {
    if (typeof card[field] !== "string" || !card[field].trim()) issues.push(`${label}: missing ${field}`);
    if (typeof card[field] === "string" && hasMojibake(card[field])) issues.push(`${label}: mojibake in ${field}`);
  }
  if (typeof card.interval !== "number" || !Number.isFinite(card.interval) || card.interval <= 0) issues.push(`${label}: invalid interval`);
  if (card.category !== undefined && !validCategories.has(card.category)) issues.push(`${label}: invalid category`);
  if (card.deck !== undefined && (typeof card.deck !== "string" || !card.deck.trim())) issues.push(`${label}: invalid deck`);
  if (typeof card.nextReviewDate === "string" && Number.isNaN(Date.parse(card.nextReviewDate))) issues.push(`${label}: invalid nextReviewDate`);
  if (typeof card.createdAt === "string" && Number.isNaN(Date.parse(card.createdAt))) issues.push(`${label}: invalid createdAt`);
  for (const field of ["reviewCount", "correctCount", "incorrectCount"]) {
    if (card[field] !== undefined && (!Number.isInteger(card[field]) || card[field] < 0)) issues.push(`${label}: invalid ${field}`);
  }
  if (typeof card.vocab === "string" && hasThai(card.vocab)) issues.push(`${label}: vocab contains Thai characters`);
  if (typeof card.vocab === "string" && !/[A-Za-z]/.test(card.vocab)) issues.push(`${label}: vocab has no English letters`);
  if (typeof card.vocabThai === "string" && !hasThai(card.vocabThai)) issues.push(`${label}: vocabThai has no Thai characters`);
  if (typeof card.meaning === "string" && !hasThai(card.meaning)) issues.push(`${label}: meaning has no Thai characters`);

  if (ids.has(card.id)) issues.push(`${label}: duplicate id ${card.id}`);
  if (typeof card.id === "string") ids.add(card.id);
  const normalizedVocab = typeof card.vocab === "string" ? card.vocab.toLowerCase().trim() : "";
  if (vocabs.has(normalizedVocab)) issues.push(`${label}: duplicate vocab ${card.vocab}`);
  if (normalizedVocab) vocabs.add(normalizedVocab);
}

const report = {
  file,
  records: Array.isArray(data) ? data.length : 0,
  issues: issues.length,
};
console.log(JSON.stringify(report, null, 2));
if (issues.length) {
  console.error(issues.slice(0, 20).join("\n"));
  process.exit(2);
}
