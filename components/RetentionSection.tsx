"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
];

const SIGN_SYMBOLS: Record<string, string> = {
  Áries: "♈", Touro: "♉", Gêmeos: "♊", Câncer: "♋",
  Leão: "♌", Virgem: "♍", Libra: "♎", Escorpião: "♏",
  Sagitário: "♐", Capricórnio: "♑", Aquário: "♒", Peixes: "♓",
};

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Informe seu email para continuar.";
  if (!email.includes("@")) return "O email precisa conter @.";
  if (!EMAIL_RE.test(email)) return "Formato de email inválido.";
  return null;
}

function validateProfile(sign: string, birthdate: string): string | null {
  if (!sign) return "Selecione seu signo.";
  if (!birthdate) return "Informe sua data de nascimento.";
  return null;
}

type Step = "email" | "profile" | "done";

export default function RetentionSection() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStep("profile");
    } catch {
      setError("Não foi possível cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateProfile(sign, birthdate);
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sign, birthdate }),
      });
      if (!res.ok) throw new Error();
      setStep("done");
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="bg-surface-container-high p-7 md:p-8 rounded-2xl border border-secondary/10 shadow-wine-inset"
      aria-label="Receba previsões diárias por email"
    >
      <div className="flex flex-col md:flex-row items-center gap-7 md:gap-10">

        {/* Copy */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="font-headline text-2xl text-secondary copper-glow">
            {step === "done"
              ? "Até amanhã, sob as estrelas."
              : step === "profile"
              ? "Quase lá. Os astros precisam te conhecer."
              : "A clareza não deve parar aqui."}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {step === "done"
              ? "Sua previsão chega todas as manhãs, personalizada para o seu signo."
              : step === "profile"
              ? "Seu signo e data de nascimento garantem previsões personalizadas todas as manhãs."
              : "Receba seu guia celestial todas as manhãs, antes do café. Seu despertar merece intenção."}
          </p>
        </div>

        {/* Form area */}
        <div className="w-full md:w-auto flex flex-col gap-3 min-w-0 md:min-w-[300px]">

          {/* Step: done */}
          {step === "done" && (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary-container/30 border border-secondary/20 animate-fade-in-up"
              role="status"
              aria-live="polite"
            >
              <span className="material-symbols-outlined filled text-secondary text-xl" aria-hidden="true">
                check_circle
              </span>
              <p className="text-sm font-label text-secondary">
                Perfeito! Os astros já sabem o seu caminho.
              </p>
            </div>
          )}

          {/* Step: email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} noValidate>
              <div className="relative">
                <label htmlFor="email-capture" className="sr-only">
                  Seu endereço de email
                </label>
                <input
                  id="email-capture"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  placeholder="seu@email.com"
                  aria-describedby={error ? "retention-error" : undefined}
                  aria-invalid={!!error}
                  className={[
                    "w-full bg-surface rounded-lg px-4 py-3 pr-36 text-sm font-body text-on-surface",
                    "placeholder:text-outline-variant/50 focus:outline-none transition-celestial",
                    error
                      ? "ring-1 ring-error/70 focus:ring-error"
                      : "focus:ring-1 focus:ring-secondary/60",
                  ].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-secondary text-on-secondary rounded-md text-[11px] font-label font-semibold uppercase tracking-tight hover:bg-secondary-fixed transition-celestial focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">
                      progress_activity
                    </span>
                  ) : "Receber amanhã"}
                </button>
              </div>
              {error ? (
                <p id="retention-error" role="alert" className="mt-2 flex items-center gap-1 text-[11px] font-label text-error/80 animate-fade-in-up">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-center text-on-surface-variant/40 font-label tracking-wide">
                  Privacidade absoluta. Apenas os astros verão seus dados.
                </p>
              )}
            </form>
          )}

          {/* Step: profile */}
          {step === "profile" && (
            <form onSubmit={handleProfileSubmit} noValidate className="space-y-3 animate-fade-in-up">

              {/* Sign selector */}
              <div>
                <label htmlFor="sign-select" className="sr-only">Seu signo</label>
                <select
                  id="sign-select"
                  value={sign}
                  onChange={(e) => { setSign(e.target.value); if (error) setError(null); }}
                  className={[
                    "w-full bg-surface rounded-lg px-4 py-3 text-sm font-body text-on-surface",
                    "focus:outline-none transition-celestial appearance-none cursor-pointer",
                    !sign ? "text-outline-variant/50" : "",
                    error && !sign ? "ring-1 ring-error/70" : "focus:ring-1 focus:ring-secondary/60",
                  ].join(" ")}
                >
                  <option value="" disabled>Seu signo</option>
                  {SIGNS.map((s) => (
                    <option key={s} value={s}>{SIGN_SYMBOLS[s]} {s}</option>
                  ))}
                </select>
              </div>

              {/* Birthdate */}
              <div className="relative">
                <label htmlFor="birthdate" className="sr-only">Data de nascimento</label>
                <input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => { setBirthdate(e.target.value); if (error) setError(null); }}
                  max={new Date().toISOString().slice(0, 10)}
                  min="1900-01-01"
                  aria-describedby={error ? "retention-error" : undefined}
                  aria-invalid={!!error}
                  className={[
                    "w-full bg-surface rounded-lg px-4 py-3 pr-36 text-sm font-body text-on-surface",
                    "focus:outline-none transition-celestial",
                    error && !birthdate ? "ring-1 ring-error/70" : "focus:ring-1 focus:ring-secondary/60",
                  ].join(" ")}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-secondary text-on-secondary rounded-md text-[11px] font-label font-semibold uppercase tracking-tight hover:bg-secondary-fixed transition-celestial focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">
                      progress_activity
                    </span>
                  ) : "Confirmar"}
                </button>
              </div>

              {error ? (
                <p id="retention-error" role="alert" className="flex items-center gap-1 text-[11px] font-label text-error/80 animate-fade-in-up">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                  {error}
                </p>
              ) : (
                <p className="text-[10px] text-center text-on-surface-variant/40 font-label tracking-wide">
                  Usados apenas para personalizar suas previsões.{" "}
                  <button
                    type="button"
                    onClick={() => setStep("done")}
                    className="underline underline-offset-2 hover:text-on-surface-variant/60 transition-celestial cursor-pointer"
                  >
                    Pular
                  </button>
                </p>
              )}
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
