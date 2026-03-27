import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";

const client = new Anthropic();

export const SIGN_SYMBOLS: Record<string, string> = {
  Áries: "♈", Touro: "♉", Gêmeos: "♊", Câncer: "♋",
  Leão: "♌", Virgem: "♍", Libra: "♎", Escorpião: "♏",
  Sagitário: "♐", Capricórnio: "♑", Aquário: "♒", Peixes: "♓",
};

export const VALID_SIGNS = Object.keys(SIGN_SYMBOLS);

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

export type ForecastCard = {
  icon: string;
  label: string;
  text: string;
  color: string;
};

export type Forecast = {
  sign: string;
  symbol: string;
  planetLine: string;
  quote: string;
  cards: ForecastCard[];
};

export function getBRTPeriod(): string {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  if (brt.getUTCHours() < 6) {
    brt.setUTCDate(brt.getUTCDate() - 1);
  }
  return brt.toISOString().slice(0, 10);
}

export function secondsUntilReset(): number {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const next6am = new Date(brt);
  next6am.setUTCHours(6, 0, 0, 0);
  if (brt.getUTCHours() >= 6) {
    next6am.setUTCDate(next6am.getUTCDate() + 1);
  }
  const next6amUTC = new Date(next6am.getTime() + 3 * 60 * 60 * 1000);
  return Math.ceil((next6amUTC.getTime() - now.getTime()) / 1000);
}

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
}

/**
 * Gera (ou retorna do cache) a previsão diária de um signo.
 * Chave compartilhada: sinergia:cache:{sign}:{period}
 */
export async function getForecast(sign: string, redis: Redis | null): Promise<Forecast> {
  const period = getBRTPeriod();
  const cacheKey = `sinergia:cache:${sign}:${period}`;

  if (redis) {
    const cached = await redis.get<Forecast>(cacheKey);
    if (cached) return cached;
  }

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
  const data: Forecast = { sign, symbol: SIGN_SYMBOLS[sign], ...JSON.parse(json) };

  if (redis) {
    await redis.set(cacheKey, data, { ex: secondsUntilReset() });
  }

  return data;
}
