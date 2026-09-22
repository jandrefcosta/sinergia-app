import { EMAIL_FROM, getRedis, getResend } from "@/lib/clients";
import { SIGNS } from "@/lib/ephemeris";
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
import { dailyForecastEmailHtml, dailyForecastEmailSubject } from "@/emails/daily-forecast";
import { nudgeProfileEmailHtml, nudgeProfileEmailSubject } from "@/emails/nudge-profile";

/**
 * Tarefas agendadas. São chamadas pelo agendador interno (instrumentation.ts)
 * e também pelas rotas /api/cron/* para disparo manual.
 */

export class ServiceUnavailable extends Error {}

const BATCH_SIZE = 50;

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

/** Envia a previsão publicada de hoje para cada assinante com signo. */
export async function sendDailyEmails() {
  const redis = getRedis();
  const resend = getResend();
  if (!redis || !resend) throw new ServiceUnavailable("Redis ou Resend indisponível");

  const emails = (await redis.zrange("sinergia:emails", 0, -1)) as string[];
  if (emails.length === 0) return { sent: 0, skipped: 0 };

  const profiles = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );

  const bySign: Record<string, string[]> = {};
  emails.forEach((email, i) => {
    const sign = profiles[i];
    if (!isSign(sign)) return;
    (bySign[sign] ??= []).push(email);
  });

  let sent = 0;
  for (const sign of Object.keys(bySign)) {
    if (!isSign(sign)) continue;
    let forecast;
    try {
      forecast = await getForecast(sign, redis);
    } catch (err) {
      console.error(`[jobs/daily] Falha ao obter forecast para ${sign}:`, err);
      continue;
    }
    const targets = bySign[sign];
    for (let j = 0; j < targets.length; j += BATCH_SIZE) {
      const batch = targets.slice(j, j + BATCH_SIZE);
      await resend.batch.send(
        batch.map((email) => ({
          from: EMAIL_FROM,
          to: email,
          subject: dailyForecastEmailSubject(forecast.sign, forecast.symbol),
          html: dailyForecastEmailHtml(forecast, email),
        }))
      );
      sent += batch.length;
    }
  }

  const summary = { sent, skipped: emails.length - sent };
  console.log(`[jobs/daily] sent=${summary.sent} skipped=${summary.skipped}`);
  return summary;
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

  let sent = 0;
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    await resend.batch.send(
      batch.map((email) => ({
        from: EMAIL_FROM,
        to: email,
        subject: nudgeProfileEmailSubject,
        html: nudgeProfileEmailHtml(email),
      }))
    );
    sent += batch.length;
  }

  const summary = { sent, skipped: emails.length - sent };
  console.log(`[jobs/weekly] sent=${summary.sent} skipped=${summary.skipped}`);
  return summary;
}
