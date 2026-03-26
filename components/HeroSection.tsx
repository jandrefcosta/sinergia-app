"use client";

import { useState } from "react";

const ZODIAC_SIGNS = [
  { symbol: "♈", name: "Áries"      },
  { symbol: "♉", name: "Touro"      },
  { symbol: "♊", name: "Gêmeos"     },
  { symbol: "♋", name: "Câncer"     },
  { symbol: "♌", name: "Leão"       },
  { symbol: "♍", name: "Virgem"     },
  { symbol: "♎", name: "Libra"      },
  { symbol: "♏", name: "Escorpião"  },
  { symbol: "♐", name: "Sagitário"  },
  { symbol: "♑", name: "Capricórnio"},
  { symbol: "♒", name: "Aquário"    },
  { symbol: "♓", name: "Peixes"     },
];

// Short label that fits the chip without overflow
function shortLabel(name: string): string {
  const map: Record<string, string> = {
    Áries: "Áries",
    Touro: "Touro",
    Gêmeos: "Gêm.",
    Câncer: "Cânc.",
    Leão: "Leão",
    Virgem: "Virg.",
    Libra: "Libra",
    Escorpião: "Esc.",
    Sagitário: "Sag.",
    Capricórnio: "Cap.",
    Aquário: "Aqu.",
    Peixes: "Peixes",
  };
  return map[name] ?? name.slice(0, 5);
}

type Props = {
  onGenerate: (sign: string, name: string) => void;
  isGenerating: boolean;
};

export default function HeroSection({ onGenerate, isGenerating }: Props) {
  const [name, setName] = useState("");
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  function handleGenerate() {
    if (!selectedSign || isGenerating) return;
    onGenerate(selectedSign, name.trim());
  }

  const canGenerate = !!selectedSign && !isGenerating;

  return (
    <section
      className="space-y-10 animate-fade-in-up"
      aria-label="Início da sua jornada astrológica"
    >
      {/* Hero Copy */}
      <div className="space-y-5">
        <span className="block font-label text-xs uppercase tracking-[0.22em] text-secondary opacity-90">
          A Nova Era da Intuição
        </span>
        <h1 className="font-headline text-5xl md:text-[3.25rem] leading-[1.1] text-on-surface tracking-tight">
          Sua pílula de clareza:{" "}
          <em className="text-primary not-italic">Receba sua previsão</em>{" "}
          em menos de 10 segundos.
        </h1>
      </div>

      {/* Onboarding Card */}
      <div
        className="bg-surface-container-low p-7 md:p-8 rounded-2xl shadow-wine relative overflow-hidden"
        role="form"
        aria-label="Configuração do seu perfil astrológico"
      >
        {/* Decorative glow blob */}
        <div
          className="absolute top-0 right-0 w-36 h-36 bg-secondary/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"
          aria-hidden="true"
        />

        <h2 className="font-headline text-xl text-on-surface mb-7">
          Inicie sua Jornada
        </h2>

        <div className="space-y-8">
          {/* Name Input */}
          <div className="space-y-2">
            <label
              htmlFor="user-name"
              className="block font-label text-[10px] uppercase tracking-wider text-primary/60"
            >
              Como devemos te chamar?
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Seu nome"
              className="input-celestial w-full py-3 text-xl font-headline italic text-secondary placeholder:text-outline-variant/40"
              autoComplete="given-name"
              disabled={isGenerating}
            />
          </div>

          {/* Zodiac Grid */}
          <div className="space-y-3">
            <label className="block font-label text-[10px] uppercase tracking-wider text-primary/60">
              Seu Signo Solar ou Ascendente
            </label>
            <div
              className="grid grid-cols-4 md:grid-cols-6 gap-2.5"
              role="group"
              aria-label="Seleção de signo zodiacal"
            >
              {ZODIAC_SIGNS.map((sign) => {
                const isSelected = selectedSign === sign.name;
                return (
                  <button
                    key={sign.name}
                    type="button"
                    onClick={() => !isGenerating && setSelectedSign(sign.name)}
                    aria-pressed={isSelected}
                    aria-label={sign.name}
                    disabled={isGenerating}
                    className={[
                      "zodiac-chip aspect-square flex flex-col items-center justify-center gap-1",
                      "rounded-xl border min-h-[52px] min-w-[44px]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected
                        ? "selected bg-primary-container/40 border-secondary"
                        : "bg-surface-container-highest border-outline-variant/10 text-secondary hover:border-secondary/40",
                    ].join(" ")}
                  >
                    <span
                      className="text-base leading-none select-none"
                      aria-hidden="true"
                    >
                      {sign.symbol}
                    </span>
                    <span className="text-[8px] font-label opacity-60 leading-none">
                      {shortLabel(sign.name)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected sign feedback */}
            <div className="h-5" aria-live="polite">
              {selectedSign && !isGenerating && (
                <p className="text-xs text-secondary/70 font-label animate-fade-in-up flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-sm"
                    aria-hidden="true"
                  >
                    check_circle
                  </span>
                  {selectedSign} selecionado
                </p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={[
              "smoldering-button w-full h-16 rounded-xl font-headline text-primary-fixed text-xl",
              "shadow-wine transition-celestial cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2" aria-live="assertive">
                <span
                  className="material-symbols-outlined text-xl animate-spin"
                  aria-hidden="true"
                >
                  progress_activity
                </span>
                Consultando os astros...
              </span>
            ) : (
              "Gerar Previsão Agora"
            )}
          </button>

          {/* Helper text */}
          <p className="text-center text-[11px] text-outline/50 font-label -mt-4">
            {!selectedSign
              ? "Selecione um signo para continuar"
              : "3 consultas gratuitas por dia · renova à meia-noite"}
          </p>
        </div>
      </div>
    </section>
  );
}
