import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGNS } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";
import { HOUSES, RETRO_SIGN_TONE, WHAT_IS } from "@/lib/retrograde-copy";
import {
  dayMonth,
  dayMonthYear,
  houseFor,
  rangeLabel,
  signsLabel,
  statusLine,
  upcomingRetrogrades,
  yearOf,
} from "@/lib/retrograde";

// O status ("começa em 3 dias") muda ao longo do dia
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const [r] = upcomingRetrogrades();
  const title = `Mercúrio retrógrado ${yearOf(r.start)}: datas e o que muda para cada signo · Sinergia`;
  const description = `De ${rangeLabel(r)}, em ${signsLabel(r)}. Sombra, datas exatas em Brasília e o que fazer em cada signo.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/mercurio-retrogrado` },
    openGraph: { title, description, url: `${SITE_URL}/mercurio-retrogrado`, locale: "pt_BR", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function MercuryRetrogradePage() {
  const [r, ...next] = upcomingRetrogrades();
  const now = new Date();

  const timeline = [
    { label: "Sombra", date: r.shadowStart, note: "Mercúrio entra nos graus que vai revisitar." },
    { label: "Retrógrado", date: r.start, note: `Estação retrógrada em ${r.startSign}.` },
    { label: "Direto", date: r.end, note: `Estação direta em ${r.endSign}.` },
    { label: "Fim da sombra", date: r.shadowEnd, note: "Mercúrio deixa os graus do ciclo." },
  ];

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">{statusLine(r, now)}</p>
        <h1 className="font-display font-light text-[clamp(40px,10vw,64px)] leading-none tracking-[-0.03em] mb-5">
          Mercúrio retrógrado
        </h1>
        <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-4 [text-wrap:pretty]">
          De {rangeLabel(r)}, em {signsLabel(r)}.
        </p>
        <p className="text-ink-2 max-w-[56ch]">{RETRO_SIGN_TONE[r.startSign]}</p>
        <ShareButtons
          url="/mercurio-retrogrado"
          text={`Mercúrio retrógrado de ${rangeLabel(r)}. Veja o que muda para o seu signo:`}
          label="mercurio-retrogrado"
        />
      </section>

      <section aria-label="Datas" className="pb-10">
        <h2 className="font-display italic text-xl text-accent mb-1">Datas, no horário de Brasília</h2>
        <dl className="border-t border-ink">
          {timeline.map((t) => (
            <div key={t.label} className="grid grid-cols-[120px_1fr] gap-4 py-3.5 border-b border-rule">
              <dt className="text-ink">{t.label}</dt>
              <dd>
                <span className="text-ink tabular-nums">{dayMonthYear(t.date)}</span>
                <span className="block text-sm text-muted">{t.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Por signo" className="pb-10">
        <h2 className="font-display italic text-xl text-accent mb-1">O que muda para cada signo</h2>
        <ul className="list-none m-0 p-0 border-t border-ink">
          {SIGNS.map((sign) => {
            const house = houseFor(sign, r.startSign);
            return (
              <li key={sign} className="border-b border-rule">
                <Link href={`/mercurio-retrogrado/${slugFor(sign)}`} className="grid grid-cols-[1fr_auto] gap-4 py-3.5 group">
                  <span>
                    <span className="text-ink group-hover:text-accent">
                      <span className="font-glyph text-accent mr-2" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
                      {sign}
                    </span>
                    <span className="block text-sm text-muted">{HOUSES[house].theme}</span>
                  </span>
                  <span className="text-sm text-muted tabular-nums self-center">casa {house}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="O que é" className="pb-10">
        <h2 className="font-display italic text-xl text-accent mb-3">O que é Mercúrio retrógrado</h2>
        <div className="space-y-4 text-ink-2 max-w-[60ch]">
          {WHAT_IS.map((p) => <p key={p}>{p}</p>)}
        </div>
      </section>

      <section aria-label="Próximos" className="pb-4">
        <h2 className="font-display italic text-xl text-accent mb-1">Próximos períodos</h2>
        <ul className="list-none m-0 p-0 border-t border-ink">
          {next.map((c) => (
            <li key={c.start.toISOString()} className="grid grid-cols-[1fr_auto] gap-4 py-3 border-b border-rule">
              <span className="text-ink">{dayMonth(c.start)} a {dayMonthYear(c.end)}</span>
              <span className="text-sm text-muted">{signsLabel(c)}</span>
            </li>
          ))}
        </ul>
      </section>

      <EmailCapture selectedSign={null} />
      <Footer />
    </div>
  );
}
