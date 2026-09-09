export function getDomainTagClassName(domain: string): string {
  if (domain === "Exam Logic") return "border-violet-200 bg-violet-50 text-violet-700";
  if (domain.includes("Domain 1") || domain.includes("Security Principles")) return "border-blue-200 bg-blue-50 text-blue-700";
  if (domain.includes("Domain 2") || domain.includes("Security Governance")) return "border-amber-200 bg-amber-50 text-amber-700";
  if (domain.includes("Domain 3") || domain.includes("IAM Concepts")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (domain.includes("Domain 4") || domain.includes("Networking & Cloud")) return "border-indigo-200 bg-indigo-50 text-indigo-700";
  if (domain.includes("Domain 5") || domain.includes("Security Ops")) return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}