import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import SignFinder from "@/components/SignFinder";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Qual é o meu signo? · Sinergia",
  description:
    "Descubra seu signo pela data de nascimento, calculado pela posição real do Sol. Se nasceu na virada de signo, a hora resolve.",
  alternates: { canonical: `${SITE_URL}/qual-e-o-meu-signo` },
  openGraph: {
    title: "Qual é o meu signo?",
    description: "Descubra seu signo pela data de nascimento, calculado pela posição real do Sol.",
    url: `${SITE_URL}/qual-e-o-meu-signo`,
    locale: "pt_BR",
    type: "website",
  },
};

export default function SignFinderPage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />
      <section className="pt-11 pb-9">
        <h1 className="font-display font-light text-[clamp(38px,9vw,60px)] leading-[1.02] tracking-[-0.025em] mb-4">
          Qual é o <em className="italic text-accent">meu</em> signo?
        </h1>
        <p className="max-w-[44ch] text-ink-2">
          Informe a data de nascimento. O cálculo usa a posição real do Sol naquele dia, não uma tabela
          fixa, então funciona também para quem nasceu na virada de signo.
        </p>
      </section>
      <SignFinder />
      <EmailCapture selectedSign={null} />
      <Footer />
    </div>
  );
}
