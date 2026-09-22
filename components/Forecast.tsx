"use client";

import type { ForecastState } from "@/lib/signs";
import ForecastView from "@/components/ForecastView";

type Props = {
  state: ForecastState;
  onRetry: () => void;
};

export default function Forecast({ state, onRetry }: Props) {
  if (state.status === "idle") return null;

  return (
    <section
      id="forecast"
      aria-live="polite"
      aria-busy={state.status === "loading"}
      className="pt-11 pb-10 animate-fade"
      key={state.status === "ready" ? state.data.sign : state.status}
    >
      {state.status === "loading" && <Skeleton sign={state.sign} />}

      {state.status === "error" && (
        <div className="space-y-4">
          <h2 className="font-display font-light text-4xl tracking-tight">{state.sign}</h2>
          <p className="text-ink-2">{state.message}</p>
          <button type="button" onClick={onRetry} className="text-sm font-medium border-b border-rule-strong pb-0.5 hover:border-ink">
            Tentar de novo
          </button>
        </div>
      )}

      {state.status === "ready" && <ForecastView data={state.data} />}
    </section>
  );
}

function Skeleton({ sign }: { sign: string }) {
  return (
    <div className="space-y-7" aria-label={`Carregando a previsão de ${sign}`}>
      <div className="h-3 w-48 rounded bg-rule" />
      <h2 className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em] text-ink-2">
        {sign}
      </h2>
      <div className="space-y-3">
        <div className="h-6 w-full rounded bg-rule" />
        <div className="h-6 w-11/12 rounded bg-rule" />
        <div className="h-6 w-2/3 rounded bg-rule" />
      </div>
      <div className="space-y-5 border-t border-ink pt-5">
        <div className="h-4 w-3/4 rounded bg-rule" />
        <div className="h-4 w-4/5 rounded bg-rule" />
        <div className="h-4 w-2/3 rounded bg-rule" />
      </div>
    </div>
  );
}
