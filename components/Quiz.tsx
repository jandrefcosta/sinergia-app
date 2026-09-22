"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, computeResult } from "@/lib/quiz";
import { SIGNS, type SignName } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { slugFor } from "@/lib/slugs";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "sinergia-sign";

function readStoredSign(): SignName | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && (SIGNS as readonly string[]).includes(v) ? (v as SignName) : null;
  } catch {
    return null;
  }
}

export default function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [realSign, setRealSign] = useState<string>("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const stored = readStoredSign();
    if (stored) setRealSign(stored);
  }, []);

  const total = QUESTIONS.length;
  const finished = step >= total;
  const question = QUESTIONS[step];

  function answer(choice: number) {
    if (!started) {
      setStarted(true);
      track("quiz_started");
    }
    const next = [...answers];
    next[step] = choice;
    setAnswers(next);
    setStep(step + 1);
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    const result = computeResult(answers);
    const real = (SIGNS as readonly string[]).includes(realSign) ? (realSign as SignName) : null;
    track("quiz_completed", { result, real: real ?? "none", match: real === result });
    const combo = real ? `${slugFor(result)}-${slugFor(real)}` : slugFor(result);
    router.push(`/quiz/resultado/${combo}`);
  }

  if (finished) {
    return (
      <section className="animate-fade space-y-5" aria-live="polite">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Última coisa</p>
        <h2 className="font-display font-light text-[clamp(28px,6.5vw,38px)] leading-[1.08] tracking-[-0.02em]">
          Qual é o seu signo <em className="italic text-accent">de verdade</em>?
        </h2>
        <p className="max-w-[46ch] text-ink-2">
          Para cruzar o jeito como você respondeu com o que o céu diz. Pode pular, se preferir.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="real-sign" className="sr-only">Seu signo</label>
          <select
            id="real-sign"
            value={realSign}
            onChange={(e) => setRealSign(e.target.value)}
            className="flex-1 min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent"
          >
            <option value="">Prefiro não dizer</option>
            {SIGNS.map((s) => (
              <option key={s} value={s}>{SIGN_SYMBOLS[s]}{TEXT_GLYPH} {s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={finish}
            className="bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Ver meu resultado
          </button>
        </div>
        <button type="button" onClick={back} className="text-sm text-ink-2 border-b border-rule-strong pb-0.5 hover:border-ink">
          Voltar à última pergunta
        </button>
      </section>
    );
  }

  return (
    <section aria-live="polite" key={step} className="animate-fade">
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-muted">
        <span>Pergunta {step + 1} de {total}</span>
        {step > 0 && (
          <button type="button" onClick={back} className="normal-case tracking-normal text-ink-2 border-b border-rule-strong pb-0.5 hover:border-ink">
            Voltar
          </button>
        )}
      </div>
      <div className="mb-6 h-px w-full bg-rule" aria-hidden="true">
        <div className="h-px bg-accent transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
      </div>

      <h2 className="font-display font-light text-[clamp(26px,6vw,36px)] leading-[1.12] tracking-[-0.02em] mb-6">
        {question.text}
      </h2>

      <ul className="border-t border-ink list-none m-0 p-0" role="list">
        {question.options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => answer(i)}
              aria-pressed={answers[step] === i}
              className={[
                "w-full text-left px-1 py-4 border-b border-rule cursor-pointer transition-colors",
                "hover:text-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                answers[step] === i ? "text-accent" : "text-ink",
              ].join(" ")}
            >
              <span className="font-display italic text-accent mr-3">{String.fromCharCode(97 + i)}.</span>
              {opt.text}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
