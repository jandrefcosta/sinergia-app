import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

/**
 * Link da bio do Instagram. A UTM fica no link da bio
 * (/links?utm_source=instagram&utm_medium=bio); daqui para dentro os links
 * são internos e o GA4 mantém a origem da sessão.
 */

export const metadata: Metadata = {
  title: "Sinergia · O céu de hoje, lido para o seu signo",
  description: "Previsão diária por signo a partir das posições reais dos planetas, teste, compatibilidade e mais.",
  alternates: { canonical: `${SITE_URL}/links` },
  robots: { index: false, follow: true },
};

const MORE = [
  { href: "/quiz", title: "Com que signo você se parece?", text: "Sete perguntas sobre o seu jeito." },
  { href: "/compatibilidade", title: "Compatibilidade", text: "Como dois signos se encontram." },
  { href: "/mercurio-retrogrado", title: "Mercúrio retrógrado", text: "Quando acontece e o que muda para o seu signo." },
  { href: "/famosos", title: "Famosos por signo", text: "Artistas, atletas e personagens de cada signo." },
  { href: "/qual-e-o-meu-signo", title: "Qual é o meu signo?", text: "Pela data de nascimento, calculado pelo Sol." },
];

export default function LinksPage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-10 pb-7">
        <h1 className="font-display font-light text-[clamp(34px,8.5vw,52px)] leading-[1.04] tracking-[-0.025em] mb-3">
          O céu de hoje, lido para o <em className="italic text-accent">seu</em> signo.
        </h1>
        <p className="max-w-[44ch] text-ink-2">Escolha o seu e leia a previsão de amor, trabalho e energia.</p>
      </section>

      <nav aria-label="Previsão de hoje por signo" className="border-t border-ink">
        <ul className="m-0 p-0 list-none grid grid-cols-3 sm:grid-cols-4">
          {SIGNS.map((sign) => (
            <li key={sign} className="border-b border-r border-rule [&:nth-child(3n)]:border-r-0 sm:[&:nth-child(3n)]:border-r sm:[&:nth-child(4n)]:border-r-0">
              <Link
                href={`/signo/${slugFor(sign)}`}
                className="flex flex-col items-center gap-1 py-4 text-ink hover:bg-field transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span className="font-glyph text-2xl text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
                <span className="font-display text-[17px]">{sign}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-label="Mais do Sinergia" className="pt-10">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Mais do Sinergia</p>
        <ul className="m-0 p-0 list-none border-t border-ink">
          {MORE.map((item) => (
            <li key={item.href} className="border-b border-rule">
              <Link
                href={item.href}
                className="group flex items-baseline justify-between gap-4 py-4 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span>
                  <span className="block font-display text-xl text-ink group-hover:text-accent transition-colors">{item.title}</span>
                  <span className="block text-sm text-ink-2">{item.text}</span>
                </span>
                <span className="text-accent" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <EmailCapture selectedSign={null} />
      <Footer />
    </div>
  );
}
