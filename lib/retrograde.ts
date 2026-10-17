import * as Astronomy from "astronomy-engine";
import { SIGNS, signFromLongitude, type SignName } from "@/lib/ephemeris";

/**
 * Períodos de Mercúrio retrógrado calculados pelas efemérides, nunca digitados.
 * As estações são refinadas por bisseção até a precisão de segundos; as datas
 * mostradas são as do instante em Brasília.
 */

export type Retrograde = {
  /** Mercúrio volta a passar pelo grau onde vai ficar direto. */
  shadowStart: Date;
  /** Estação retrógrada. */
  start: Date;
  /** Estação direta. */
  end: Date;
  /** Mercúrio sai do grau onde ficou retrógrado. */
  shadowEnd: Date;
  /** Signo da estação retrógrada e da direta (iguais na maioria dos ciclos). */
  startSign: SignName;
  endSign: SignName;
};

const DAY = 24 * 60 * 60 * 1000;
const HALF_STEP = 6 * 60 * 60 * 1000;

function lon(date: Date): number {
  return Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mercury, date, true)).elon;
}

/** Diferença angular b − a em (−180, 180]. */
function diff(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

function speed(date: Date): number {
  return diff(lon(new Date(date.getTime() - HALF_STEP)), lon(new Date(date.getTime() + HALF_STEP)));
}

/** Instante em [a, b] onde `f` troca de sinal, supondo que troca uma vez. */
function bisect(a: Date, b: Date, f: (d: Date) => number): Date {
  let lo = a.getTime();
  let hi = b.getTime();
  const loPositive = f(a) > 0;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (f(new Date(mid)) > 0 === loPositive) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

/** Procura, a partir de `from` e andando `step` ms por vez, onde `f` troca de sinal. */
function crossing(from: Date, step: number, maxSteps: number, f: (d: Date) => number): Date {
  let prev = from;
  const sign = f(from) > 0;
  for (let i = 1; i <= maxSteps; i++) {
    const next = new Date(from.getTime() + i * step);
    if (f(next) > 0 !== sign) return step > 0 ? bisect(prev, next, f) : bisect(next, prev, f);
    prev = next;
  }
  throw new Error("Cruzamento não encontrado");
}

/** Ciclos de Mercúrio retrógrado cuja estação direta cai a partir de `from`. */
export function mercuryRetrogrades(from: Date, count: number): Retrograde[] {
  const cycles: Retrograde[] = [];
  // Recua o bastante para pegar um ciclo que já começou
  let cursor = new Date(from.getTime() - 30 * DAY);
  while (cycles.length < count) {
    const start = speed(cursor) < 0 ? crossing(cursor, -DAY, 40, speed) : crossing(cursor, DAY, 140, speed);
    const end = crossing(new Date(start.getTime() + DAY), DAY, 40, speed);
    cursor = new Date(end.getTime() + DAY);
    if (end < from) continue;

    const lonStart = lon(start);
    const lonEnd = lon(end);
    cycles.push({
      shadowStart: crossing(start, -DAY, 40, (d) => diff(lonEnd, lon(d))),
      start,
      end,
      shadowEnd: crossing(end, DAY, 40, (d) => diff(lonStart, lon(d))),
      startSign: signFromLongitude(lonStart),
      endSign: signFromLongitude(lonEnd),
    });
  }
  return cycles;
}

// O ciclo atual muda poucas vezes por ano; a página e o email pedem várias vezes por dia.
let cache: { day: string; cycles: Retrograde[] } | null = null;

/** O ciclo em curso ou o próximo, seguido dos seguintes. */
export function upcomingRetrogrades(now = new Date(), count = 4): Retrograde[] {
  const day = now.toISOString().slice(0, 10);
  if (!cache || cache.day !== day || cache.cycles.length < count) {
    cache = { day, cycles: mercuryRetrogrades(now, count) };
  }
  return cache.cycles.slice(0, count);
}

/** Casa (signos inteiros, contando do signo solar) por onde Mercúrio retrograda. */
export function houseFor(sunSign: SignName, retroSign: SignName): number {
  return ((SIGNS.indexOf(retroSign) - SIGNS.indexOf(sunSign) + 12) % 12) + 1;
}

export type RetrogradeStatus = "antes" | "sombra" | "retrogrado" | "pos-sombra" | "depois";

export function statusAt(r: Retrograde, now = new Date()): RetrogradeStatus {
  if (now < r.shadowStart) return "antes";
  if (now < r.start) return "sombra";
  if (now < r.end) return "retrogrado";
  if (now < r.shadowEnd) return "pos-sombra";
  return "depois";
}

/** Frase curta de situação do ciclo, para o topo da página. */
export function statusLine(r: Retrograde, now = new Date()): string {
  switch (statusAt(r, now)) {
    case "antes":
      return `Começa em ${daysUntil(r.start, now)} dias.`;
    case "sombra": {
      const n = daysUntil(r.start, now);
      return n <= 1 ? "Começa amanhã. Já estamos na sombra." : `Começa em ${n} dias. Já estamos na sombra.`;
    }
    case "retrogrado": {
      const n = daysUntil(r.end, now);
      return n <= 1 ? "Em curso. Mercúrio fica direto amanhã." : `Em curso. Faltam ${n} dias para Mercúrio ficar direto.`;
    }
    default:
      return "Já terminou.";
  }
}

/** Aviso nas páginas de signo e no email: da semana anterior à estação até a direta. */
export function noticeWindow(now = new Date()): Retrograde | null {
  const [r] = upcomingRetrogrades(now, 1);
  return now.getTime() >= r.start.getTime() - 7 * DAY && now < r.end ? r : null;
}

// ─── Datas em Brasília ──────────────────────────────────────────────────────

const TZ = "America/Sao_Paulo";

export function dayMonth(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: TZ });
}

export function dayMonthYear(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

export function shortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
}

export function yearOf(date: Date): string {
  return date.toLocaleDateString("pt-BR", { year: "numeric", timeZone: TZ });
}

/** "24 de outubro a 13 de novembro de 2026", com o ano uma vez quando não vira o ano. */
export function rangeLabel(r: Retrograde): string {
  return yearOf(r.start) === yearOf(r.end)
    ? `${dayMonth(r.start)} a ${dayMonthYear(r.end)}`
    : `${dayMonthYear(r.start)} a ${dayMonthYear(r.end)}`;
}

export function signsLabel(r: Retrograde): string {
  return r.startSign === r.endSign ? r.startSign : `${r.startSign} e ${r.endSign}`;
}

/** Dias inteiros, arredondando para cima, até `date`. */
export function daysUntil(date: Date, now = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / DAY);
}
