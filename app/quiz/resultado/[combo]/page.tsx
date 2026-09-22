import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import ShareButtons from "@/components/ShareButtons";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { RESULT_COPY, parseCombo, resultTitle, tensionLine } from "@/lib/quiz";
import { SIGN_SLUGS, slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

/**
 * Resultado do quiz. O segmento é "escorpiao" (só o resultado) ou
 * "escorpiao-leao" (resultado e signo real). 12 + 144 páginas estáticas.
 */

export const dynamicParams = false;

type Props = { params: Promise<{ combo: string }> };

export function generateStaticParams() {
  const slugs = Object.values(SIGN_SLUGS);
  return [
    ...slugs.map((combo) => ({ combo })),
    ...slugs.flatMap((a) => slugs.map((b) => ({ combo: `${a}-${b}` }))),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { combo } = await params;
  const parsed = parseCombo(combo);
  if (!parsed) return {};
  const title = `${resultTitle(parsed.quiz, parsed.real)} · Sinergia`;
  const description = parsed.real ? tensionLine(parsed.quiz, parsed.real) : RESULT_COPY[parsed.quiz];
  const url = `${SITE_URL}/quiz/resultado/${combo}`;
  return {
    title,
    description,
    // Só o resultado simples entra no índice; as combinações são páginas de compartilhamento
    robots: parsed.real ? { index: false, follow: true } : undefined,
    alternates: { canonical: parsed.real ? `${SITE_URL}/quiz` : url },
    openGraph: { title, description, url, locale: "pt_BR", type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Props) {
  const { combo } = await params;
  const parsed = parseCombo(combo);
  if (!parsed) notFound();
  const { quiz, real } = parsed;

  const shareText = real
    ? `${resultTitle(quiz, real)}. ${tensionLine(quiz, real)}\n\nFaça o teste:`
    : `${resultTitle(quiz, null)}. ${RESULT_COPY[quiz]}\n\nFaça o teste:`;

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-10 animate-fade">
        <p className="mb-3.5 text-xs uppercase tracking-[0.14em] text-muted">Resultado do teste</p>
        <h1 className="mb-6">
          <span className="block text-ink-2 text-lg mb-2">Você responde como</span>
          <span className="flex items-baseline gap-4">
            <span className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">{quiz}</span>
            <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">{SIGN_SYMBOLS[quiz]}{TEXT_GLYPH}</span>
          </span>
        </h1>

        <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-8 [text-wrap:pretty]">
          {RESULT_COPY[quiz]}
        </p>

        {real && (
          <div className="border-t border-ink pt-6 mb-2">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">
              {real === quiz ? `E você é ${real} mesmo` : `Mas você nasceu em ${real}`}
            </p>
            <p className="text-ink-2 text-lg">{tensionLine(quiz, real)}</p>
          </div>
        )}

        <ShareButtons
          url={`/quiz/resultado/${combo}`}
          text={shareText}
          label={`quiz:${quiz}`}
          shareLabel="Mandar para alguém"
        />

        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/quiz" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
            Fazer o teste
          </Link>
          <Link href={`/signo/${slugFor(real ?? quiz)}`} className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
            Ler a previsão de {real ?? quiz} para hoje
          </Link>
        </p>
      </section>

      <EmailCapture selectedSign={real ?? quiz} />
      <Footer />
    </div>
  );
}
