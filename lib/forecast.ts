import { z } from "zod";
import { ThinkingLevel } from "@google/genai";
import type { Redis } from "@upstash/redis";
import { getGemini } from "@/lib/clients";
import {
  computeSky,
  describeSky,
  describeSkyForSign,
  planetLineFor,
  skyDateForPeriod,
  SIGNS,
  type Sky,
  type SignName,
} from "@/lib/ephemeris";
import { FALLBACK_FORECASTS } from "@/lib/fallback";

/*
 * Fluxo de uma previsão:
 *
 *   cron/generate (21h BRT, véspera)  →  rascunho por signo   sinergia:draft:{period}:{sign}
 *   admin (opcional)                  →  edita / aprova        status: "draft" | "approved"
 *   cron/publish (06h05 BRT)          →  publicado             sinergia:published:{period}:{sign}
 *   site + email                      →  só leem o publicado
 *
 * Se nada foi publicado quando o site pede, o rascunho é promovido na hora.
 * Se nem rascunho existe, entra o texto de reserva do signo.
 */

export { SIGN_SYMBOLS } from "@/lib/signs";
export type { Forecast, ForecastCard, Published, PublishedSource } from "@/lib/signs";
import { SIGN_SYMBOLS } from "@/lib/signs";
import type { Forecast, Published, PublishedSource } from "@/lib/signs";

export const VALID_SIGNS: string[] = [...SIGNS];

export function isSign(value: unknown): value is SignName {
  return typeof value === "string" && (SIGNS as readonly string[]).includes(value);
}

export type DraftStatus = "draft" | "approved";

export type Draft = {
  data: Forecast;
  status: DraftStatus;
  generatedAt: string;
  editedAt?: string;
  model: string;
};

// ─── Períodos (dia em BRT, virando às 06h00) ────────────────────────────────

const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function periodFor(date: Date): string {
  const brt = new Date(date.getTime() - BRT_OFFSET_MS);
  if (brt.getUTCHours() < 6) brt.setUTCDate(brt.getUTCDate() - 1);
  return brt.toISOString().slice(0, 10);
}

export function getBRTPeriod(): string {
  return periodFor(new Date());
}

export function nextPeriod(from: string = getBRTPeriod()): string {
  const d = new Date(`${from}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function isValidPeriod(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
}

export function secondsUntilReset(): number {
  const now = new Date();
  const brt = new Date(now.getTime() - BRT_OFFSET_MS);
  const next6am = new Date(brt);
  next6am.setUTCHours(6, 0, 0, 0);
  if (brt.getUTCHours() >= 6) next6am.setUTCDate(next6am.getUTCDate() + 1);
  const next6amUTC = new Date(next6am.getTime() + BRT_OFFSET_MS);
  return Math.ceil((next6amUTC.getTime() - now.getTime()) / 1000);
}

// ─── Chaves Redis ───────────────────────────────────────────────────────────

export const keys = {
  sky: (period: string) => `sinergia:sky:${period}`,
  draft: (period: string, sign: string) => `sinergia:draft:${period}:${sign}`,
  published: (period: string, sign: string) => `sinergia:published:${period}:${sign}`,
};

const DRAFT_TTL = 7 * 24 * 60 * 60;
const PUBLISHED_TTL = 30 * 24 * 60 * 60;

// ─── Geração com o modelo ───────────────────────────────────────────────────

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

const SYSTEM_PROMPT = `Você escreve a previsão diária de um signo para o Sinergia, um app brasileiro de horóscopo com tom editorial, íntimo e inspirador.

Você recebe os fatos astrológicos do dia já calculados: posições dos planetas, fase da Lua e aspectos. Escreva apenas a partir desses fatos. Não invente aspectos, planetas em signos ou trânsitos que não estejam na lista. Cite no máximo dois ou três fatos, escolhendo os que mais tocam o signo (regente, planetas no signo, aspectos do regente, Lua).

Estilo: português do Brasil, segunda pessoa (você), frases curtas, metáforas concretas e originais, sem clichês de horóscopo e sem promessas de eventos específicos. Não use travessão. Não use a palavra "hoje" mais de uma vez por campo.

Campos:
- quote: a leitura do dia em duas ou três frases, no máximo 320 caracteres.
- amor: uma ou duas frases sobre relações, no máximo 180 caracteres.
- trabalho: uma ou duas frases sobre trabalho e produtividade, no máximo 180 caracteres.
- energia: uma ou duas frases sobre energia e corpo, no máximo 180 caracteres.`;

const ForecastOutput = z.object({
  quote: z.string(),
  amor: z.string(),
  trabalho: z.string(),
  energia: z.string(),
});

// Gemini aceita um subconjunto de JSON Schema; o campo $schema é removido.
const { $schema: _ignored, ...OUTPUT_SCHEMA } = z.toJSONSchema(ForecastOutput);

const LIMITS = { quote: 320, amor: 180, trabalho: 180, energia: 180 } as const;

function withinLimits(out: z.infer<typeof ForecastOutput>): boolean {
  return (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).every(
    (k) => out[k].trim().length > 0 && out[k].length <= LIMITS[k] * 1.15
  );
}

function formatPeriod(period: string): string {
  return skyDateForPeriod(period).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
}

export function toForecast(sign: SignName, planetLine: string, out: z.infer<typeof ForecastOutput>): Forecast {
  return {
    sign,
    symbol: SIGN_SYMBOLS[sign],
    planetLine,
    quote: out.quote.trim(),
    cards: [
      { icon: "favorite", label: "Amor", text: out.amor.trim(), color: "text-primary" },
      { icon: "work", label: "Trabalho", text: out.trabalho.trim(), color: "text-secondary" },
      { icon: "bolt", label: "Energia", text: out.energia.trim(), color: "text-tertiary" },
    ],
  };
}

/** Gera o texto de um signo a partir do céu do período. Até três tentativas com espera. */
export async function generateForecastText(sign: SignName, period: string, sky: Sky): Promise<Forecast> {
  const ai = getGemini();
  const userContent = [
    `Signo: ${sign}. Data: ${formatPeriod(period)}.`,
    "",
    "Fatos que tocam este signo:",
    describeSkyForSign(sky, sign),
    "",
    "Céu completo do dia:",
    describeSky(sky),
  ].join("\n");

  // Três tentativas com espera crescente: cobre 503 de demanda e saídas fora do formato.
  const BACKOFF_MS = [0, 3000, 8000];
  let lastError: unknown = null;
  for (let attempt = 0; attempt < BACKOFF_MS.length; attempt++) {
    if (BACKOFF_MS[attempt]) await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: userContent,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: OUTPUT_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          maxOutputTokens: 2000,
          temperature: 0.9,
        },
      });
      const text = response.text;
      if (!text) throw new Error(`Resposta vazia para ${sign}`);
      const parsed = ForecastOutput.safeParse(JSON.parse(text));
      if (parsed.success && withinLimits(parsed.data)) {
        return toForecast(sign, planetLineFor(sky, sign), parsed.data);
      }
      lastError = new Error(`Saída fora do formato ou dos limites para ${sign}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ─── Céu do período (calculado uma vez, guardado para o admin) ──────────────

export async function getOrComputeSky(period: string, redis: Redis | null): Promise<Sky> {
  if (redis) {
    const cached = await redis.get<Sky>(keys.sky(period));
    if (cached) return cached;
  }
  const sky = computeSky(skyDateForPeriod(period));
  if (redis) await redis.set(keys.sky(period), sky, { ex: PUBLISHED_TTL });
  return sky;
}

// ─── Rascunhos ──────────────────────────────────────────────────────────────

export async function getDraft(redis: Redis, period: string, sign: string): Promise<Draft | null> {
  return redis.get<Draft>(keys.draft(period, sign));
}

export async function saveDraft(redis: Redis, period: string, sign: string, draft: Draft): Promise<void> {
  await redis.set(keys.draft(period, sign), draft, { ex: DRAFT_TTL });
}

/** Gera e grava o rascunho de um signo. Sobrescreve rascunho existente. */
export async function generateDraft(redis: Redis, period: string, sign: SignName, sky: Sky): Promise<Draft> {
  const data = await generateForecastText(sign, period, sky);
  const draft: Draft = {
    data,
    status: "draft",
    generatedAt: new Date().toISOString(),
    model: MODEL,
  };
  await saveDraft(redis, period, sign, draft);
  return draft;
}

// ─── Publicação ─────────────────────────────────────────────────────────────

export async function getPublished(redis: Redis, period: string, sign: string): Promise<Published | null> {
  return redis.get<Published>(keys.published(period, sign));
}

export async function publish(
  redis: Redis,
  period: string,
  sign: string,
  data: Forecast,
  source: PublishedSource
): Promise<Published> {
  const published: Published = {
    ...data,
    period,
    source,
    publishedAt: new Date().toISOString(),
  };
  await redis.set(keys.published(period, sign), published, { ex: PUBLISHED_TTL });
  return published;
}

/**
 * Promove o rascunho de um signo para publicado.
 * Rascunho aprovado → "approved"; rascunho sem aprovação → "auto";
 * sem rascunho → texto de reserva, "fallback".
 */
export async function publishFromDraft(redis: Redis, period: string, sign: SignName): Promise<Published> {
  const draft = await getDraft(redis, period, sign);
  if (draft) {
    return publish(redis, period, sign, draft.data, draft.status === "approved" ? "approved" : "auto");
  }
  return publish(redis, period, sign, FALLBACK_FORECASTS[sign], "fallback");
}

/**
 * Leitura usada pelo site e pelo email: o publicado do período.
 * Se ainda não houver, promove o rascunho ou o texto de reserva na hora.
 * Sem Redis, devolve o texto de reserva sem persistir.
 */
export async function getForecast(sign: SignName, redis: Redis | null, period = getBRTPeriod()): Promise<Published> {
  if (!redis) {
    return { ...FALLBACK_FORECASTS[sign], period, source: "fallback", publishedAt: new Date().toISOString() };
  }
  const existing = await getPublished(redis, period, sign);
  if (existing) return existing;
  return publishFromDraft(redis, period, sign);
}
