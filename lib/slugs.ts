import { SIGNS, type SignName } from "@/lib/ephemeris";

/** Slug de URL por signo, sem acentos. */
export const SIGN_SLUGS: Record<SignName, string> = {
  Áries: "aries", Touro: "touro", Gêmeos: "gemeos", Câncer: "cancer",
  Leão: "leao", Virgem: "virgem", Libra: "libra", Escorpião: "escorpiao",
  Sagitário: "sagitario", Capricórnio: "capricornio", Aquário: "aquario", Peixes: "peixes",
};

const BY_SLUG: Record<string, SignName> = Object.fromEntries(
  (Object.entries(SIGN_SLUGS) as [SignName, string][]).map(([sign, slug]) => [slug, sign])
);

export function signFromSlug(slug: string): SignName | null {
  return BY_SLUG[slug] ?? null;
}

export function slugFor(sign: SignName): string {
  return SIGN_SLUGS[sign];
}

// ─── Signo por data de nascimento ───────────────────────────────────────────

/** Início de cada signo no calendário (mês, dia), datas convencionais. */
const STARTS: { sign: SignName; month: number; day: number }[] = [
  { sign: "Capricórnio", month: 1, day: 1 },
  { sign: "Aquário", month: 1, day: 20 },
  { sign: "Peixes", month: 2, day: 19 },
  { sign: "Áries", month: 3, day: 21 },
  { sign: "Touro", month: 4, day: 20 },
  { sign: "Gêmeos", month: 5, day: 21 },
  { sign: "Câncer", month: 6, day: 21 },
  { sign: "Leão", month: 7, day: 23 },
  { sign: "Virgem", month: 8, day: 23 },
  { sign: "Libra", month: 9, day: 23 },
  { sign: "Escorpião", month: 10, day: 23 },
  { sign: "Sagitário", month: 11, day: 22 },
  { sign: "Capricórnio", month: 12, day: 22 },
];

export type SignByDate = {
  sign: SignName;
  /** Verdadeiro quando a data fica a até um dia de uma virada de signo. */
  cusp: boolean;
  /** O outro signo possível, quando na cúspide. */
  neighbor: SignName | null;
};

/** Signo aproximado para mês e dia, com aviso de cúspide. */
export function signByMonthDay(month: number, day: number): SignByDate {
  const key = month * 100 + day;
  let current = STARTS[0];
  for (const s of STARTS) {
    if (s.month * 100 + s.day <= key) current = s;
  }
  // Cúspide: a um dia da virada anterior ou da próxima
  const idx = STARTS.indexOf(current);
  const next = STARTS[idx + 1];
  const prev = STARTS[idx - 1];
  const dayOfYear = dayIndex(month, day);
  const nearNext = next && dayIndex(next.month, next.day) - dayOfYear <= 1;
  const nearPrev = idx > 0 && dayOfYear - dayIndex(current.month, current.day) <= 1;

  if (nearNext) return { sign: current.sign, cusp: true, neighbor: next.sign };
  if (nearPrev && prev) return { sign: current.sign, cusp: true, neighbor: prev.sign };
  return { sign: current.sign, cusp: false, neighbor: null };
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dayIndex(month: number, day: number): number {
  let n = 0;
  for (let m = 1; m < month; m++) n += DAYS_IN_MONTH[m - 1];
  return n + day;
}

// ─── Páginas por dia do ano ("22-de-setembro") ──────────────────────────────

export const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const MONTH_SLUGS = MONTHS.map((m) => m.replace("ç", "c"));

export function daySlug(month: number, day: number): string {
  return `${day}-de-${MONTH_SLUGS[month - 1]}`;
}

export function parseDaySlug(slug: string): { month: number; day: number } | null {
  const m = slug.match(/^(\d{1,2})-de-([a-z]+)$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTH_SLUGS.indexOf(m[2]) + 1;
  if (month < 1 || day < 1 || day > DAYS_IN_MONTH[month - 1]) return null;
  return { month, day };
}

export function allDaySlugs(): string[] {
  const out: string[] = [];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= DAYS_IN_MONTH[m - 1]; d++) out.push(daySlug(m, d));
  }
  return out;
}

export function dayLabel(month: number, day: number): string {
  return `${day} de ${MONTHS[month - 1]}`;
}

export { SIGNS };
