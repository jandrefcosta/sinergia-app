"use client";

import { useState } from "react";
import ShareButtons from "@/components/ShareButtons";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { slugFor } from "@/lib/slugs";
import { track } from "@/lib/analytics";
import type { SoulmateResult } from "@/lib/synastry";
import type { SignName } from "@/lib/ephemeris";

const field =
  "min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base placeholder:text-muted " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent";
const eyebrow = "text-xs uppercase tracking-[0.14em] text-muted";

const BODIES = ["Sol", "Lua", "Vênus", "Marte"] as const;

type Person = { date: string; time: string };

function PersonFields({ id, legend, value, onChange }: { id: string; legend: string; value: Person; onChange: (p: Person) => void }) {
  const max = new Date().toISOString().slice(0, 10);
  return (
    <fieldset className="flex-1 min-w-0 space-y-1">
      <legend className={`${eyebrow} mb-1`}>{legend}</legend>
      <div className="flex gap-2">
        <label htmlFor={`${id}-date`} className="sr-only">Data de nascimento</label>
        <input id={`${id}-date`} type="date" min="1900-01-01" max={max} value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })} className={`${field} flex-1`} />
        <label htmlFor={`${id}-time`} className="sr-only">Hora, se souber</label>
        <input id={`${id}-time`} type="time" value={value.time} title="Hora, se souber"
          onChange={(e) => onChange({ ...value, time: e.target.value })} className={`${field} w-28`} />
      </div>
    </fieldset>
  );
}

/** Duas datas de nascimento, o índice de alma gêmea e os encontros entre os mapas. */
export default function SoulmateForm() {
  const [you, setYou] = useState<Person>({ date: "", time: "" });
  const [them, setThem] = useState<Person>({ date: "", time: "" });
  const [result, setResult] = useState<SoulmateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!you.date || !them.date) return setError("Informe as duas datas de nascimento.");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/alma-gemea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: you, b: them }),
      });
      if (!res.ok) throw new Error();
      const data: SoulmateResult = await res.json();
      setResult(data);
      track("soulmate_checked", { score: data.score, tier: data.tier });
    } catch {
      setError("Não deu para calcular. Confira as datas.");
    } finally {
      setLoading(false);
    }
  }

  const card = result
    ? `/compatibilidade/alma-gemea/stories?s=${result.score}&a=${slugFor(result.you.Sol)}&b=${slugFor(result.them.Sol)}`
    : "";

  return (
    <div className="space-y-8">
      <form onSubmit={submit} noValidate className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-4">
          <PersonFields id="you" legend="Você" value={you} onChange={(p) => { setYou(p); setError(null); }} />
          <PersonFields id="them" legend="A outra pessoa" value={them} onChange={(p) => { setThem(p); setError(null); }} />
        </div>
        <p className="text-xs text-muted">A hora é opcional, mas deixa a Lua mais precisa. As datas não ficam salvas.</p>
        <button type="submit" disabled={loading}
          className="w-full sm:w-auto bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          {loading ? "Cruzando os mapas…" : "Ver se é alma gêmea"}
        </button>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </form>

      {result && (
        <section aria-live="polite" className="animate-fade border-t border-ink pt-7">
          <p className={eyebrow}>Índice de alma gêmea</p>
          <p className="flex items-baseline gap-4 mt-1 mb-6">
            <span className="font-display font-light text-[clamp(64px,16vw,96px)] leading-none tracking-[-0.03em] tabular-nums">{result.score}</span>
            <span className="font-display italic text-[clamp(24px,6vw,32px)] text-accent">{result.tier}</span>
          </p>

          <table className="w-full text-sm mb-7 border-collapse">
            <thead>
              <tr className="text-left">
                <th className={`${eyebrow} font-normal pb-2`}></th>
                <th className={`${eyebrow} font-normal pb-2`}>Você</th>
                <th className={`${eyebrow} font-normal pb-2`}>A outra pessoa</th>
              </tr>
            </thead>
            <tbody>
              {BODIES.map((b) => (
                <tr key={b} className="border-t border-rule">
                  <th scope="row" className="py-2 pr-3 text-left font-display italic text-accent font-normal">{b}</th>
                  {[result.you[b], result.them[b]].map((s: SignName, i) => (
                    <td key={i} className="py-2 pr-3 text-ink">
                      <span className="font-glyph text-accent mr-1.5" aria-hidden="true">{SIGN_SYMBOLS[s]}{TEXT_GLYPH}</span>{s}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {result.highlights.length > 0 && (
            <ul className="m-0 p-0 list-none border-t border-ink">
              {result.highlights.map((h) => (
                <li key={h.title} className="py-4 border-b border-rule">
                  <p className="text-ink font-medium">{h.title}</p>
                  <p className={`${eyebrow} mt-0.5 mb-1.5`}>{h.aspect}</p>
                  <p className="font-display text-[19px] leading-snug text-ink-2">{h.text}</p>
                </li>
              ))}
            </ul>
          )}

          {result.moonUncertain && (
            <p className="mt-4 text-xs text-muted">A Lua trocou de signo no dia de um dos nascimentos. Com a hora, o resultado fica mais preciso.</p>
          )}

          <ShareButtons
            url="/compatibilidade/alma-gemea"
            text={`Deu ${result.score} no índice de alma gêmea: ${result.tier.toLowerCase()} ✦\n\nFaça o de vocês:`}
            label={`alma-gemea:${result.score}`}
            shareLabel="Mandar para a pessoa"
            storiesImage={card}
          />
        </section>
      )}
    </div>
  );
}
