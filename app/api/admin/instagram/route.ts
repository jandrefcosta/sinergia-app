import { NextRequest, NextResponse } from "next/server";
import { getRedis, SITE_URL } from "@/lib/clients";
import { getBRTPeriod, isSign } from "@/lib/forecast";
import { InstagramError, getStatus, publishImage } from "@/lib/instagram";
import { SIGNS } from "@/lib/ephemeris";
import { slugFor } from "@/lib/slugs";

export const maxDuration = 60;

/** Marca o Story já postado no dia, para o admin não repetir. */
const storyKey = (period: string, sign: string) => `sinergia:ig:story:${period}:${sign}`;

function authorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return !!secret && secret === process.env.ADMIN_SECRET;
}

function failure(err: unknown) {
  if (err instanceof InstagramError) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
  console.error("[admin/instagram]", err);
  return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
}

/** Conta conectada e uso do limite diário. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  try {
    const period = getBRTPeriod();
    const [status, posted] = await Promise.all([
      getStatus(redis),
      redis ? Promise.all(SIGNS.map((s) => redis.get<string>(storyKey(period, s)))) : [],
    ]);
    const postedSigns = SIGNS.filter((_, i) => posted[i]);
    return NextResponse.json({ ...status, period, postedSigns });
  } catch (err) {
    return failure(err);
  }
}

/**
 * Publica o Story da previsão de hoje de um signo.
 * body: { sign }
 * Só o dia corrente: o card lê a previsão publicada de hoje.
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { sign } = body as { sign?: unknown };
  if (!isSign(sign)) {
    return NextResponse.json({ error: "Signo inválido" }, { status: 400 });
  }

  const redis = getRedis();
  const period = getBRTPeriod();
  // O período na URL evita que um cache entregue o card de outro dia
  const imageUrl = `${SITE_URL}/signo/${slugFor(sign)}/stories?format=jpg&p=${period}`;
  try {
    const id = await publishImage(redis, imageUrl, { story: true });
    await redis?.set(storyKey(period, sign), id, { ex: 2 * 86400 });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return failure(err);
  }
}
