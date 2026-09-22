"use client";

import { useState } from "react";
import Link from "next/link";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { track } from "@/lib/analytics";

type Result = { sign: string; slug: string; degree: number; exact: boolean };

const field =
  "min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base placeholder:text-muted " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent";

type Props = { initialDate?: string };

export default function SignFinder({ initialDate = "" }: Props) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return setError("Informe a data de nascimento.");
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ date, ...(time ? { time } : {}) });
      const res = await fetch(`/api/sign?${qs}`);
      if (!res.ok) throw new Error();
      const data: Result = await res.json();
      setResult(data);
      track("sign_found", { sign: data.sign, exact: data.exact });
    } catch {
      setError("Não deu para calcular. Confira a data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="birthdate" className="text-xs uppercase tracking-[0.14em] text-muted">Nascimento</label>
            <input id="birthdate" type="date" value={date} min="1900-01-01" max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => { setDate(e.target.value); setError(null); }} className={field} />
          </div>
          <div className="sm:w-36 flex flex-col gap-1">
            <label htmlFor="birthtime" className="text-xs uppercase tracking-[0.14em] text-muted">Hora, se souber</label>
            <input id="birthtime" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={field} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full sm:w-auto bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer disabled:opacity-60">
          {loading ? "Calculando…" : "Descobrir meu signo"}
        </button>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </form>

      {result && (
        <div className="animate-fade border-t border-ink pt-6" role="status">
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Seu signo solar</p>
          <p className="flex items-baseline gap-4 mb-3">
            <span className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">{result.sign}</span>
            <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">{SIGN_SYMBOLS[result.sign]}{TEXT_GLYPH}</span>
          </p>
          <p className="text-ink-2 mb-4">
            {result.exact
              ? `O Sol estava a ${result.degree}° de ${result.sign} quando você nasceu.`
              : `Você nasceu no dia da virada de signo. Sem a hora, fica ${result.sign}, mas pode ser o vizinho. Informe a hora acima para confirmar.`}
          </p>
          <Link href={`/signo/${result.slug}`} className="text-sm font-medium border-b border-rule-strong pb-0.5 hover:border-ink">
            Ler a previsão de {result.sign} para hoje
          </Link>
        </div>
      )}
    </div>
  );
}
