import type { Metadata } from "next";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import SoulmateForm from "@/components/SoulmateForm";
import EmailCapture from "@/components/EmailCapture";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

const title = "Alma gêmea: a compatibilidade pelo mapa de vocês dois · Sinergia";
const description =
  "Informe as duas datas de nascimento e veja o índice de alma gêmea, calculado pelo Sol, pela Lua, por Vênus e por Marte de cada um.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/compatibilidade/alma-gemea` },
  openGraph: { title, description, url: `${SITE_URL}/compatibilidade/alma-gemea`, locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function SoulmatePage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />

      <section className="pt-11 pb-10">
        <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">
          <Link href="/compatibilidade" className="hover:text-ink">Compatibilidade</Link> · Alma gêmea
        </p>
        <h1 className="font-display font-light text-[clamp(40px,10vw,64px)] leading-none tracking-[-0.03em] mb-5">
          Vocês são <em className="italic text-accent">alma gêmea</em>?
        </h1>
        <p className="text-ink-2 max-w-[52ch] mb-8">
          O signo solar conta só uma parte. Aqui o cálculo usa a posição real do Sol, da Lua, de Vênus e de Marte no dia
          em que cada um nasceu, e cruza os dois mapas: emoção com emoção, desejo com afeto.
        </p>
        <SoulmateForm />
      </section>

      <EmailCapture selectedSign={null} />
      <Footer />
    </div>
  );
}
