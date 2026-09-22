import { NextRequest, NextResponse } from "next/server";
import { isValidPeriod } from "@/lib/forecast";
import { ServiceUnavailable, generateDrafts } from "@/lib/jobs";

export const maxDuration = 300;

/** Disparo manual: gera rascunhos. Aceita ?period=YYYY-MM-DD e ?force=1. Protegido por CRON_SECRET. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const requested = req.nextUrl.searchParams.get("period");
    const period = isValidPeriod(requested) ? requested : undefined;
    const force = req.nextUrl.searchParams.get("force") === "1";
    return NextResponse.json(await generateDrafts(period, force));
  } catch (err) {
    if (err instanceof ServiceUnavailable) {
      return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    }
    console.error("[cron/generate]", err);
    return NextResponse.json({ error: "Falha ao executar" }, { status: 500 });
  }
}
