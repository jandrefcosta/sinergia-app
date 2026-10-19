import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/clients";
import { isSign } from "@/lib/forecast";
import { LAST_DAILY_KEY, WARN_RATIO, dailySlots, dailyTierSize, getUsage, type DailySummary } from "@/lib/email-quota";

/** Uso da cota do Resend e divisão dos inscritos entre diário e semanal. */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const [usage, emails, last] = await Promise.all([
    getUsage(redis),
    redis.zrange("sinergia:emails", 0, -1) as Promise<string[]>,
    redis.get<DailySummary>(LAST_DAILY_KEY),
  ]);
  const signs = await Promise.all(emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign")));
  const withSign = signs.filter(isSign).length;
  const dailyTier = dailyTierSize(withSign, dailySlots(usage));

  return NextResponse.json({
    usage,
    warnRatio: WARN_RATIO,
    subscribers: emails.length,
    withSign,
    dailyTier,
    last,
  });
}
