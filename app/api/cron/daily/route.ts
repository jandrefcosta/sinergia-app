import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getForecast, getRedis, VALID_SIGNS } from "@/lib/forecast";
import { dailyForecastEmailHtml, dailyForecastEmailSubject } from "@/emails/daily-forecast";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function GET(req: NextRequest) {
  // Vercel injeta automaticamente o CRON_SECRET como Bearer token
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const redis = getRedis();
  const resend = getResend();
  if (!redis || !resend) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  // 1. Busca todos os emails cadastrados
  const emails = await redis.zrange("sinergia:emails", 0, -1) as string[];
  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // 2. Busca os perfis em paralelo — filtra quem tem signo
  const profiles = await Promise.all(
    emails.map((email) =>
      redis.hgetall(`sinergia:profile:${email}`) as Promise<{ sign?: string; birthdate?: string } | null>
    )
  );

  // 3. Agrupa emails por signo
  const bySign: Record<string, string[]> = {};
  emails.forEach((email, i) => {
    const sign = profiles[i]?.sign;
    if (!sign || !VALID_SIGNS.includes(sign)) return;
    if (!bySign[sign]) bySign[sign] = [];
    bySign[sign].push(email);
  });

  const signs = Object.keys(bySign);
  if (signs.length === 0) {
    return NextResponse.json({ sent: 0, skipped: emails.length });
  }

  // 4. Gera e envia por signo sequencialmente — evita timeout em paralelo
  const BATCH_SIZE = 50;
  let sent = 0;

  for (const sign of signs) {
    let forecast;
    try {
      forecast = await getForecast(sign, redis);
    } catch (err) {
      console.error(`[cron/daily] Falha ao gerar forecast para ${sign}:`, err);
      continue;
    }

    const targets = bySign[sign];
    for (let j = 0; j < targets.length; j += BATCH_SIZE) {
      const batch = targets.slice(j, j + BATCH_SIZE);
      await resend.batch.send(
        batch.map((email) => ({
          from: "Sinergia <ola@sinergia-astros.app>",
          to: email,
          subject: dailyForecastEmailSubject(forecast.sign, forecast.symbol),
          html: dailyForecastEmailHtml(forecast, email),
        }))
      );
      sent += batch.length;
    }
  }

  const skipped = emails.length - sent;
  console.log(`[cron/daily] sent=${sent} skipped=${skipped}`);
  return NextResponse.json({ sent, skipped });
}
