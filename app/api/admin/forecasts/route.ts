import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/clients";
import { SIGNS, type Sky } from "@/lib/ephemeris";
import {
  generateDraft,
  getBRTPeriod,
  getDraft,
  getOrComputeSky,
  getPublished,
  isSign,
  isValidPeriod,
  keys,
  nextPeriod,
  publish,
  saveDraft,
  type Draft,
  type Forecast,
  type Published,
} from "@/lib/forecast";

export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return !!secret && secret === process.env.ADMIN_SECRET;
}

type Row = { sign: string; draft: Draft | null; published: Published | null };

/** Lista rascunhos e publicados de um período. Padrão: próximo período. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const requested = req.nextUrl.searchParams.get("period");
  const period = isValidPeriod(requested) ? requested : nextPeriod();

  const [sky, ...rows] = await Promise.all([
    redis.get<Sky>(keys.sky(period)),
    ...SIGNS.map(async (sign): Promise<Row> => {
      const [draft, published] = await Promise.all([
        getDraft(redis, period, sign),
        getPublished(redis, period, sign),
      ]);
      return { sign, draft, published };
    }),
  ]);

  return NextResponse.json({ period, today: getBRTPeriod(), sky, rows });
}

type Action = "save" | "approve" | "unapprove" | "publish" | "regenerate";

const CARD_LABELS = ["Amor", "Trabalho", "Energia"];

function sanitizeForecast(base: Forecast, input: unknown): Forecast | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Partial<Forecast>;
  const quote = typeof obj.quote === "string" ? obj.quote.trim() : base.quote;
  const planetLine = typeof obj.planetLine === "string" ? obj.planetLine.trim() : base.planetLine;
  const cards = Array.isArray(obj.cards) ? obj.cards : base.cards;
  if (cards.length !== 3 || !quote) return null;
  const merged = base.cards.map((card, i) => ({
    ...card,
    label: CARD_LABELS[i],
    text: typeof cards[i]?.text === "string" && cards[i].text.trim() ? cards[i].text.trim() : card.text,
  }));
  return { ...base, quote, planetLine, cards: merged };
}

/**
 * Ações sobre o rascunho de um signo.
 * body: { period, sign, action, data? }
 */
export async function PUT(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { period, sign, action, data } = body as { period?: unknown; sign?: unknown; action?: Action; data?: unknown };

  if (!isValidPeriod(period) || !isSign(sign)) {
    return NextResponse.json({ error: "Período ou signo inválido" }, { status: 400 });
  }

  try {
    if (action === "regenerate") {
      const sky = await getOrComputeSky(period, redis);
      const draft = await generateDraft(redis, period, sign, sky);
      return NextResponse.json({ ok: true, draft });
    }

    const draft = await getDraft(redis, period, sign);
    if (!draft) {
      return NextResponse.json({ error: "Sem rascunho para este signo" }, { status: 404 });
    }

    if (action === "save" || action === "approve") {
      const merged = data ? sanitizeForecast(draft.data, data) : draft.data;
      if (!merged) {
        return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
      }
      const changed = JSON.stringify(merged) !== JSON.stringify(draft.data);
      const next: Draft = {
        ...draft,
        data: merged,
        status: action === "approve" ? "approved" : draft.status,
        ...(changed ? { editedAt: new Date().toISOString() } : {}),
      };
      await saveDraft(redis, period, sign, next);
      return NextResponse.json({ ok: true, draft: next });
    }

    if (action === "unapprove") {
      const next: Draft = { ...draft, status: "draft" };
      await saveDraft(redis, period, sign, next);
      return NextResponse.json({ ok: true, draft: next });
    }

    if (action === "publish") {
      const published = await publish(redis, period, sign, draft.data, "approved");
      const next: Draft = { ...draft, status: "approved" };
      await saveDraft(redis, period, sign, next);
      return NextResponse.json({ ok: true, draft: next, published });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    console.error("[admin/forecasts]", err);
    return NextResponse.json({ error: "Falha ao processar" }, { status: 500 });
  }
}
