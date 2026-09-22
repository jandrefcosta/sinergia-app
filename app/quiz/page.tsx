import type { Metadata } from "next";
import Masthead from "@/components/Masthead";
import Quiz from "@/components/Quiz";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Com que signo você se parece? · Sinergia",
  description:
    "Dez perguntas sobre o seu jeito. No fim, cruzamos como você responde com o signo em que nasceu.",
  alternates: { canonical: `${SITE_URL}/quiz` },
  openGraph: {
    title: "Com que signo você se parece?",
    description: "Dez perguntas sobre o seu jeito. No fim, cruzamos como você responde com o signo em que nasceu.",
    url: `${SITE_URL}/quiz`,
    locale: "pt_BR",
    type: "website",
  },
};

export default function QuizPage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />
      <section className="pt-11 pb-8">
        <h1 className="font-display font-light text-[clamp(38px,9vw,60px)] leading-[1.02] tracking-[-0.025em] mb-4">
          Com que signo você <em className="italic text-accent">se parece</em>?
        </h1>
        <p className="max-w-[44ch] text-ink-2">
          Dez perguntas sobre o seu jeito, sem resposta certa. No fim, cruzamos como você responde com o
          signo em que nasceu.
        </p>
      </section>
      <Quiz />
      <Footer />
    </div>
  );
}
