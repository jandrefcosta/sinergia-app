import { NextRequest, NextResponse } from "next/server";
import * as Astronomy from "astronomy-engine";
import { signFromLongitude } from "@/lib/ephemeris";
import { slugFor } from "@/lib/slugs";

/**
 * Signo solar exato para uma data de nascimento, pela posição real do Sol.
 * GET /api/sign?date=YYYY-MM-DD[&time=HH:MM]
 * Sem hora, usa meio-dia de Brasília. Em datas de cúspide a hora decide.
 */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const time = req.nextUrl.searchParams.get("time") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Hora inválida" }, { status: 400 });
  }
  const year = Number(date.slice(0, 4));
  if (year < 1900 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "Ano fora do intervalo" }, { status: 400 });
  }

  const instant = new Date(`${date}T${time || "12:00"}:00-03:00`);
  const lon = Astronomy.SunPosition(instant).elon;
  const sign = signFromLongitude(lon);
  const degree = Math.floor(lon % 30);

  // Perto da virada (menos de 1° de qualquer borda) a hora de nascimento importa
  const nearBoundary = degree === 0 || degree === 29;

  return NextResponse.json(
    { sign, slug: slugFor(sign), degree, exact: !!time || !nearBoundary },
    { headers: { "Cache-Control": "public, s-maxage=31536000, immutable" } }
  );
}
