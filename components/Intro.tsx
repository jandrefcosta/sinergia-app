import Link from "next/link";

export default function Intro() {
  return (
    <section className="pt-11 pb-9">
      <h1 className="font-display font-light text-[clamp(38px,9vw,60px)] leading-[1.02] tracking-[-0.025em] mb-4">
        O céu de hoje, <em className="italic text-accent">lido</em> para você.
      </h1>
      <p className="max-w-[44ch] text-ink-2">
        Uma previsão por dia, escrita com calma a partir das posições reais dos planetas. Escolha seu
        signo e leia em menos de um minuto.
      </p>
      <p className="mt-4 text-sm text-ink-2">
        Não sabe o seu?{" "}
        <Link href="/qual-e-o-meu-signo" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          Descubra pela data de nascimento
        </Link>
        {" "}· Ou faça o{" "}
        <Link href="/quiz" className="font-medium text-ink border-b border-rule-strong pb-0.5 hover:border-ink">
          teste de personalidade
        </Link>
      </p>
    </section>
  );
}
