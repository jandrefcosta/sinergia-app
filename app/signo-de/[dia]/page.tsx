import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import SignFinder from "@/components/SignFinder";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";
import { allDaySlugs, dayLabel, parseDaySlug, signByMonthDay, slugFor } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

/**
 * Uma página por dia do ano: "signo de 22 de setembro".
 * Estáticas, pensadas para busca. Levam à previsão do signo e ao cadastro.
 */

export const dynamicParams = false;

type Props = { params: Promise<{ dia: string }> };

export function generateStaticParams() {
  return allDaySlugs().map((dia) => ({ dia }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dia } = await params;
  const parsed = parseDaySlug(dia);
  if (!parsed) return {};
  const { sign, cusp, neighbor } = signByMonthDay(parsed.month, parsed.day);
  const label = dayLabel(parsed.month, parsed.day);
  const title = `Signo de ${label}: ${sign} · Sinergia`;
  const description = cusp
    ? `Quem nasce em ${label} é de ${sign}, mas está na virada para ${neighbor}. O ano e a hora decidem. Descubra o seu com a posição real do Sol.`
    : `Quem nasce em ${label} é de ${sign}. Veja a previsão de hoje para ${sign} e receba por email todas as manhãs.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/signo-de/${dia}` },
    openGraph: { title, description, url: `${SITE_URL}/signo-de/${dia}`, locale: "pt_BR", type: "article" },
  };
}

export default async function DayPage({ params }: Props) {
  const { dia } = await params;
  const parsed = parseDaySlug(dia);
  if (!parsed) notFound();

  const { sign, cusp, neighbor } = signByMonthDay(parsed.month, parsed.day);
  const label = dayLabel(parsed.month, parsed.day);
  const currentYear = new Date().getFullYear();
  const isoHint = `${currentYear - 30}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-9">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Signo de {label}</p>
        <h1 className="flex items-baseline gap-4 mb-5">
          <span className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">{sign}</span>
          <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
        </h1>
        <p className="max-w-[46ch] text-ink-2 mb-4">
          {cusp ? (
            <>
              Quem nasce em {label} está na virada entre <strong className="font-semibold text-ink">{sign}</strong> e{" "}
              <strong className="font-semibold text-ink">{neighbor}</strong>. O Sol muda de signo em horário diferente a cada
              ano, então o ano e a hora de nascimento decidem. Confirme abaixo com o cálculo exato.
            </>
          ) : (
            <>
              Quem nasce em {label} é de <strong className="font-semibold text-ink">{sign}</strong>, em qualquer ano. Para ver
              o grau exato do Sol no seu nascimento, informe a data completa abaixo.
            </>
          )}
        </p>
        <Link href={`/signo/${slugFor(sign)}`} className="text-sm font-medium border-b border-rule-strong pb-0.5 hover:border-ink">
          Ler a previsão de {sign} para hoje
        </Link>
      </section>

      <section className="border-t border-ink pt-8" aria-label="Cálculo exato">
        <h2 className="font-display font-light text-[clamp(26px,6vw,34px)] leading-[1.1] tracking-[-0.02em] mb-4">
          Confirmar com a <em className="italic text-accent">posição real</em> do Sol
        </h2>
        <SignFinder initialDate={isoHint} />
      </section>

      <EmailCapture selectedSign={cusp ? null : sign} />
      <Footer />
    </div>
  );
}
