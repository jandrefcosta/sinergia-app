import { SIGNS, type SignName } from "@/lib/ephemeris";
import { allPairs, pairSlug } from "@/lib/compatibility";

/**
 * Qual par de signos vai para o Instagram em cada dia de compatibilidade.
 *
 * Os carrosséis saem às terças, quintas e sábados. O par é derivado da data,
 * sem estado no Redis: o agendador, o /admin e o gerador de cards chegam ao
 * mesmo par para o mesmo dia. A ordem começa pelos pares que o Google já
 * mostra o site e segue numa embaralhada fixa dos 78, para não sair
 * Áries e Touro, Áries e Gêmeos, Áries e Câncer em sequência.
 */

/** Dias da semana (0 = domingo) em que o carrossel de compatibilidade sai. */
export const COMPAT_WEEKDAYS: readonly number[] = [2, 4, 6];

/** Primeiro dia da rotação. */
export const COMPAT_START = "2026-11-03";

/** Pares que o Search Console já mostra em busca, primeiro. */
const PRIORITY: [SignName, SignName][] = [
  ["Câncer", "Leão"],
  ["Touro", "Escorpião"],
  ["Áries", "Libra"],
  ["Gêmeos", "Sagitário"],
];

/** Gerador determinístico (mulberry32): a mesma semente dá sempre a mesma ordem. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildOrder(): [SignName, SignName][] {
  const prioritySlugs = new Set(PRIORITY.map(([a, b]) => pairSlug(a, b)));
  const rest = allPairs().filter(([a, b]) => !prioritySlugs.has(pairSlug(a, b)));
  const random = rng(20261103);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...PRIORITY, ...rest];
}

export const COMPAT_ORDER: readonly [SignName, SignName][] = buildOrder();

function weekdayOf(period: string): number {
  return new Date(`${period}T12:00:00-03:00`).getUTCDay();
}

export function isCompatDay(period: string): boolean {
  return COMPAT_WEEKDAYS.includes(weekdayOf(period));
}

/**
 * Par do dia. Conta os dias de compatibilidade desde o início da rotação até
 * o período, inclusive; fora de um dia de compatibilidade, vale o par do
 * último dia que houve. Antes do início, o primeiro par.
 */
export function pairForPeriod(period: string): [SignName, SignName] {
  const day = 86400000;
  const start = Date.parse(`${COMPAT_START}T12:00:00-03:00`);
  const end = Date.parse(`${period}T12:00:00-03:00`);
  if (!(end > start)) return COMPAT_ORDER[0];
  let count = 0;
  for (let t = start; t <= end; t += day) {
    if (COMPAT_WEEKDAYS.includes(new Date(t).getUTCDay())) count++;
  }
  return COMPAT_ORDER[Math.max(0, count - 1) % COMPAT_ORDER.length];
}

/** Garante a ordem do zodíaco, igual à usada nas URLs. */
export function orderedPair(a: SignName, b: SignName): [SignName, SignName] {
  return SIGNS.indexOf(a) <= SIGNS.indexOf(b) ? [a, b] : [b, a];
}
