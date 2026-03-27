import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getForecast, getRedis, getBRTPeriod, secondsUntilReset, SIGN_SYMBOLS } from "@/lib/forecast";

function getFingerprint(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const lang = req.headers.get("accept-language")?.split(",")[0] ?? "unknown";
  return createHash("sha256").update(`${ip}|${ua}|${lang}`).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  const { sign } = await req.json().catch(() => ({}));

  if (!sign || !SIGN_SYMBOLS[sign]) {
    return NextResponse.json({ error: "Signo inválido" }, { status: 400 });
  }

  const redis = getRedis();
  const period = getBRTPeriod();
  const cacheKey = `sinergia:cache:${sign}:${period}`;

  // Cache hit — retorna sem consumir slot de rate limit
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
    }
  }

  // Rate limit por usuário
  if (redis) {
    const rlKey = `sinergia:rl:${getFingerprint(req)}:${period}`;
    const count = await redis.incr(rlKey);
    if (count === 1) await redis.expire(rlKey, secondsUntilReset());
    if (count > 3) {
      return NextResponse.json(
        { error: "Você já consultou os astros 3 vezes hoje. Volte após as 06h00 de amanhã." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }
  }

  try {
    const data = await getForecast(sign, redis);
    return NextResponse.json(data, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("[forecast/route]", err);
    return NextResponse.json({ error: "Falha ao gerar previsão" }, { status: 500 });
  }
}
