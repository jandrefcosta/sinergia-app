import type { Redis } from "@upstash/redis";
import { SITE_URL } from "@/lib/site";
import { SIGNS, type SignName, type Sky } from "@/lib/ephemeris";
import { getForecast, getOrComputeSky } from "@/lib/forecast";
import { publishCarousel, publishImage } from "@/lib/instagram";
import { slugFor } from "@/lib/slugs";

/**
 * O que vai para o Instagram e quando. Usado pelo agendador e pelo /admin.
 *
 *   Stories   um por signo, com a previsão do dia
 *   Céu       um post no feed com a Lua, os aspectos e os retrógrados do dia
 *   Carrossel os doze signos em dois posts (o limite é 10 imagens): Áries a
 *             Virgem e Libra a Peixes, cada um com capa
 *
 * Nunca publica o texto de reserva. Cada post reserva a sua chave no Redis
 * antes de publicar (SET NX), então dois disparos ao mesmo tempo, como um
 * clique duplo no admin ou o agendador junto com um clique, não publicam em
 * dobro. Depois de publicado, a chave guarda o id da mídia por dois dias.
 */

const POSTED_TTL = 2 * 86400;
/** Tempo máximo de uma publicação em andamento; se o processo cair, a trava expira. */
const PENDING_TTL = 10 * 60;
const HASHTAGS = "#horoscopo #astrologia #signos #horoscopododia #mapaastral";

export type PostKind = "ceu" | "carrossel-1" | "carrossel-2";
export const CAROUSEL_PARTS: Record<1 | 2, readonly SignName[]> = { 1: SIGNS.slice(0, 6), 2: SIGNS.slice(6) };

export const postedKeys = {
  story: (period: string, sign: string) => `sinergia:ig:story:${period}:${sign}`,
  post: (period: string, kind: PostKind) => `sinergia:ig:post:${period}:${kind}`,
};

// ─── Textos ─────────────────────────────────────────────────────────────────

export function dateLabel(period: string): string {
  return new Date(`${period}T12:00:00-03:00`)
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })
    .replace("-feira", "");
}

export function weekday(period: string): string {
  return dateLabel(period).split(",")[0];
}

/** Lua, os três aspectos mais exatos (sem a Lua, que muda a cada poucas horas) e os retrógrados. */
export function skyHighlights(sky: Sky) {
  const moon = sky.positions.find((p) => p.planet === "Lua");
  const sun = sky.positions.find((p) => p.planet === "Sol");
  const aspects = sky.aspects
    .filter((a) => a.a !== "Lua" && a.b !== "Lua")
    .sort((x, y) => x.orb - y.orb)
    .slice(0, 3)
    .map((a) => `${a.a} em ${a.type} com ${a.b}`);
  const retrogrades = sky.positions.filter((p) => p.retrograde).map((p) => p.planet);
  return {
    moon: `${sky.moonPhase}, Lua em ${moon?.sign ?? "—"}`,
    sun: sun ? `Sol em ${sun.sign}` : null,
    aspects,
    retrogrades,
  };
}

function skyCaption(period: string, sky: Sky): string {
  const h = skyHighlights(sky);
  const lines = [`O céu de hoje, ${dateLabel(period)}.`, "", `${h.moon}.`];
  if (h.sun) lines.push(`${h.sun}.`);
  lines.push("", ...h.aspects.map((a) => `• ${a}`));
  if (h.retrogrades.length) lines.push("", `Retrógrados: ${h.retrogrades.join(", ")}.`);
  lines.push("", "O que isso muda para o seu signo está no link da bio ✦", "", HASHTAGS);
  return lines.join("\n");
}

function carouselCaption(period: string, part: 1 | 2, signs: readonly SignName[]): string {
  const range = `${signs[0]} a ${signs[signs.length - 1]}`;
  const other = part === 1 ? "Libra a Peixes sai às 18h." : "Áries a Virgem saiu mais cedo, no post anterior.";
  return [
    `O céu de ${weekday(period)}, signo por signo: ${range}. Arraste para ler o seu.`,
    "",
    other,
    "Amor, trabalho e energia de cada signo no link da bio ✦",
    "",
    HASHTAGS,
  ].join("\n");
}

// ─── URLs dos cards ─────────────────────────────────────────────────────────

/** O período vai no caminho: cada dia é uma URL nova, sem risco de cache antigo. */
export function cardUrl(period: string, slide: string): string {
  return `${SITE_URL}/cards/${period}/${slide}`;
}

function storyUrl(period: string, sign: SignName): string {
  return `${SITE_URL}/signo/${slugFor(sign)}/stories?format=jpg&p=${period}`;
}

// ─── Publicação ─────────────────────────────────────────────────────────────

export type PostResult = { status: "posted"; id: string } | { status: "skipped"; reason: string };

/** Reserva a chave, publica e grava o id. Se a publicação falhar, libera a chave. */
async function once(redis: Redis, key: string, publish: () => Promise<string>): Promise<PostResult> {
  const claimed = await redis.set(key, "pending", { nx: true, ex: PENDING_TTL });
  if (!claimed) {
    const current = await redis.get<string>(key);
    return { status: "skipped", reason: current === "pending" ? "publicação em andamento" : "já postado" };
  }
  try {
    const id = await publish();
    await redis.set(key, id, { ex: POSTED_TTL });
    return { status: "posted", id };
  } catch (err) {
    await redis.del(key);
    throw err;
  }
}

export async function postStory(redis: Redis, period: string, sign: SignName): Promise<PostResult> {
  const forecast = await getForecast(sign, redis, period);
  if (forecast.source === "fallback") return { status: "skipped", reason: "texto de reserva" };
  return once(redis, postedKeys.story(period, sign), () => publishImage(redis, storyUrl(period, sign), { story: true }));
}

export async function postSky(redis: Redis, period: string): Promise<PostResult> {
  const sky = await getOrComputeSky(period, redis);
  return once(redis, postedKeys.post(period, "ceu"), () =>
    publishImage(redis, cardUrl(period, "ceu"), { story: false, caption: skyCaption(period, sky) })
  );
}

export async function postCarousel(redis: Redis, period: string, part: 1 | 2): Promise<PostResult> {
  const forecasts = await Promise.all(CAROUSEL_PARTS[part].map((s) => getForecast(s, redis, period)));
  const signs = CAROUSEL_PARTS[part].filter((_, i) => forecasts[i].source !== "fallback");
  if (signs.length < 2) return { status: "skipped", reason: "texto de reserva" };
  const urls = [cardUrl(period, `capa-${part}`), ...signs.map((s) => cardUrl(period, slugFor(s)))];
  return once(redis, postedKeys.post(period, `carrossel-${part}`), () =>
    publishCarousel(redis, urls, carouselCaption(period, part, signs))
  );
}

/** Os doze Stories em ordem. Um signo que falha não impede os outros. */
export async function postAllStories(redis: Redis, period: string) {
  const results: Record<string, string> = {};
  for (const sign of SIGNS) {
    try {
      const r = await postStory(redis, period, sign);
      results[sign] = r.status === "posted" ? "posted" : r.reason;
    } catch (err) {
      console.error(`[instagram] Story de ${sign} falhou:`, err);
      results[sign] = "error";
    }
  }
  return results;
}
