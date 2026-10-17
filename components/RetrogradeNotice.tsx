import Link from "next/link";
import type { SignName } from "@/lib/ephemeris";
import { slugFor } from "@/lib/slugs";
import { HOUSES } from "@/lib/retrograde-copy";
import { houseFor, noticeWindow, rangeLabel } from "@/lib/retrograde";

/** Linha sobre Mercúrio retrógrado, da semana anterior à estação até a direta. */
export default function RetrogradeNotice({ sign }: { sign: SignName }) {
  const r = noticeWindow();
  if (!r) return null;
  const house = houseFor(sign, r.startSign);
  return (
    <p className="mt-8 border-l-2 border-accent pl-4 text-sm text-ink-2">
      Mercúrio retrógrado de {rangeLabel(r)}, na sua casa {house}: {HOUSES[house].theme}.{" "}
      <Link href={`/mercurio-retrogrado/${slugFor(sign)}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
        O que muda para {sign}
      </Link>
    </p>
  );
}
