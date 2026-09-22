"use client";

import { useEffect, useState } from "react";
import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS } from "@/lib/signs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = { selectedSign: string | null };

const field =
  "w-full min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base placeholder:text-muted " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent";

export default function EmailCapture({ selectedSign }: Props) {
  const [email, setEmail] = useState("");
  const [sign, setSign] = useState(selectedSign ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Segue o signo escolhido na página, mas deixa trocar no formulário
  useEffect(() => {
    if (selectedSign) setSign(selectedSign);
  }, [selectedSign]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return setError("Confira o email, ele parece incompleto.");
    if (!sign) return setError("Escolha o signo que deve chegar no email.");

    setLoading(true);
    setError(null);
    try {
      const emailRes = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!emailRes.ok) throw new Error();
      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sign }),
      });
      if (!profileRes.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Não deu para cadastrar agora. Tente de novo em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 border-t border-ink pt-10" aria-label="Receber por email">
      <h2 className="font-display font-light text-[clamp(28px,6.5vw,38px)] leading-[1.08] tracking-[-0.02em] mb-3">
        {done ? (
          <>Pronto. <em className="italic text-accent">Até amanhã.</em></>
        ) : (
          <>Todas as manhãs, <em className="italic text-accent">antes do café.</em></>
        )}
      </h2>

      {done ? (
        <p className="max-w-[46ch] text-ink-2" role="status">
          A previsão de {sign} chega no seu email às 7h. Se mudar de ideia, todo email tem um link para
          cancelar.
        </p>
      ) : (
        <>
          <p className="max-w-[46ch] text-ink-2 mb-5">
            A previsão do seu signo chega por email às 7h. Sem app, sem notificação, só um texto para
            começar o dia.
          </p>
          <form onSubmit={handleSubmit} noValidate className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="email" className="sr-only">Seu email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                aria-invalid={!!error && !EMAIL_RE.test(email)}
                className={`${field} flex-1`}
              />
              <label htmlFor="sign" className="sr-only">Signo</label>
              <select
                id="sign"
                value={sign}
                onChange={(e) => { setSign(e.target.value); setError(null); }}
                className={`${field} sm:w-44 cursor-pointer`}
              >
                <option value="" disabled>Signo</option>
                {SIGNS.map((s) => (
                  <option key={s} value={s}>{SIGN_SYMBOLS[s]} {s}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {loading ? "Enviando…" : "Quero receber"}
            </button>
            {error ? (
              <p role="alert" className="text-xs text-danger">{error}</p>
            ) : (
              <p className="text-xs text-muted">Um email por dia. Cancele quando quiser, num clique.</p>
            )}
          </form>
        </>
      )}
    </section>
  );
}
