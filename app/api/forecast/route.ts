import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SIGN_SYMBOLS: Record<string, string> = {
  Áries: "♈", Touro: "♉", Gêmeos: "♊", Câncer: "♋",
  Leão: "♌", Virgem: "♍", Libra: "♎", Escorpião: "♏",
  Sagitário: "♐", Capricórnio: "♑", Aquário: "♒", Peixes: "♓",
};

const SYSTEM_PROMPT = `Você é um astrólogo poético e sofisticado que escreve previsões diárias para o app Sinergia, voltado ao público brasileiro.

Seu estilo é: editorial, íntimo, inspirador — sem ser genérico. Use metáforas originais, linguagem sensorial, e conecte planetas às emoções humanas de forma concreta.

Retorne APENAS um JSON válido, sem markdown, sem texto extra, com esta estrutura exata:
{
  "planetLine": "string — dois planetas em aspecto, ex: 'Marte em Conjunção · Sol em Harmonia'",
  "quote": "string — previsão poética de 2-3 frases, primeira pessoa do receptor implícita",
  "cards": [
    {
      "icon": "favorite",
      "label": "Amor",
      "text": "string — 1-2 frases concretas sobre vida amorosa hoje",
      "color": "text-primary"
    },
    {
      "icon": "work",
      "label": "Trabalho",
      "text": "string — 1-2 frases concretas sobre carreira/produtividade hoje",
      "color": "text-secondary"
    },
    {
      "icon": "bolt",
      "label": "Energia",
      "text": "string — 1-2 frases concretas sobre energia/saúde hoje",
      "color": "text-tertiary"
    }
  ]
}`;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
}

/** Fingerprint: SHA-256 dos sinais passivos disponíveis no servidor */
function getFingerprint(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const lang = req.headers.get("accept-language")?.split(",")[0] ?? "unknown";
  return createHash("sha256").update(`${ip}|${ua}|${lang}`).digest("hex").slice(0, 32);
}

/**
 * Retorna a data do "período vigente" em Brasília (UTC-3).
 * O dia começa às 06h — antes disso, ainda conta como dia anterior.
 * Formato: YYYY-MM-DD
 */
function getBRTPeriod(): string {
  const now = new Date();
  // Converte para BRT (UTC-3)
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  // Se ainda não passou das 06h, o "dia" é o anterior
  if (brt.getUTCHours() < 6) {
    brt.setUTCDate(brt.getUTCDate() - 1);
  }
  return brt.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Segundos até as 06h00 de Brasília (próximo reset) */
function secondsUntilReset(): number {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  const next6am = new Date(brt);
  next6am.setUTCHours(6, 0, 0, 0);
  if (brt.getUTCHours() >= 6) {
    next6am.setUTCDate(next6am.getUTCDate() + 1);
  }

  // Converte de volta para UTC
  const next6amUTC = new Date(next6am.getTime() + 3 * 60 * 60 * 1000);
  return Math.ceil((next6amUTC.getTime() - now.getTime()) / 1000);
}

export async function POST(req: NextRequest) {
  // 1. Valida o signo antes de qualquer outra operação
  const { sign } = await req.json().catch(() => ({}));

  if (!sign || !SIGN_SYMBOLS[sign]) {
    return NextResponse.json({ error: "Signo inválido" }, { status: 400 });
  }

  const redis = getRedis();
  const period = getBRTPeriod();
  const cacheKey = `sinergia:cache:${sign}:${period}`;

  // 2. Checa cache — previsão já gerada no período vigente: retorna sem consumir slot
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
    }
  }

  // 3. Checa rate limit manual — INCR + EXPIREAT nas 06h00 BRT
  if (redis) {
    const rlKey = `sinergia:rl:${getFingerprint(req)}:${period}`;
    const count = await redis.incr(rlKey);

    // Define TTL apenas na primeira requisição do período
    if (count === 1) {
      await redis.expire(rlKey, secondsUntilReset());
    }

    if (count > 3) {
      return NextResponse.json(
        { error: "Você já consultou os astros 3 vezes hoje. Volte após as 06h00 de amanhã." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }
  }

  // 4. Gera previsão via LLM
  try {
    const todayFormatted = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Sao_Paulo",
    });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Gere a previsão diária para ${sign} (${SIGN_SYMBOLS[sign]}) para ${todayFormatted}. Seja específico ao signo, não genérico.`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    const data = { sign, symbol: SIGN_SYMBOLS[sign], ...JSON.parse(json) };

    // 5. Salva no cache até o próximo reset (06h00 BRT)
    if (redis) {
      await redis.set(cacheKey, data, { ex: secondsUntilReset() });
    }

    return NextResponse.json(data, { headers: { "X-Cache": "MISS" } });
  } catch (err) {
    console.error("[forecast/route]", err);
    return NextResponse.json({ error: "Falha ao gerar previsão" }, { status: 500 });
  }
}
