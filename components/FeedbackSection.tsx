"use client";

import { useState, useRef, useEffect } from "react";

const MAX_CHARS = 500;

export default function FeedbackSection() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const mountedAt = useRef<number>(0);

  // Registra o momento em que o formulário ficou visível
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("website") as HTMLInputElement)?.value;

    // Rejeita bots silenciosamente
    if (honeypot) return;

    if (!message.trim()) {
      setError("Escreva algo antes de enviar.");
      return;
    }

    // Rejeita submissões muito rápidas (< 3s) — comportamento de bot
    const elapsed = Date.now() - mountedAt.current;
    if (elapsed < 3000) {
      setError("Calma, os astros precisam de um momento.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.status === 429) {
        setError("Você já enviou mensagens demais hoje. Volte amanhã.");
        setStatus("idle");
        return;
      }

      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
      setStatus("idle");
    }
  }

  return (
    <section
      className="bg-surface-container-high p-7 md:p-8 rounded-2xl border border-secondary/10 shadow-wine-inset"
      aria-label="Enviar opinião ou sugestão"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-headline text-xl text-secondary copper-glow">
            O universo ouve você.
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">
            Tem uma sugestão ou quer nos contar algo? Deixe aqui.
          </p>
        </div>

        {status === "done" ? (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-xl bg-primary-container/30 border border-secondary/20 animate-fade-in-up"
            role="status"
            aria-live="polite"
          >
            <span className="material-symbols-outlined filled text-secondary text-xl" aria-hidden="true">
              check_circle
            </span>
            <p className="text-sm font-label text-secondary">
              Recebido. Os astros agradecem.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot — invisível para humanos, bots preenchem */}
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
            />

            <div className="relative">
              <label htmlFor="feedback-message" className="sr-only">
                Sua mensagem
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value);
                    if (error) setError(null);
                  }
                }}
                placeholder="Conte o que está sentindo, sugira algo, ou apenas diga olá..."
                rows={4}
                aria-describedby={error ? "feedback-error" : "feedback-counter"}
                aria-invalid={!!error}
                className={[
                  "w-full bg-surface rounded-lg px-4 py-3 text-sm font-body text-on-surface resize-none",
                  "placeholder:text-outline-variant/50 focus:outline-none transition-celestial",
                  error
                    ? "ring-1 ring-error/70 focus:ring-error"
                    : "focus:ring-1 focus:ring-secondary/60",
                ].join(" ")}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                {error ? (
                  <p
                    id="feedback-error"
                    role="alert"
                    className="flex items-center gap-1 text-[11px] font-label text-error/80 animate-fade-in-up"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">error</span>
                    {error}
                  </p>
                ) : (
                  <p
                    id="feedback-counter"
                    className="text-[10px] text-on-surface-variant/40 font-label"
                    aria-live="polite"
                  >
                    {message.length}/{MAX_CHARS}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !message.trim()}
                className="shrink-0 px-5 py-2 bg-secondary text-on-secondary rounded-lg text-[11px] font-label font-semibold uppercase tracking-tight hover:bg-secondary-fixed transition-celestial focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {status === "loading" ? (
                  <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">
                    progress_activity
                  </span>
                ) : "Enviar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
