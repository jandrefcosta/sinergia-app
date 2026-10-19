import type { Redis } from "@upstash/redis";
import type { CreateBatchEmailOptions, Resend } from "resend";

/**
 * Cota do Resend no plano gratuito: 3.000 emails por mês e 100 por dia.
 * Passando disso o Resend recusa os envios sem avisar ninguém, então cada
 * destinatário é contado no Redis antes de sair. Dias e meses em UTC, uma
 * aproximação do ciclo do Resend; a folga diária cobre a diferença.
 */

export const MONTHLY_LIMIT = Number(process.env.RESEND_MONTHLY_LIMIT) || 3000;
export const DAILY_LIMIT = Number(process.env.RESEND_DAILY_LIMIT) || 100;
/** Fica livre todo dia para boas-vindas e lembretes, fora do email diário. */
const HEADROOM = 10;
/** A partir daqui o admin mostra o alerta. */
export const WARN_RATIO = 0.8;

const BATCH_SIZE = 50;

/** Último envio diário, para o painel do admin. */
export const LAST_DAILY_KEY = "sinergia:email:last-daily";

export type DailySummary = {
  period: string;
  subscribers: number;
  dailyTier: number;
  sentDaily: number;
  sentWeekly: number;
  blocked: number;
  skipped: number;
};

const utcDay = (d: Date) => d.toISOString().slice(0, 10);
const monthKey = (d: Date) => `sinergia:email-count:${utcDay(d).slice(0, 7)}`;
const dayKey = (d: Date) => `sinergia:email-count:${utcDay(d)}`;

export type EmailUsage = { month: number; day: number; monthLimit: number; dayLimit: number };

export async function getUsage(redis: Redis, now = new Date()): Promise<EmailUsage> {
  const [month, day] = await Promise.all([redis.get<number>(monthKey(now)), redis.get<number>(dayKey(now))]);
  return { month: Number(month) || 0, day: Number(day) || 0, monthLimit: MONTHLY_LIMIT, dayLimit: DAILY_LIMIT };
}

/** Reserva até n envios e devolve quantos cabem na cota. */
export async function reserveEmails(redis: Redis, n: number, now = new Date()): Promise<number> {
  if (n <= 0) return 0;
  const [month, , day] = await redis
    .pipeline()
    .incrby(monthKey(now), n)
    .expire(monthKey(now), 40 * 86400)
    .incrby(dayKey(now), n)
    .expire(dayKey(now), 2 * 86400)
    .exec<[number, number, number, number]>();
  const over = Math.max(month - MONTHLY_LIMIT, day - DAILY_LIMIT, 0);
  const allowed = Math.max(n - over, 0);
  if (allowed < n) await releaseEmails(redis, n - allowed, now);
  return allowed;
}

/** Devolve envios reservados que não saíram. */
export async function releaseEmails(redis: Redis, n: number, now = new Date()): Promise<void> {
  if (n <= 0) return;
  await Promise.all([redis.decrby(monthKey(now), n), redis.decrby(dayKey(now), n)]);
}

/**
 * Envia em lotes de 50 (limite do batch do Resend) até onde a cota deixar,
 * na ordem recebida. Devolve quantos saíram; o resto fica de fora.
 */
export async function sendWithinQuota(
  redis: Redis,
  resend: Resend,
  messages: CreateBatchEmailOptions[]
): Promise<{ sent: number; blocked: number }> {
  let sent = 0;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    const allowed = await reserveEmails(redis, batch.length);
    if (allowed === 0) break;
    const { error } = await resend.batch.send(batch.slice(0, allowed));
    if (error) {
      await releaseEmails(redis, allowed);
      console.error("[email-quota] Falha no envio em lote:", error);
      continue;
    }
    sent += allowed;
    if (allowed < batch.length) break;
  }
  return { sent, blocked: messages.length - sent };
}

/**
 * Quantos destinatários por dia cabem no que resta do mês, já descontada
 * a folga para os emails avulsos.
 */
export function dailySlots(usage: EmailUsage, now = new Date()): number {
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const daysLeft = daysInMonth - now.getUTCDate() + 1;
  const byMonth = Math.floor((usage.monthLimit - usage.month) / daysLeft) - HEADROOM;
  const byDay = usage.dayLimit - usage.day - HEADROOM;
  return Math.max(0, Math.min(byMonth, byDay));
}

/**
 * Quantos dos inscritos (os mais antigos) recebem todo dia. Os demais
 * recebem uma vez por semana, cada um num dia fixo, o que gasta 1/7 de
 * vaga por pessoa: d + (n − d) / 7 ≤ vagas.
 */
export function dailyTierSize(subscribers: number, slots: number): number {
  if (subscribers <= slots) return subscribers;
  return Math.max(0, Math.floor((7 * slots - subscribers) / 6));
}

/** Dia da semana (0 = domingo) em que um inscrito do grupo semanal recebe. */
export function weeklyDay(email: string): number {
  let sum = 0;
  for (const ch of email) sum += ch.charCodeAt(0);
  return sum % 7;
}
