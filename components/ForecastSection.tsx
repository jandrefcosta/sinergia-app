"use client";

import { useEffect, useState } from "react";
import { getTodayFormatted } from "@/lib/utils";
import type { ForecastState } from "@/lib/forecasts";

// ─── Skeleton shimmer ────────────────────────────────────────────────────────

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-surface-container-high animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

function ForecastSkeleton() {
  return (
    <div
      className="relative p-6 md:p-8 rounded-2xl bg-primary-container/20 overflow-hidden space-y-6"
      aria-label="Carregando previsão..."
      aria-busy="true"
    >
      {/* Planet label skeleton */}
      <SkeletonLine className="h-3 w-48 opacity-40" />

      {/* Quote skeletons */}
      <div className="space-y-3">
        <SkeletonLine className="h-7 w-full opacity-30" />
        <SkeletonLine className="h-7 w-5/6 opacity-30" />
        <SkeletonLine className="h-7 w-4/6 opacity-30" />
      </div>

      <div className="horizontal-fade" />

      {/* Cards skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-surface-variant/30 space-y-3"
          >
            <SkeletonLine className="h-6 w-6 rounded-full opacity-40" />
            <SkeletonLine className="h-3 w-16 opacity-30" />
            <SkeletonLine className="h-4 w-full opacity-20" />
            <SkeletonLine className="h-4 w-3/4 opacity-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Idle / empty state ──────────────────────────────────────────────────────

function ForecastIdle() {
  return (
    <div
      className="relative p-8 md:p-10 rounded-2xl bg-primary-container/10 border border-outline-variant/10 overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[280px] text-center"
      aria-label="Aguardando seleção de signo"
    >
      {/* Ambient blobs */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-8 bottom-0 w-36 h-36 bg-primary-container/20 rounded-full blur-[60px] pointer-events-none"
        aria-hidden="true"
      />

      <span
        className="material-symbols-outlined text-5xl text-primary/20 animate-pulse-subtle"
        aria-hidden="true"
      >
        auto_awesome
      </span>

      <div className="space-y-2 relative z-10">
        <p className="font-headline text-2xl italic text-on-surface/40">
          O cosmos aguarda sua consulta
        </p>
        <p className="font-label text-xs text-outline/50 uppercase tracking-widest">
          Selecione seu signo e gere sua previsão
        </p>
      </div>
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────

function ForecastError({ message }: { message: string }) {
  return (
    <div
      className="relative p-8 rounded-2xl bg-error-container/20 border border-error/20 overflow-hidden flex flex-col items-center justify-center gap-4 min-h-[200px] text-center"
      role="alert"
    >
      <span
        className="material-symbols-outlined text-4xl text-error/60"
        aria-hidden="true"
      >
        error
      </span>
      <div className="space-y-1">
        <p className="font-headline text-lg italic text-on-surface/70">{message}</p>
        <p className="font-label text-[10px] uppercase tracking-widest text-outline/50">
          3 consultas gratuitas por dia · renova à meia-noite
        </p>
      </div>
    </div>
  );
}

// ─── Ready state ─────────────────────────────────────────────────────────────

type ReadyProps = {
  sign: string;
  name: string;
  data: NonNullable<Extract<ForecastState, { status: "ready" }>["data"]>;
};

function ForecastReady({ sign, name, data }: ReadyProps) {
  return (
    <div
      className="relative p-6 md:p-8 rounded-2xl bg-primary-container/30 backdrop-blur-md overflow-hidden group animate-fade-in-up"
      role="article"
      aria-label={`Previsão diária para ${sign}`}
    >
      {/* Decorative blur blobs */}
      <div
        className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none transition-celestial group-hover:bg-secondary/15"
        aria-hidden="true"
      />
      <div
        className="absolute -left-10 bottom-0 w-48 h-48 bg-primary-container/30 rounded-full blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Header: sign + greeting */}
      <div className="flex items-center justify-between mb-2">
        <span className="block font-label text-[10px] uppercase tracking-widest text-secondary/70">
          <span
            className="material-symbols-outlined text-xs align-middle mr-1"
            aria-hidden="true"
          >
            brightness_3
          </span>
          {data.planetLine}
        </span>

        <span className="text-2xl" aria-hidden="true" title={sign}>
          {data.symbol}
        </span>
      </div>

      {/* Personalized greeting */}
      {name && (
        <p className="font-label text-[11px] text-secondary/60 mb-4 uppercase tracking-wider">
          Para {name} · {sign}
        </p>
      )}

      {/* Quote */}
      <blockquote className="font-headline text-2xl md:text-[1.65rem] leading-relaxed italic text-on-primary-container mb-8 relative z-10">
        &ldquo;{data.quote}&rdquo;
      </blockquote>

      {/* Horizontal fade divider */}
      <div className="horizontal-fade mb-8" aria-hidden="true" />

      {/* Bento Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="list">
        {data.cards.map((card) => (
          <div
            key={card.label}
            role="listitem"
            className={[
              "p-5 rounded-xl bg-surface-variant/40 backdrop-blur-xl",
              "border border-outline-variant/20 transition-celestial",
              "hover:border-secondary/40 hover:shadow-copper-glow",
              "animate-fade-in-up",
            ].join(" ")}
          >
            <span
              className={`material-symbols-outlined filled ${card.color} text-2xl mb-3 block`}
              aria-hidden="true"
            >
              {card.icon}
            </span>
            <h3 className="font-label text-[10px] uppercase tracking-widest text-secondary/70 mb-2">
              {card.label}
            </h3>
            <p className="text-sm text-on-surface-variant/90 leading-relaxed">
              {card.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

type Props = {
  forecastState: ForecastState;
};

export default function ForecastSection({ forecastState }: Props) {
  const [today, setToday] = useState("");
  useEffect(() => { setToday(getTodayFormatted()); }, []);

  return (
    <section
      id="forecast"
      className="space-y-6"
      aria-label="Previsão diária"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl text-on-surface tracking-tight">
          Previsão Diária
        </h2>
        <span
          className="font-label text-xs text-primary/60 border border-primary/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
          aria-label={`Data de hoje: ${today}`}
        >
          {today}
        </span>
      </div>

      {/* Conditional content */}
      {forecastState.status === "idle" && <ForecastIdle />}
      {forecastState.status === "loading" && <ForecastSkeleton />}
      {forecastState.status === "error" && (
        <ForecastError message={forecastState.message} />
      )}
      {forecastState.status === "ready" && (
        <ForecastReady
          sign={forecastState.sign}
          name={forecastState.name}
          data={forecastState.data}
        />
      )}
    </section>
  );
}
