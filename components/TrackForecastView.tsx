"use client";

import { useEffect } from "react";
import { events } from "@/lib/analytics";

/** Registra a leitura da previsão nas páginas renderizadas no servidor. */
export default function TrackForecastView({ sign, source }: { sign: string; source: string }) {
  useEffect(() => {
    events.forecastViewed(sign, source, "signo");
  }, [sign, source]);
  return null;
}
