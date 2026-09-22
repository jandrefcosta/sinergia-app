"use client";

import type { ForecastState } from "@/lib/signs";
import ShareActions from "@/components/ShareActions";

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

      {state.status === "ready" && (
        <>
          <p className="mb-3.5 text-xs uppercase tracking-[0.14em] text-muted">{state.data.planetLine}</p>
          <div className="mb-7 flex items-baseline gap-4">
            <h2 className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">
              {state.data.sign}
            </h2>
            <span className="font-display text-[clamp(30px,7vw,44px)] text-accent" aria-hidden="true">
              {state.data.symbol}
            </span>
          </div>

          <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-11 [text-wrap:pretty]">
            {state.data.quote}
          </p>

          <dl className="border-t border-ink">
            {state.data.cards.map((card) => (
              <div key={card.label} className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-5 border-b border-rule">
                <dt className="font-display italic text-xl text-accent">{card.label}</dt>
                <dd className="text-ink-2">{card.text}</dd>
              </div>
            ))}
          </dl>

          <ShareActions sign={state.data.sign} quote={state.data.quote} />
        </>
      )}
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
