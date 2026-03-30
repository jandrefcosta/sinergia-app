"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
];

const SIGN_SYMBOLS: Record<string, string> = {
  Áries: "♈", Touro: "♉", Gêmeos: "♊", Câncer: "♋",
  Leão: "♌", Virgem: "♍", Libra: "♎", Escorpião: "♏",
  Sagitário: "♐", Capricórnio: "♑", Aquário: "♒", Peixes: "♓",
};

function validate(email: string, sign: string, birthdate: string, birthtime: string): string | null {
  if (!email.trim()) return "Informe seu email para continuar.";
  if (!EMAIL_RE.test(email)) return "Formato de email inválido.";
  if (!sign) return "Selecione seu signo.";
  if (!birthdate) return "Informe sua data de nascimento.";
  if (birthtime && !TIME_RE.test(birthtime)) return "Horário inválido.";
  return null;
}

export default function RetentionSection() {
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function clearError() {
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(email, sign, birthdate, birthtime);
    if (err) { setError(err); return; }

    setLoading(true);
    setError(null);

    try {
      const emailRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!emailRes.ok) throw new Error("email");

      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sign, birthdate, ...(birthtime && { birthtime }) }),
      });
      if (!profileRes.ok) throw new Error("profile");

      setDone(true);
    } catch {
      setError("Não foi possível cadastrar. Tente novamente.");
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
            {done
              ? "Até amanhã, sob as estrelas."
              : "A clareza não deve parar aqui."}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {done
              ? "Sua previsão chega todas as manhãs, personalizada para o seu signo."
              : "Receba seu guia celestial todas as manhãs, antes do café. Seu despertar merece intenção."}
          </p>
        </div>

        {/* Form area */}
        <div className="w-full md:w-auto flex flex-col gap-3 min-w-0 md:min-w-[300px]">

          {done ? (
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
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3">

              {/* Email */}
              <div>
                <label htmlFor="email-capture" className="sr-only">
                  Seu endereço de email
                </label>
                <input
                  id="email-capture"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="seu@email.com"
                  aria-describedby={error ? "retention-error" : undefined}
                  aria-invalid={!!error}
                  autoComplete="email"
                  className={[
                    "w-full bg-surface rounded-lg px-4 py-3 text-sm font-body text-on-surface",
                    "placeholder:text-outline-variant/50 focus:outline-none transition-celestial",
                    error && !email.trim()
                      ? "ring-1 ring-error/70 focus:ring-error"
                      : "focus:ring-1 focus:ring-secondary/60",
                  ].join(" ")}
                />
              </div>

              {/* Sign */}
              <div>
                <label htmlFor="sign-select" className="sr-only">Seu signo</label>
                <select
                  id="sign-select"
                  value={sign}
                  onChange={(e) => { setSign(e.target.value); clearError(); }}
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

              {/* Birthdate + Birthtime */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="birthdate" className="sr-only">Data de nascimento</label>
                  <input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => { setBirthdate(e.target.value); clearError(); }}
                    max={new Date().toISOString().slice(0, 10)}
                    min="1900-01-01"
                    aria-describedby={error ? "retention-error" : undefined}
                    aria-invalid={!!error && !birthdate}
                    className={[
                      "w-full bg-surface rounded-lg px-4 py-3 text-sm font-body text-on-surface",
                      "focus:outline-none transition-celestial",
                      error && !birthdate ? "ring-1 ring-error/70" : "focus:ring-1 focus:ring-secondary/60",
                    ].join(" ")}
                  />
                </div>
                <div className="w-28">
                  <label htmlFor="birthtime" className="sr-only">Hora de nascimento (opcional)</label>
                  <input
                    id="birthtime"
                    type="time"
                    value={birthtime}
                    onChange={(e) => { setBirthtime(e.target.value); clearError(); }}
                    placeholder="--:--"
                    className={[
                      "w-full bg-surface rounded-lg px-3 py-3 text-sm font-body text-on-surface",
                      "focus:outline-none transition-celestial",
                      error && birthtime && !TIME_RE.test(birthtime)
                        ? "ring-1 ring-error/70"
                        : "focus:ring-1 focus:ring-secondary/60",
                    ].join(" ")}
                  />
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 font-label -mt-1">
                Hora de nascimento opcional — melhora a precisão das previsões.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-on-secondary rounded-lg text-sm font-label font-semibold uppercase tracking-tight hover:bg-secondary-fixed transition-celestial focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">
                    progress_activity
                  </span>
                ) : "Receber previsões"}
              </button>

              {error ? (
                <p id="retention-error" role="alert" className="flex items-center gap-1 text-[11px] font-label text-error/80 animate-fade-in-up">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                  {error}
                </p>
              ) : (
                <p className="text-[10px] text-center text-on-surface-variant/40 font-label tracking-wide">
                  Privacidade absoluta. Apenas os astros verão seus dados.
                </p>
              )}

            </form>
          )}

        </div>
      </div>
    </section>
  );
}
