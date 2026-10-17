import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Masthead from "@/components/Masthead";
import ShareButtons from "@/components/ShareButtons";
import CompatibilityForm from "@/components/CompatibilityForm";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGNS, type SignName } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";
import { famousBySign } from "@/lib/famous";
import { RELATIONS, SIGN_IN_LOVE, allPairs, elementLine, pairSlug, parsePairSlug, relationOf } from "@/lib/compatibility";

type Props = { params: Promise<{ par: string }> };

export function generateStaticParams() {
  return allPairs().map(([a, b]) => ({ par: pairSlug(a, b) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { par } = await params;
  const pair = parsePairSlug(par);
  if (!pair) return {};
  const { a, b } = pair;
  const rel = RELATIONS[relationOf(a, b)];
  const slug = pairSlug(a, b);
  const title = `${a} e ${b}: compatibilidade no amor, na amizade e no trabalho · Sinergia`;
  const description = `${rel.headline} ${rel.amor}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/compatibilidade/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/compatibilidade/${slug}`, locale: "pt_BR", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Um famoso de cada signo, fixo por par, para a frase "entre famosos". */
function famousPair(a: SignName, b: SignName): [string, string] | null {
  const seed = SIGNS.indexOf(a) * 12 + SIGNS.indexOf(b);
  const la = famousBySign(a).filter((f) => f.kind === "pessoa");
  const lb = famousBySign(b).filter((f) => f.kind === "pessoa");
  if (la.length === 0 || lb.length === 0) return null;
  const fa = la[seed % la.length];
  // Mesmo signo: pega outro nome da lista
  const fb = lb[(seed + (a === b ? 1 : 0)) % lb.length];
  return fa.name === fb.name ? null : [fa.name, fb.name];
}

export default async function PairPage({ params }: Props) {
  const { par } = await params;
  const pair = parsePairSlug(par);
  if (!pair) notFound();
  const { a, b } = pair;
  const slug = pairSlug(a, b);
  if (slug !== par) permanentRedirect(`/compatibilidade/${slug}`);

  const rel = RELATIONS[relationOf(a, b)];
  const famous = famousPair(a, b);
  const same = a === b;

  const traits = same
    ? [{ sign: a, ...SIGN_IN_LOVE[a] }]
    : [{ sign: a, ...SIGN_IN_LOVE[a] }, { sign: b, ...SIGN_IN_LOVE[b] }];

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">
          Compatibilidade · {rel.label} · {elementLine(a, b)}
        </p>
        <h1 className="font-display font-light text-[clamp(40px,10vw,64px)] leading-[1.05] tracking-[-0.03em] mb-5">
          {a} <em className="italic text-accent">e</em> {b}
          <span className="font-glyph text-[clamp(22px,5vw,32px)] text-accent ml-3 align-middle" aria-hidden="true">
            {SIGN_SYMBOLS[a]}{TEXT_GLYPH}{SIGN_SYMBOLS[b]}{TEXT_GLYPH}
          </span>
        </h1>
        <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-8 [text-wrap:pretty]">
          {rel.headline}
        </p>
        <div className="space-y-4 text-ink-2 max-w-[60ch]">
          {rel.text.map((p) => <p key={p}>{p}</p>)}
        </div>
      </section>

      <dl className="border-t border-ink">
        {[
          { label: "Amor", text: rel.amor },
          { label: "Amizade", text: rel.amizade },
          { label: "Trabalho", text: rel.trabalho },
          { label: "Cuidado", text: rel.cuidado },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-5 border-b border-rule">
            <dt className="font-display italic text-xl text-accent">{row.label}</dt>
            <dd className="text-ink-2">{row.text}</dd>
          </div>
        ))}
      </dl>

      <section aria-label="O que cada um traz" className="pt-8">
        <h2 className="font-display italic text-xl text-accent mb-3">{same ? `O que ${a} traz` : "O que cada um traz"}</h2>
        <div className="space-y-3 text-ink-2 max-w-[60ch]">
          {traits.map((t) => (
            <p key={t.sign}>
              <span className="text-ink">{t.sign}</span> traz {t.traz}, e precisa de {t.precisa}.
            </p>
          ))}
          {famous && (
            <p className="text-sm text-muted">
              Entre famosos, seria {famous[0]} ({a}) com {famous[1]} ({b}).
            </p>
          )}
        </div>
      </section>

      <ShareButtons
        url={`/compatibilidade/${slug}`}
        text={`${a} e ${b}: ${rel.headline}\n\nVeja a sua combinação:`}
        label={`compat:${slug}`}
        shareLabel="Mandar para a pessoa"
        storiesImage={`/compatibilidade/${slug}/stories`}
      />

      <section aria-label="Outra combinação" className="mt-12 border-t border-ink pt-8">
        <h2 className="font-display italic text-xl text-accent mb-4">Testar outra combinação</h2>
        <CompatibilityForm initial={[a, null]} />
      </section>

      <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={`/signo/${slugFor(a)}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Previsão de {a} para hoje
        </Link>
        {!same && (
          <Link href={`/signo/${slugFor(b)}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
            Previsão de {b} para hoje
          </Link>
        )}
        <Link href="/compatibilidade" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Todas as combinações
        </Link>
      </p>

      <EmailCapture selectedSign={a} />
      <Footer />
    </div>
  );
}
