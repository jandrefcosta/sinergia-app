import Link from "next/link";
import type { SignName } from "@/lib/ephemeris";
import { birthdaysOn, pickForPeriod } from "@/lib/famous";
import { slugFor } from "@/lib/slugs";

type Props = { sign: SignName; period: string };

/**
 * Faixa "do seu signo": três nomes que giram por dia, e o aniversariante
 * do dia quando houver. Dado estático, roda tanto no servidor quanto no cliente.
 */
export default function FamousStrip({ sign, period }: Props) {
  const picks = pickForPeriod(sign, period, 3);
  if (picks.length === 0) return null;

  const [y, m, d] = period.split("-").map(Number);
  void y;
  const birthdays = birthdaysOn(m, d).filter((f) => f.sign === sign);

  return (
    <aside className="mt-8 border-t border-rule pt-5 text-sm text-ink-2" aria-label={`Famosos de ${sign}`}>
      {birthdays.length > 0 && (
        <p className="mb-2">
          <span className="font-display italic text-accent">Hoje é aniversário de </span>
          {birthdays.map((f) => f.name).join(", ")}
          {birthdays.length === 1 ? `, ${birthdays[0].from}.` : "."}
        </p>
      )}
      <p>
        <span className="font-display italic text-accent">Também de {sign}: </span>
        {picks.map((f, i) => (
          <span key={f.name}>
            {f.name}
            {i < picks.length - 2 ? ", " : i === picks.length - 2 ? " e " : ""}
          </span>
        ))}
        .{" "}
        <Link href={`/famosos/${slugFor(sign)}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Ver todos
        </Link>
      </p>
    </aside>
  );
}
