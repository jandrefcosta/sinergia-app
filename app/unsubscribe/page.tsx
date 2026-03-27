"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type State = "idle" | "loading" | "done" | "error" | "invalid";

function UnsubscribeContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("invalid");
    }
  }, [email]);

  async function handleUnsubscribe() {
    setState("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return (
    <>
      <p className="text-4xl mb-6">🌑</p>
      <h1 className="font-headline text-2xl text-secondary copper-glow mb-3">
        Até logo, viajante.
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Seu email foi removido. Você não receberá mais mensagens do Sinergia.
      </p>
      <a href="/" className="inline-block mt-8 text-xs font-label text-on-surface-variant/40 underline underline-offset-2 hover:text-on-surface-variant/60 transition-celestial">
        Voltar ao início
      </a>
    </>
  );

  if (state === "invalid") return (
    <>
      <p className="text-4xl mb-6">✦</p>
      <h1 className="font-headline text-2xl text-secondary copper-glow mb-3">
        Link inválido
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Este link de cancelamento não é válido. Verifique o email que você recebeu.
      </p>
      <a href="/" className="inline-block mt-8 text-xs font-label text-on-surface-variant/40 underline underline-offset-2 hover:text-on-surface-variant/60 transition-celestial">
        Voltar ao início
      </a>
    </>
  );

  return (
    <>
      <p className="text-4xl mb-6">🌓</p>
      <h1 className="font-headline text-2xl text-secondary copper-glow mb-3">
        Cancelar inscrição
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed mb-2">
        Você está prestes a remover{" "}
        <span className="text-secondary font-label">{email}</span>{" "}
        da lista do Sinergia.
      </p>
      <p className="text-sm text-on-surface-variant/60 leading-relaxed mb-8">
        Você não receberá mais previsões diárias.
      </p>
      {state === "error" && (
        <p className="mb-4 text-xs text-error/80 font-label">
          Algo deu errado. Tente novamente.
        </p>
      )}
      <button
        onClick={handleUnsubscribe}
        disabled={state === "loading"}
        className="smoldering-button w-full py-3 rounded-xl text-sm font-label font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {state === "loading" ? (
          <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">
            progress_activity
          </span>
        ) : "Confirmar cancelamento"}
      </button>
      <a href="/" className="inline-block mt-5 text-xs font-label text-on-surface-variant/40 underline underline-offset-2 hover:text-on-surface-variant/60 transition-celestial">
        Voltar sem cancelar
      </a>
    </>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-high rounded-2xl border border-secondary/10 p-10 text-center shadow-wine-inset">
        <Suspense fallback={<p className="text-sm text-on-surface-variant">Carregando...</p>}>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </main>
  );
}
