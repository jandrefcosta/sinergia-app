import { NextRequest, NextResponse } from "next/server";
import { isValidBirth, soulmate } from "@/lib/synastry";

/**
 * Sinastria de alma gêmea entre duas datas de nascimento.
 * POST { a: { date, time? }, b: { date, time? } }
 * Calculado na hora com as efemérides; nada é gravado e o modelo não é chamado.
 * POST para as datas não ficarem em URL, log de acesso ou cache.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { a, b } = body as { a?: unknown; b?: unknown };
  if (!isValidBirth(a) || !isValidBirth(b)) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  return NextResponse.json(soulmate(a, b), { headers: { "Cache-Control": "no-store" } });
}
