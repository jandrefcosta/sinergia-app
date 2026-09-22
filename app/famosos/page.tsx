import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { birthdaysOn, famousBySign, pickForPeriod } from "@/lib/famous";
import { getBRTPeriod } from "@/lib/forecast";
import { slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Famosos por signo · Sinergia",
  description: "Artistas, atletas e personagens de cada signo. Descubra quem nasceu sob o mesmo céu que você.",
  alternates: { canonical: `${SITE_URL}/famosos` },
  openGraph: { title: "Famosos por signo", description: "Quem nasceu sob o mesmo céu que você.", url: `${SITE_URL}/famosos`, locale: "pt_BR", type: "website" },
};

export default function FamousIndex() {
  const period = getBRTPeriod();
  const [, m, d] = period.split("-").map(Number);
  const today = birthdaysOn(m, d);

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />
      <section className="pt-11 pb-8">
        <h1 className="font-display font-light text-[clamp(38px,9vw,60px)] leading-[1.02] tracking-[-0.025em] mb-4">
          Quem nasceu sob o <em className="italic text-accent">mesmo céu</em> que você.
        </h1>
        <p className="max-w-[44ch] text-ink-2">
          Artistas, atletas e personagens por signo. Os nomes em destaque mudam todo dia.
        </p>
        {today.length > 0 && (
          <p className="mt-4 text-sm text-ink-2">
            <span className="font-display italic text-accent">Aniversário hoje: </span>
            {today.map((f) => `${f.name} (${f.sign})`).join(", ")}.
          </p>
        )}
      </section>

      <ul className="list-none m-0 p-0 border-t border-ink">
        {SIGNS.map((sign) => {
          const picks = pickForPeriod(sign, period, 3).map((f) => f.name);
          return (
            <li key={sign} className="border-b border-rule py-4">
              <Link href={`/famosos/${slugFor(sign)}`} className="group grid grid-cols-[auto_1fr] gap-x-4 items-baseline">
                <span className="font-display text-2xl group-hover:text-accent transition-colors">
                  {sign}{" "}
                  <span className="font-glyph text-lg text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
                </span>
                <span className="text-sm text-ink-2">
                  {picks.join(", ")} <span className="text-muted">e mais {famousBySign(sign).length - picks.length}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Footer />
    </div>
  );
}
