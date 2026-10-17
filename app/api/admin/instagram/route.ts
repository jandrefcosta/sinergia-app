import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/clients";
import { SIGNS } from "@/lib/ephemeris";
import { getBRTPeriod, isSign } from "@/lib/forecast";
import { InstagramError, getStatus } from "@/lib/instagram";
import { postCarousel, postSky, postStory, postedKeys, type PostKind, type PostResult } from "@/lib/instagram-content";

export const maxDuration = 120;

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

const KINDS: PostKind[] = ["ceu", "carrossel-1", "carrossel-2"];

/** Conta conectada, uso do limite diário e o que já saiu hoje. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }
  try {
    const period = getBRTPeriod();
    const [status, stories, posts] = await Promise.all([
      getStatus(redis),
      Promise.all(SIGNS.map((s) => redis.get<string>(postedKeys.story(period, s)))),
      Promise.all(KINDS.map((k) => redis.get<string>(postedKeys.post(period, k)))),
    ]);
    return NextResponse.json({
      ...status,
      period,
      autopost: process.env.INSTAGRAM_AUTOPOST === "1",
      postedSigns: SIGNS.filter((_, i) => stories[i]),
      postedKinds: KINDS.filter((_, i) => posts[i]),
    });
  } catch (err) {
    return failure(err);
  }
}

/**
 * Publica um item de hoje.
 * body: { sign } para o Story de um signo, ou { kind: "ceu" | "carrossel-1" | "carrossel-2" }
 */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const { sign, kind } = body as { sign?: unknown; kind?: unknown };
  const period = getBRTPeriod();

  try {
    let result: PostResult;
    if (isSign(sign)) result = await postStory(redis, period, sign);
    else if (kind === "ceu") result = await postSky(redis, period);
    else if (kind === "carrossel-1") result = await postCarousel(redis, period, 1);
    else if (kind === "carrossel-2") result = await postCarousel(redis, period, 2);
    else return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });

    if (result.status === "skipped") {
      return NextResponse.json({ error: `Não publicado: ${result.reason}` }, { status: 409 });
    }
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    return failure(err);
  }
}
