"use client";

import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS } from "@/lib/signs";

type Props = {
  selected: string | null;
  onSelect: (sign: string) => void;
};

export default function SignPicker({ selected, onSelect }: Props) {
  return (
    <section aria-label="Escolha seu signo">
      <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">
        {selected ? "Ver outro signo" : "Seu signo"}
      </p>
      <ul className="grid grid-cols-3 sm:grid-cols-4 border-t border-l border-rule list-none m-0 p-0">
        {SIGNS.map((sign) => {
          const active = sign === selected;
          return (
            <li key={sign} className="min-w-0">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(sign)}
                className={[
                  "box-border flex w-full min-w-0 flex-col gap-1.5 overflow-hidden px-3 pt-3.5 pb-3 text-left",
                  "border-r border-b border-rule cursor-pointer transition-colors duration-200",
                  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                  active ? "text-accent shadow-[inset_0_-3px_0_var(--accent)]" : "text-ink-2 hover:text-ink",
                ].join(" ")}
              >
                <span className="font-display text-xl leading-[1.1]">{SIGN_SYMBOLS[sign]}</span>
                <span className={`text-[13px] tracking-[0.02em] ${active ? "font-semibold" : ""}`}>{sign}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
