import fs from "node:fs";

const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");
const file = args.find((argument) => argument !== "--fix") ?? "data/isc2-cc-master-flashcards-2026-clean.json";

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
const mojibakeScore = (value) => mojibakeMarkers.reduce((score, marker) => score + value.split(marker).length - 1, 0);
const cp1252Bytes = {
  0x20ac: 0x80, 0x201a: 0x82, 0x192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x2c6: 0x88, 0x2030: 0x89, 0x160: 0x8a,
  0x2039: 0x8b, 0x152: 0x8c, 0x17d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x2dc: 0x98, 0x2122: 0x99, 0x161: 0x9a, 0x203a: 0x9b, 0x153: 0x9c,
  0x17e: 0x9e, 0x178: 0x9f,
};
const repairMojibake = (value) => {
  let repaired = value;
  for (let pass = 0; pass < 4; pass += 1) {
    if (mojibakeScore(repaired) === 0) break;
    try {
      const bytes = new Uint8Array(Array.from(repaired).map((character) => {
        const codePoint = character.codePointAt(0) ?? 0;
        return codePoint <= 0xff ? codePoint : cp1252Bytes[codePoint] ?? 0;
      }));
      const candidate = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (mojibakeScore(candidate) >= mojibakeScore(repaired)) break;
      repaired = candidate;
    } catch {
      break;
    }
  }
  return repaired;
};

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

if (shouldFix && Array.isArray(data)) {
  const textFields = ["id", "vocab", "vocabThai", "meaning", "domain", "pattern", "scenario", "deck", "category"];
  data = data.map((card) => {
    if (!card || typeof card !== "object") return card;
    return Object.fromEntries(Object.entries(card).map(([field, value]) => [
      field,
      textFields.includes(field) && typeof value === "string" ? repairMojibake(value) : value,
    ]));
  });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Repaired mojibake text in ${file}`);
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
