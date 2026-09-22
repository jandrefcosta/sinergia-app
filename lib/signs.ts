/**
 * Dados de signos e tipos da previsão, seguros para o cliente
 * (sem dependência de Redis ou do SDK de geração).
 */

/** Sufixo U+FE0E força apresentação em texto, evitando o emoji colorido do sistema. */
export const TEXT_GLYPH = "︎";

export const SIGN_SYMBOLS: Record<string, string> = {
  Áries: "♈", Touro: "♉", Gêmeos: "♊", Câncer: "♋",
  Leão: "♌", Virgem: "♍", Libra: "♎", Escorpião: "♏",
  Sagitário: "♐", Capricórnio: "♑", Aquário: "♒", Peixes: "♓",
};

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

export type PublishedSource = "approved" | "auto" | "fallback";

export type Published = Forecast & {
  period: string;
  source: PublishedSource;
  publishedAt: string;
};

export type ForecastState =
  | { status: "idle" }
  | { status: "loading"; sign: string }
  | { status: "ready"; sign: string; data: Published }
  | { status: "error"; sign: string; message: string };

/** Busca a previsão publicada do dia para um signo. */
export async function fetchForecast(sign: string): Promise<Published> {
  const res = await fetch(`/api/forecast?sign=${encodeURIComponent(sign)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Não foi possível carregar a previsão. Tente de novo.");
  }
  return res.json();
}
