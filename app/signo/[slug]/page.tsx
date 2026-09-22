import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Masthead from "@/components/Masthead";
import ForecastView from "@/components/ForecastView";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { getRedis } from "@/lib/clients";
import { getForecast } from "@/lib/forecast";
import { SIGN_SLUGS, signFromSlug } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

// A previsão muda uma vez por dia; meia hora de cache cobre a virada das 06h
export const revalidate = 1800;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.values(SIGN_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) return {};
  const data = await getForecast(sign, getRedis());
  const title = `${sign}, hoje · Sinergia`;
  return {
    title,
    description: data.quote,
    alternates: { canonical: `${SITE_URL}/signo/${slug}` },
    openGraph: { title, description: data.quote, type: "article", locale: "pt_BR", url: `${SITE_URL}/signo/${slug}` },
    twitter: { card: "summary_large_image", title, description: data.quote },
  };
}

export default async function SignPage({ params }: Props) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) notFound();

  const data = await getForecast(sign, getRedis());

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />
      <section className="pt-11 pb-10">
        <ForecastView data={data} />
      </section>
      <p className="text-sm text-ink-2">
        <Link href="/" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Ver outro signo
        </Link>
      </p>
      <EmailCapture selectedSign={sign} />
      <Footer />
    </div>
  );
}
