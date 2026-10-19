import { EMAIL_FROM, getRedis, getResend } from "@/lib/clients";
import { SIGNS, type SignName } from "@/lib/ephemeris";
import {
  generateDraft,
  getBRTPeriod,
  getDraft,
  getForecast,
  getOrComputeSky,
  getPublished,
  isSign,
  nextPeriod,
  publishFromDraft,
} from "@/lib/forecast";
import {
  LAST_DAILY_KEY,
  dailySlots,
  dailyTierSize,
  getUsage,
  sendWithinQuota,
  weeklyDay,
  type DailySummary,
} from "@/lib/email-quota";
import type { Forecast } from "@/lib/signs";
import { dailyForecastEmailHtml, dailyForecastEmailSubject } from "@/emails/daily-forecast";
import { nudgeProfileEmailHtml, nudgeProfileEmailSubject } from "@/emails/nudge-profile";
import { instagramUserId, refreshToken } from "@/lib/instagram";
import { postAllStories, postCarousel, postSky } from "@/lib/instagram-content";

/**
 * Tarefas agendadas. São chamadas pelo agendador interno (instrumentation.ts)
 * e também pelas rotas /api/cron/* para disparo manual.
 */

export class ServiceUnavailable extends Error {}

/** Gera os rascunhos de um período (padrão: dia seguinte), sem sobrescrever os existentes. */
export async function generateDrafts(period = nextPeriod(), force = false) {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");

  const sky = await getOrComputeSky(period, redis);
  const results: Record<string, "ok" | "kept" | "error"> = {};

  // Quatro signos por vez: uma chamada pode levar mais de um minuto em horários de pico.
  const CONCURRENCY = 4;
  const queue = [...SIGNS];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let sign = queue.shift(); sign; sign = queue.shift()) {
        try {
          if (!force && (await getDraft(redis, period, sign))) {
            results[sign] = "kept";
            continue;
          }
          await generateDraft(redis, period, sign, sky);
          results[sign] = "ok";
        } catch (err) {
          console.error(`[jobs/generate] Falha ao gerar ${sign} para ${period}:`, err);
          results[sign] = "error";
        }
      }
    })
  );

  const count = (v: string) => Object.values(results).filter((r) => r === v).length;
  const summary = { period, results, ok: count("ok"), kept: count("kept"), errors: count("error") };
  console.log(`[jobs/generate] period=${period} ok=${summary.ok} kept=${summary.kept} errors=${summary.errors}`);
  return summary;
}

/** Publica as previsões de um período (padrão: hoje). Idempotente. */
export async function publishPeriod(period = getBRTPeriod()) {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");

  const results: Record<string, string> = {};
  for (const sign of SIGNS) {
    try {
      const existing = await getPublished(redis, period, sign);
      if (existing) {
        results[sign] = `already:${existing.source}`;
        continue;
      }
      const published = await publishFromDraft(redis, period, sign);
      results[sign] = published.source;
    } catch (err) {
      console.error(`[jobs/publish] Falha ao publicar ${sign} para ${period}:`, err);
      results[sign] = "error";
    }
  }
  console.log(`[jobs/publish] period=${period}`, results);
  return { period, results };
}

/**
 * Envia a previsão publicada de hoje para cada assinante com signo.
 * Dentro da cota do Resend: os inscritos mais antigos recebem todo dia,
 * os mais novos uma vez por semana (ver lib/email-quota.ts).
 */
export async function sendDailyEmails(period = getBRTPeriod()) {
  const redis = getRedis();
  const resend = getResend();
  if (!redis || !resend) throw new ServiceUnavailable("Redis ou Resend indisponível");

  // Ordem de cadastro: os mais antigos primeiro
  const emails = (await redis.zrange("sinergia:emails", 0, -1)) as string[];
  if (emails.length === 0) return { sent: 0, skipped: 0 };

  const profiles = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );
  const subscribers: { email: string; sign: SignName }[] = [];
  emails.forEach((email, i) => {
    const sign = profiles[i];
    if (isSign(sign)) subscribers.push({ email, sign });
  });

  const dailyTier = dailyTierSize(subscribers.length, dailySlots(await getUsage(redis)));
  const weekday = new Date(`${period}T12:00:00Z`).getUTCDay();
  const daily = subscribers.slice(0, dailyTier);
  const weekly = subscribers.slice(dailyTier).filter(({ email }) => weeklyDay(email) === weekday);

  const forecasts = new Map<SignName, Forecast | null>();
  async function forecastFor(sign: SignName) {
    if (!forecasts.has(sign)) {
      try {
        forecasts.set(sign, await getForecast(sign, redis!));
      } catch (err) {
        console.error(`[jobs/daily] Falha ao obter forecast para ${sign}:`, err);
        forecasts.set(sign, null);
      }
    }
    return forecasts.get(sign)!;
  }

  async function messages(list: typeof subscribers, isWeekly: boolean) {
    const out = [];
    for (const { email, sign } of list) {
      const forecast = await forecastFor(sign);
      if (!forecast) continue;
      out.push({
        from: EMAIL_FROM,
        to: email,
        subject: dailyForecastEmailSubject(forecast.sign, forecast.symbol),
        html: dailyForecastEmailHtml(forecast, email, { weekly: isWeekly }),
      });
    }
    return out;
  }

  // Os diários vão primeiro: se a cota acabar no meio, quem fica de fora é o semanal
  const dailyResult = await sendWithinQuota(redis, resend, await messages(daily, false));
  const weeklyResult = await sendWithinQuota(redis, resend, await messages(weekly, true));

  const summary: DailySummary = {
    period,
    subscribers: subscribers.length,
    dailyTier,
    sentDaily: dailyResult.sent,
    sentWeekly: weeklyResult.sent,
    blocked: dailyResult.blocked + weeklyResult.blocked,
    skipped: emails.length - subscribers.length,
  };
  await redis.set(LAST_DAILY_KEY, summary, { ex: 40 * 86400 });
  if (summary.blocked > 0) console.warn(`[jobs/daily] cota do Resend esgotada: ${summary.blocked} ficaram sem email`);
  console.log("[jobs/daily]", summary);
  return { ...summary, sent: summary.sentDaily + summary.sentWeekly };
}

/** Lembra quem cadastrou email mas ainda não escolheu o signo. */
export async function sendWeeklyNudges() {
  const redis = getRedis();
  const resend = getResend();
  if (!redis || !resend) throw new ServiceUnavailable("Redis ou Resend indisponível");

  const emails = (await redis.zrange("sinergia:emails", 0, -1)) as string[];
  if (emails.length === 0) return { sent: 0, skipped: 0 };

  const signs = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );
  const targets = emails.filter((_, i) => !signs[i]);

  const { sent, blocked } = await sendWithinQuota(
    redis,
    resend,
    targets.map((email) => ({
      from: EMAIL_FROM,
      to: email,
      subject: nudgeProfileEmailSubject,
      html: nudgeProfileEmailHtml(email),
    }))
  );

  const summary = { sent, blocked, skipped: emails.length - targets.length };
  console.log(`[jobs/weekly] sent=${summary.sent} blocked=${summary.blocked} skipped=${summary.skipped}`);
  return summary;
}

/** Renova o token do Instagram. Sem credenciais configuradas, não faz nada. */
export async function refreshInstagramToken() {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");
  if (!instagramUserId()) return { skipped: true };
  const stored = await refreshToken(redis);
  console.log(`[jobs/instagram] token renovado, vence em ${stored.expiresAt}`);
  return { expiresAt: stored.expiresAt };
}

/**
 * Postagens automáticas no Instagram. Só rodam com INSTAGRAM_AUTOPOST=1.
 * Publicam o que estiver no ar, aprovado ou não; o texto de reserva nunca sai.
 */
function instagramReady(): boolean {
  return process.env.INSTAGRAM_AUTOPOST === "1" && !!instagramUserId();
}

export async function postInstagramStories(period = getBRTPeriod()) {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");
  if (!instagramReady()) return { skipped: true };
  const results = await postAllStories(redis, period);
  console.log(`[jobs/instagram] stories period=${period}`, results);
  return { period, results };
}

export async function postInstagramSky(period = getBRTPeriod()) {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");
  if (!instagramReady()) return { skipped: true };
  const result = await postSky(redis, period);
  console.log(`[jobs/instagram] céu period=${period}`, result);
  return { period, result };
}

export async function postInstagramCarousel(part: 1 | 2, period = getBRTPeriod()) {
  const redis = getRedis();
  if (!redis) throw new ServiceUnavailable("Redis indisponível");
  if (!instagramReady()) return { skipped: true };
  const result = await postCarousel(redis, period, part);
  console.log(`[jobs/instagram] carrossel-${part} period=${period}`, result);
  return { period, result };
}
