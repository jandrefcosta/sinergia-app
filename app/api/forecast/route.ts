import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/clients";
import { getForecast, isSign, secondsUntilReset } from "@/lib/forecast";

/**
 * Leitura pública da previsão publicada do dia. Não gera nada sob demanda:
 * o conteúdo vem do cron de geração e publicação (ver lib/forecast.ts).
 */
export async function GET(req: NextRequest) {
  const sign = req.nextUrl.searchParams.get("sign");

  if (!isSign(sign)) {
    return NextResponse.json({ error: "Signo inválido" }, { status: 400 });
  }

  try {
    const data = await getForecast(sign, getRedis());
    const maxAge = Math.min(secondsUntilReset(), 6 * 60 * 60);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=300`,
        "X-Forecast-Source": data.source,
      },
    });
  } catch (err) {
    console.error("[forecast/route]", err);
    return NextResponse.json({ error: "Falha ao consultar os astros" }, { status: 500 });
  }
}
