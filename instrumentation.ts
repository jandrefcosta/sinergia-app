/**
 * Agendador interno. Roda no processo do servidor Next (Node) quando
 * ENABLE_SCHEDULER=1. Substitui os crons da Vercel no Railway.
 *
 * Horários em America/Sao_Paulo:
 *   21:00       gera rascunhos do dia seguinte
 *   06:05       publica o dia
 *   07:00       envia o email diário
 *   seg 08:00   lembrete para quem não escolheu signo
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_SCHEDULER !== "1") return;

  const { Cron } = await import("croner");
  const jobs = await import("@/lib/jobs");
  const tz = "America/Sao_Paulo";

  const run = (name: string, fn: () => Promise<unknown>) => async () => {
    console.log(`[scheduler] ${name} iniciando`);
    try {
      await fn();
    } catch (err) {
      console.error(`[scheduler] ${name} falhou:`, err);
    }
  };

  // protect: true evita sobreposição se uma execução ainda estiver rodando
  new Cron("0 21 * * *", { timezone: tz, protect: true }, run("generate", () => jobs.generateDrafts()));
  new Cron("5 6 * * *", { timezone: tz, protect: true }, run("publish", () => jobs.publishPeriod()));
  new Cron("0 7 * * *", { timezone: tz, protect: true }, run("daily", () => jobs.sendDailyEmails()));
  new Cron("0 8 * * 1", { timezone: tz, protect: true }, run("weekly", () => jobs.sendWeeklyNudges()));

  console.log("[scheduler] ativo (America/Sao_Paulo)");
}
