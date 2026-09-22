"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { events } from "@/lib/analytics";

type State = "idle" | "loading" | "done" | "error" | "invalid";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UnsubscribeContent() {
  const params = useSearchParams();
  const fromLink = params.get("email") ?? "";
  const [email, setEmail] = useState(fromLink);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    setEmail(fromLink);
  }, [fromLink]);

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setState("invalid");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) events.unsubscribe();
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  const h = "font-display font-light text-[clamp(32px,7vw,44px)] leading-[1.06] tracking-[-0.02em] mb-4";

  if (state === "done") {
    return (
      <section className="pt-11">
        <h1 className={h}>
          Até logo. <em className="italic text-accent">Céu limpo.</em>
        </h1>
        <p className="max-w-[46ch] text-ink-2">
          Seu email foi removido. Você não recebe mais mensagens do Sinergia.
        </p>
        <a href="/" className="mt-8 inline-block text-sm font-medium border-b border-rule-strong pb-0.5 hover:border-ink">
          Voltar ao início
        </a>
      </section>
    );
  }

  return (
    <section className="pt-11">
      <h1 className={h}>Cancelar inscrição</h1>
      <p className="max-w-[46ch] text-ink-2 mb-5">
        Confirme o email que deve sair da lista. Você deixa de receber a previsão diária na hora.
      </p>
      <form onSubmit={handleUnsubscribe} noValidate className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="unsub-email" className="sr-only">Email</label>
          <input
            id="unsub-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state !== "idle") setState("idle"); }}
            placeholder="seu@email.com"
            className="flex-1 min-w-0 bg-field text-ink border border-rule-strong px-3.5 py-3 text-base placeholder:text-muted focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="bg-accent text-accent-ink px-5 py-3 text-[15px] font-semibold cursor-pointer disabled:opacity-60"
          >
            {state === "loading" ? "Removendo…" : "Remover"}
          </button>
        </div>
        {state === "invalid" && <p role="alert" className="text-xs text-danger">Confira o email, ele parece incompleto.</p>}
        {state === "error" && <p role="alert" className="text-xs text-danger">Algo deu errado. Tente de novo.</p>}
      </form>
    </section>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <Masthead />
      <Suspense fallback={null}>
        <UnsubscribeContent />
      </Suspense>
      <Footer />
    </div>
  );
}
