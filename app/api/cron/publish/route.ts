import { NextRequest, NextResponse } from "next/server";
import { isValidPeriod } from "@/lib/forecast";
import { ServiceUnavailable, publishPeriod } from "@/lib/jobs";

export const maxDuration = 300;

/** Disparo manual: publica o período. Aceita ?period=YYYY-MM-DD. Protegido por CRON_SECRET. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const requested = req.nextUrl.searchParams.get("period");
    const period = isValidPeriod(requested) ? requested : undefined;
    return NextResponse.json(await publishPeriod(period));
  } catch (err) {
    if (err instanceof ServiceUnavailable) {
      return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    }
    console.error("[cron/publish]", err);
    return NextResponse.json({ error: "Falha ao executar" }, { status: 500 });
  }
}
