"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string): string | null {
  if (!email.trim()) return "Informe seu email para continuar.";
  if (!email.includes("@")) return "O email precisa conter @.";
  if (!EMAIL_RE.test(email)) return "Formato de email inválido.";
  return null;
}

export default function RetentionSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
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
            A clareza não deve parar aqui.
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Receba seu guia celestial todas as manhãs, antes do café. Seu
            despertar merece intenção.
          </p>
        </div>

        {/* Email form */}
        <div className="w-full md:w-auto flex flex-col gap-3 min-w-0 md:min-w-[300px]">
          {submitted ? (
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary-container/30 border border-secondary/20 animate-fade-in-up"
              role="status"
              aria-live="polite"
            >
              <span
                className="material-symbols-outlined filled text-secondary text-xl"
                aria-hidden="true"
              >
                check_circle
              </span>
              <p className="text-sm font-label text-secondary">
                Perfeito! Os astros já sabem o seu caminho.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="relative">
                <label htmlFor="email-capture" className="sr-only">
                  Seu endereço de email
                </label>
                <input
                  id="email-capture"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  aria-describedby={error ? "email-error" : undefined}
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
                    <span
                      className="material-symbols-outlined text-sm animate-spin"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                  ) : (
                    "Receber amanhã"
                  )}
                </button>
              </div>

              {error ? (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-2 flex items-center gap-1 text-[11px] font-label text-error/80 animate-fade-in-up"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    error
                  </span>
                  {error}
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-center text-on-surface-variant/40 font-label tracking-wide">
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
