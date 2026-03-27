import { NextRequest, NextResponse } from "next/server";
import { getForecast, getRedis, VALID_SIGNS } from "@/lib/forecast";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  // 1. Busca todos os emails cadastrados
  const emails = await redis.zrange("sinergia:emails", 0, -1) as string[];
  if (emails.length === 0) {
    return NextResponse.json({ signs: [], ok: 0, errors: 0 });
  }

  // 2. Busca os signos dos perfis em paralelo
  const signs = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );

  // 3. Extrai signos únicos com assinantes
  const activeSignos = [...new Set(
    signs.filter((s): s is string => !!s && VALID_SIGNS.includes(s))
  )];

  if (activeSignos.length === 0) {
    return NextResponse.json({ signs: [], ok: 0, errors: 0 });
  }

  // 4. Gera forecast sequencialmente apenas para signos com assinantes
  const results: Record<string, "ok" | "error"> = {};

  for (const sign of activeSignos) {
    try {
      await getForecast(sign, redis);
      results[sign] = "ok";
    } catch (err) {
      console.error(`[cron/prewarm] Falha ao gerar ${sign}:`, err);
      results[sign] = "error";
    }
  }

  const ok = Object.values(results).filter((v) => v === "ok").length;
  const errors = Object.values(results).filter((v) => v === "error").length;

  console.log(`[cron/prewarm] signs=${activeSignos.length} ok=${ok} errors=${errors}`);
  return NextResponse.json({ signs: activeSignos, results, ok, errors });
}
