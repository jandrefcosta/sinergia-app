import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { SIGN_SLUGS, signFromSlug } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";
import { HOUSES } from "@/lib/retrograde-copy";
import { houseFor, rangeLabel, statusLine, upcomingRetrogrades, yearOf } from "@/lib/retrograde";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.values(SIGN_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) return {};
  const [r] = upcomingRetrogrades();
  const house = HOUSES[houseFor(sign, r.startSign)];
  const title = `Mercúrio retrógrado ${yearOf(r.start)} para ${sign} · Sinergia`;
  const description = `De ${rangeLabel(r)}. Para ${sign}, o ciclo mexe com ${house.theme}. O que fazer e o que evitar.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/mercurio-retrogrado/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/mercurio-retrogrado/${slug}`, locale: "pt_BR", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SignRetrogradePage({ params }: Props) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) notFound();

  const [r] = upcomingRetrogrades();
  const houseNumber = houseFor(sign, r.startSign);
  const house = HOUSES[houseNumber];
  // Ciclo entre dois signos: a segunda metade cai na casa vizinha
  const secondHouse = r.endSign !== r.startSign ? houseFor(sign, r.endSign) : null;

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">
          Mercúrio retrógrado · {statusLine(r)}
        </p>
        <h1 className="flex items-baseline gap-4 mb-5">
          <span className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">{sign}</span>
          <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
        </h1>
        <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-8 [text-wrap:pretty]">
          De {rangeLabel(r)}, Mercúrio retrograda na sua casa {houseNumber}: {house.theme}.
        </p>
        <div className="space-y-4 text-ink-2 max-w-[60ch]">
          {house.text.map((p) => <p key={p}>{p}</p>)}
          {secondHouse && (
            <p>
              Perto do fim, Mercúrio volta para {r.endSign}, a sua casa {secondHouse}, e o assunto passa a ser{" "}
              {HOUSES[secondHouse].theme}.
            </p>
          )}
        </div>
      </section>

      <dl className="border-t border-ink mb-2">
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-5 border-b border-rule">
          <dt className="font-display italic text-xl text-accent">Aproveite</dt>
          <dd className="text-ink-2">{house.good}</dd>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-5 border-b border-rule">
          <dt className="font-display italic text-xl text-accent">Evite</dt>
          <dd className="text-ink-2">{house.avoid}</dd>
        </div>
      </dl>

      <ShareButtons
        url={`/mercurio-retrogrado/${slug}`}
        text={`Mercúrio retrógrado para ${sign}, de ${rangeLabel(r)}: ${house.theme}.`}
        label={`mercurio:${sign}`}
        storiesImage={`/mercurio-retrogrado/${slug}/stories`}
      />

      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href="/mercurio-retrogrado" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Datas e outros signos
        </Link>
        <Link href={`/signo/${slug}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Ler a previsão de {sign} para hoje
        </Link>
      </p>

      <EmailCapture selectedSign={sign} />
      <Footer />
    </div>
  );
}
