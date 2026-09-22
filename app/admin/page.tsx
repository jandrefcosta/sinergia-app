"use client";

import { useCallback, useEffect, useState } from "react";
import type { Draft, Forecast, Published } from "@/lib/forecast";
import type { Sky } from "@/lib/ephemeris";

type Row = { sign: string; draft: Draft | null; published: Published | null };
type Payload = { period: string; today: string; sky: Sky | null; rows: Row[] };

const SECRET_KEY = "sinergia-admin-secret";

function readSecret(): string {
  try { return sessionStorage.getItem(SECRET_KEY) ?? ""; } catch { return ""; }
}

function shiftPeriod(period: string, days: number): string {
  const d = new Date(`${period}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [period, setPeriod] = useState<string | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSecret(readSecret()); }, []);

  const load = useCallback(async (s: string, p: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/forecasts${p ? `?period=${p}` : ""}`, {
        headers: { "x-admin-secret": s },
      });
      if (res.status === 401) {
        setError("Secret inválido.");
        setPayload(null);
        return;
      }
      if (!res.ok) throw new Error();
      const data: Payload = await res.json();
      setPayload(data);
      setPeriod(data.period);
    } catch {
      setError("Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (secret) load(secret, period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const s = input.trim();
    if (!s) return;
    try { sessionStorage.setItem(SECRET_KEY, s); } catch {}
    setSecret(s);
  }

  async function act(sign: string, action: string, data?: Partial<Forecast>) {
    if (!period) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/forecasts", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ period, sign, action, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha");
      }
      await load(secret, period);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar.");
      setLoading(false);
    }
  }

  async function generateAll() {
    if (!period) return;
    setLoading(true);
    setError(null);
    try {
      // Gera os que faltam, um a um, via ação de regenerar apenas para signos sem rascunho
      const missing = payload?.rows.filter((r) => !r.draft).map((r) => r.sign) ?? [];
      for (const sign of missing) {
        await fetch("/api/admin/forecasts", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-admin-secret": secret },
          body: JSON.stringify({ period, sign, action: "regenerate" }),
        });
      }
      await load(secret, period);
    } catch {
      setError("Falha ao gerar.");
      setLoading(false);
    }
  }

  if (!secret) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3">
          <h1 className="font-display text-2xl">Sinergia · Admin</h1>
          <input
            id="admin-secret"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADMIN_SECRET"
            className="w-full bg-field border border-rule-strong rounded-lg px-4 py-3 text-sm"
          />
          <button type="submit" className="w-full py-3 bg-accent text-accent-ink rounded-lg text-sm font-semibold">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const approved = payload?.rows.filter((r) => r.draft?.status === "approved").length ?? 0;
  const drafts = payload?.rows.filter((r) => r.draft).length ?? 0;
  const published = payload?.rows.filter((r) => r.published).length ?? 0;

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl">Sinergia · Previsões</h1>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => period && load(secret, shiftPeriod(period, -1))} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">‹</button>
          <span className="font-ui tabular-nums">{period ?? "…"}</span>
          <button onClick={() => period && load(secret, shiftPeriod(period, 1))} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">›</button>
          {payload && period !== payload.today && (
            <button onClick={() => load(secret, payload.today)} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">hoje</button>
          )}
        </div>
      </header>

      {error && <p className="text-danger text-sm">{error}</p>}
      {loading && <p className="text-ink-2 text-sm">Processando…</p>}

      {payload && (
        <>
          <section className="text-sm text-ink-2 space-y-2">
            <p>
              Rascunhos: {drafts}/12 · Aprovados: {approved} · Publicados: {published}
              {drafts < 12 && (
                <button onClick={generateAll} disabled={loading} className="ml-3 px-3 py-1 rounded-lg bg-accent text-accent-ink text-xs font-semibold disabled:opacity-50">
                  Gerar os que faltam
                </button>
              )}
            </p>
            {payload.sky && (
              <details>
                <summary className="cursor-pointer">Céu do dia ({payload.sky.moonPhase})</summary>
                <ul className="mt-2 grid grid-cols-2 gap-x-6 text-xs">
                  {payload.sky.positions.map((p) => (
                    <li key={p.planet}>{p.planet} em {p.sign} {p.degree}°{p.retrograde ? " ℞" : ""}</li>
                  ))}
                </ul>
                <ul className="mt-2 text-xs space-y-0.5">
                  {payload.sky.aspects.map((a, i) => (
                    <li key={i}>{a.a} {a.type} {a.b} (orbe {a.orb}°)</li>
                  ))}
                </ul>
              </details>
            )}
          </section>

          <section className="space-y-6">
            {payload.rows.map((row) => (
              <DraftCard key={row.sign} row={row} disabled={loading} onAct={act} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}

function DraftCard({
  row,
  disabled,
  onAct,
}: {
  row: Row;
  disabled: boolean;
  onAct: (sign: string, action: string, data?: Partial<Forecast>) => Promise<void>;
}) {
  const { sign, draft, published } = row;
  const [quote, setQuote] = useState(draft?.data.quote ?? "");
  const [cards, setCards] = useState<string[]>(draft?.data.cards.map((c) => c.text) ?? ["", "", ""]);

  useEffect(() => {
    setQuote(draft?.data.quote ?? "");
    setCards(draft?.data.cards.map((c) => c.text) ?? ["", "", ""]);
  }, [draft]);

  const dirty =
    !!draft &&
    (quote !== draft.data.quote || cards.some((t, i) => t !== draft.data.cards[i].text));

  const edited = (): Partial<Forecast> => ({
    quote,
    cards: cards.map((text, i) => ({ ...draft!.data.cards[i], text })),
  });

  const status = published
    ? `publicado (${published.source})`
    : draft?.status === "approved"
      ? "aprovado"
      : draft
        ? "rascunho"
        : "sem rascunho";

  return (
    <article className="rounded-2xl bg-field border border-rule p-5 space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl">
          {draft?.data.symbol ?? ""} {sign}
        </h2>
        <span className="text-xs font-ui uppercase tracking-widest text-ink-2">{status}</span>
      </header>

      {draft ? (
        <>
          <p className="text-xs text-ink-2">{draft.data.planetLine}</p>
          <textarea
            id={`quote-${sign}`}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className="w-full bg-field border border-rule-strong rounded-lg px-3 py-2 text-sm font-display"
          />
          {["Amor", "Trabalho", "Energia"].map((label, i) => (
            <label key={label} className="block text-xs text-ink-2">
              {label}
              <textarea
                id={`${label}-${sign}`}
                value={cards[i]}
                onChange={(e) => setCards(cards.map((t, j) => (j === i ? e.target.value : t)))}
                rows={2}
                className="mt-1 w-full bg-field border border-rule-strong rounded-lg px-3 py-2 text-sm text-ink"
              />
            </label>
          ))}
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
            {dirty && (
              <button disabled={disabled} onClick={() => onAct(sign, "save", edited())} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">
                Salvar edição
              </button>
            )}
            {draft.status !== "approved" ? (
              <button disabled={disabled} onClick={() => onAct(sign, "approve", dirty ? edited() : undefined)} className="px-3 py-2 rounded-lg bg-accent text-accent-ink">
                Aprovar
              </button>
            ) : (
              <button disabled={disabled} onClick={() => onAct(sign, "unapprove")} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">
                Desfazer aprovação
              </button>
            )}
            <button disabled={disabled} onClick={() => onAct(sign, "publish")} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">
              {published ? "Republicar" : "Publicar agora"}
            </button>
            <button disabled={disabled} onClick={() => onAct(sign, "regenerate")} className="px-3 py-2 rounded-lg bg-field border border-rule-strong">
              Regenerar
            </button>
          </div>
        </>
      ) : (
        <button disabled={disabled} onClick={() => onAct(sign, "regenerate")} className="px-3 py-2 rounded-lg bg-accent text-accent-ink text-xs font-semibold">
          Gerar rascunho
        </button>
      )}
    </article>
  );
}
