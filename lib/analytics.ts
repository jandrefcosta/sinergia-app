import { sendGAEvent } from "@next/third-parties/google";

/**
 * Eventos de produto enviados ao Google Analytics 4.
 * Só disparam quando NEXT_PUBLIC_GA_ID está definida; fora disso são no-op.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Params = Record<string, string | number | boolean>;

export function track(event: string, params: Params = {}): void {
  if (!GA_ID || typeof window === "undefined") return;
  try {
    sendGAEvent("event", event, params);
  } catch {
    // analytics nunca deve quebrar a página
  }
}

export const events = {
  signSelected: (sign: string, remembered: boolean) => track("sign_selected", { sign, remembered }),
  forecastViewed: (sign: string, source: string) => track("forecast_viewed", { sign, source }),
  share: (method: "native" | "whatsapp" | "copy", sign: string) => track("share", { method, sign }),
  subscribe: (sign: string) => track("subscribe", { sign }),
  subscribeFailed: (sign: string) => track("subscribe_failed", { sign }),
  unsubscribe: () => track("unsubscribe"),
};
