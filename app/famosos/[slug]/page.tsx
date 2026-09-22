import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { famousBySign, likeLine, pickForPeriod } from "@/lib/famous";
import { getBRTPeriod } from "@/lib/forecast";
import { SIGN_SLUGS, dayLabel, signFromSlug } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.values(SIGN_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) return {};
  const names = pickForPeriod(sign, getBRTPeriod(), 3).map((f) => f.name);
  const title = `Famosos de ${sign} · Sinergia`;
  const description = `${likeLine(sign, names)} Artistas, atletas e personagens que nasceram sob ${sign}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/famosos/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/famosos/${slug}`, locale: "pt_BR", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FamousPage({ params }: Props) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) notFound();

  const all = famousBySign(sign);
  const people = all.filter((f) => f.kind === "pessoa").sort((a, b) => a.month - b.month || a.day - b.day);
  const characters = all.filter((f) => f.kind === "personagem").sort((a, b) => a.month - b.month || a.day - b.day);
  const picks = pickForPeriod(sign, getBRTPeriod(), 3).map((f) => f.name);

  const row = (f: (typeof all)[number]) => (
    <li key={f.name} className="grid grid-cols-[1fr_auto] gap-4 py-3 border-b border-rule">
      <span>
        <span className="text-ink">{f.name}</span>
        <span className="text-muted"> · {f.from}</span>
      </span>
      <span className="text-muted tabular-nums text-sm">{dayLabel(f.month, f.day)}</span>
    </li>
  );

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Famosos do signo</p>
        <h1 className="flex items-baseline gap-4 mb-5">
          <span className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">{sign}</span>
          <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
        </h1>
        <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] [text-wrap:pretty]">
          {likeLine(sign, picks)}
        </p>
        <ShareButtons
          url={`/famosos/${slug}`}
          text={`${likeLine(sign, picks)}\n\nVeja quem mais é do seu signo:`}
          label={`famosos:${sign}`}
        />
      </section>

      <section aria-label="Pessoas" className="pb-8">
        <h2 className="font-display italic text-xl text-accent mb-1">Pessoas</h2>
        <ul className="list-none m-0 p-0 border-t border-ink">{people.map(row)}</ul>
      </section>

      {characters.length > 0 && (
        <section aria-label="Personagens" className="pb-4">
          <h2 className="font-display italic text-xl text-accent mb-1">Personagens</h2>
          <ul className="list-none m-0 p-0 border-t border-ink">{characters.map(row)}</ul>
          <p className="mt-3 text-xs text-muted">Aniversários canônicos ou consagrados pelas obras.</p>
        </section>
      )}

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href={`/signo/${slug}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Ler a previsão de {sign} para hoje
        </Link>
        <Link href="/famosos" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Outros signos
        </Link>
      </p>

      <EmailCapture selectedSign={sign} />
      <Footer />
    </div>
  );
}
