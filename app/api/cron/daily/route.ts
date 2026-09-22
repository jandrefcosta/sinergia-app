import { NextRequest, NextResponse } from "next/server";
import { ServiceUnavailable, sendDailyEmails } from "@/lib/jobs";

export const maxDuration = 300;

/** Disparo manual: envia o email diário. Protegido por CRON_SECRET. */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    return NextResponse.json(await sendDailyEmails());
  } catch (err) {
    if (err instanceof ServiceUnavailable) {
      return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
    }
    console.error("[cron/daily]", err);
    return NextResponse.json({ error: "Falha ao executar" }, { status: 500 });
  }
}
