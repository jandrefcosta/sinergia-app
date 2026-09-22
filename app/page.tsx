"use client";

import { useCallback, useEffect, useState } from "react";
import Masthead from "@/components/Masthead";
import Intro from "@/components/Intro";
import SignPicker from "@/components/SignPicker";
import Forecast from "@/components/Forecast";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGN_SYMBOLS, fetchForecast, type ForecastState } from "@/lib/signs";

const STORAGE_KEY = "sinergia-sign";

function readStoredSign(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && SIGN_SYMBOLS[v] ? v : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [sign, setSign] = useState<string | null>(null);
  const [state, setState] = useState<ForecastState>({ status: "idle" });

  const load = useCallback(async (s: string) => {
    setState({ status: "loading", sign: s });
    try {
      const data = await fetchForecast(s);
      setState({ status: "ready", sign: s, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível carregar a previsão.";
      setState({ status: "error", sign: s, message });
    }
  }, []);

  // Visita seguinte: abre direto na previsão do signo lembrado
  useEffect(() => {
    const stored = readStoredSign();
    if (stored) {
      setSign(stored);
      load(stored);
    }
  }, [load]);

  function select(s: string) {
    setSign(s);
    try { localStorage.setItem(STORAGE_KEY, s); } catch {}
    load(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const chosen = sign !== null;

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      {chosen ? (
        <>
          <Forecast state={state} onRetry={() => sign && load(sign)} />
          <SignPicker selected={sign} onSelect={select} />
        </>
      ) : (
        <>
          <Intro />
          <SignPicker selected={sign} onSelect={select} />
        </>
      )}

      <EmailCapture selectedSign={sign} />
      <Footer />
    </div>
  );
}
