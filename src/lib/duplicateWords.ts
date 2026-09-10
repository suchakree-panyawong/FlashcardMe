function normalizeWord(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function wordForms(value: string): string[] {
  const normalized = normalizeWord(value);
  const forms = [normalized];

  if (normalized.endsWith("ies") && normalized.length > 3) {
    forms.push(`${normalized.slice(0, -3)}y`);
  }
  if (normalized.endsWith("es") && normalized.length > 2) {
    forms.push(normalized.slice(0, -2));
  }
  if (normalized.endsWith("s") && normalized.length > 1) {
    forms.push(normalized.slice(0, -1));
  }
  if (normalized.endsWith("ed") && normalized.length > 2) {
    forms.push(normalized.slice(0, -2));
  }

  return forms;
}

export function areDuplicateWords(first: string, second: string): boolean {
  const firstForms = wordForms(first);
  const secondForms = wordForms(second);
  return firstForms.some((form) => secondForms.includes(form));
}
