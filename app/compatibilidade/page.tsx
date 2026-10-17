import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import CompatibilityForm from "@/components/CompatibilityForm";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { SITE_URL } from "@/lib/site";
import { pairSlug } from "@/lib/compatibility";

const title = "Compatibilidade entre signos: amor, amizade e trabalho · Sinergia";
const description = "Escolha dois signos e veja como eles combinam no amor, na amizade e no trabalho. As 78 combinações do zodíaco.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/compatibilidade` },
  openGraph: { title, description, url: `${SITE_URL}/compatibilidade`, locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function CompatibilityPage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Compatibilidade</p>
        <h1 className="font-display font-light text-[clamp(40px,10vw,64px)] leading-none tracking-[-0.03em] mb-5">
          Vocês combinam?
        </h1>
        <p className="text-ink-2 max-w-[52ch] mb-6">
          Escolha o seu signo e o da outra pessoa. Vale para o crush, o casamento, a amizade e aquele colega de trabalho.
        </p>
        <CompatibilityForm />
        <Link
          href="/compatibilidade/alma-gemea"
          className="group mt-8 flex items-baseline justify-between gap-4 border-t border-b border-rule py-4 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span>
            <span className="block font-display text-xl text-ink group-hover:text-accent transition-colors">
              Vocês são <em className="italic text-accent">alma gêmea</em>?
            </span>
            <span className="block text-sm text-ink-2">Vai além do signo: cruza Sol, Lua, Vênus e Marte pelas datas de nascimento.</span>
          </span>
          <span className="text-accent" aria-hidden="true">→</span>
        </Link>
      </section>

      <section aria-label="Todas as combinações" className="pb-4">
        <h2 className="font-display italic text-xl text-accent mb-1">Todas as combinações</h2>
        <div className="border-t border-ink">
          {SIGNS.map((a) => (
            <div key={a} className="py-3.5 border-b border-rule">
              <p className="text-ink mb-1.5">
                <span className="font-glyph text-accent mr-2" aria-hidden="true">{SIGN_SYMBOLS[a]}{TEXT_GLYPH}</span>
                {a} com
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {SIGNS.map((b) => (
                  <Link key={b} href={`/compatibilidade/${pairSlug(a, b)}`} className="text-ink-2 hover:text-ink border-b border-rule hover:border-ink">
                    {b}
                  </Link>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <EmailCapture selectedSign={null} />
      <Footer />
    </div>
  );
}
