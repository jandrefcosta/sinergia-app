"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SIGNS, type SignName } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { pairSlug } from "@/lib/compatibility";
import { track } from "@/lib/analytics";

const field =
  "w-full min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base cursor-pointer " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent";

type Props = { initial?: [SignName | null, SignName | null] };

/** Dois signos e um botão: leva à página do par. */
export default function CompatibilityForm({ initial = [null, null] }: Props) {
  const router = useRouter();
  const [a, setA] = useState<string>(initial[0] ?? "");
  const [b, setB] = useState<string>(initial[1] ?? "");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!a || !b) return setError(true);
    track("compatibility_checked", { a, b });
    router.push(`/compatibilidade/${pairSlug(a as SignName, b as SignName)}`);
  }

  const select = (id: string, label: string, value: string, set: (v: string) => void) => (
    <>
      <label htmlFor={id} className="sr-only">{label}</label>
      <select id={id} value={value} onChange={(e) => { set(e.target.value); setError(false); }} className={`${field} flex-1`}>
        <option value="" disabled>{label}</option>
        {SIGNS.map((s) => (
          <option key={s} value={s}>{SIGN_SYMBOLS[s]}{TEXT_GLYPH} {s}</option>
        ))}
      </select>
    </>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {select("sign-a", "Seu signo", a, setA)}
        <span className="text-center text-muted font-display italic" aria-hidden="true">e</span>
        {select("sign-b", "O da outra pessoa", b, setB)}
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Ver combinação
      </button>
      {error && <p role="alert" className="text-xs text-danger">Escolha os dois signos.</p>}
    </form>
  );
}
