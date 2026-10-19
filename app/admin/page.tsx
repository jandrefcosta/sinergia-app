"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Draft, Forecast, Published } from "@/lib/forecast";
import type { Sky } from "@/lib/ephemeris";
import { SIGN_SYMBOLS, TEXT_GLYPH } from "@/lib/signs";

type Row = { sign: string; draft: Draft | null; published: Published | null };
type Payload = { period: string; today: string; sky: Sky | null; rows: Row[] };
type Action = "save" | "approve" | "unapprove" | "publish" | "regenerate";

const SECRET_KEY = "sinergia-admin-secret";

function readSecret(): string {
  try { return sessionStorage.getItem(SECRET_KEY) ?? ""; } catch { return ""; }
}

function shiftPeriod(period: string, days: number): string {
  const d = new Date(`${period}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function periodLabel(period: string): string {
  return new Date(`${period}T12:00:00-03:00`)
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })
    .replace("-feira", "");
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}

// ─── Estilos compartilhados ─────────────────────────────────────────────────

const link =
  "text-sm font-medium text-ink border-b border-rule-strong pb-0.5 cursor-pointer hover:border-ink transition-colors " +
  "disabled:opacity-40 disabled:cursor-default focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const primary =
  "bg-accent text-accent-ink px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
const field =
  "w-full bg-field text-ink border border-rule-strong px-3 py-2 leading-relaxed placeholder:text-muted resize-y " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent";
const eyebrow = "text-xs uppercase tracking-[0.14em] text-muted";

// ─── Página ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [period, setPeriod] = useState<string | null>(null);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setSecret(readSecret()); }, []);

  const load = useCallback(async (s: string, p: string | null) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/forecasts${p ? `?period=${p}` : ""}`, { headers: { "x-admin-secret": s } });
      if (res.status === 401) {
        setError("Secret inválido.");
        setPayload(null);
        try { sessionStorage.removeItem(SECRET_KEY); } catch {}
        setSecret("");
        return;
      }
      if (!res.ok) throw new Error();
      const data: Payload = await res.json();
      setPayload(data);
      setPeriod(data.period);
    } catch {
      setError("Não foi possível carregar.");
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

  async function call(sign: string, action: Action, data?: Partial<Forecast>): Promise<boolean> {
    if (!period) return false;
    const res = await fetch("/api/admin/forecasts", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ period, sign, action, data }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Falha");
    }
    return true;
  }

  async function act(sign: string, action: Action, data?: Partial<Forecast>) {
    setBusy(`${sign}:${action}`);
    setError(null);
    try {
      await call(sign, action, data);
      await load(secret, period);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar.");
    } finally {
      setBusy(null);
    }
  }

  async function actAll(label: string, targets: string[], action: Action) {
    if (targets.length === 0) return;
    setBusy(label);
    setError(null);
    let failed = 0;
    for (const sign of targets) {
      try { await call(sign, action); } catch { failed++; }
    }
    if (failed) setError(`${failed} de ${targets.length} falharam.`);
    await load(secret, period);
    setBusy(null);
  }

  // ── Login ──
  if (!secret) {
    return (
      <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
        <AdminHeader />
        <form onSubmit={handleLogin} className="pt-11 space-y-4 max-w-sm">
          <h1 className="font-display font-light text-[clamp(30px,7vw,40px)] leading-[1.06] tracking-[-0.02em]">
            Entrar na <em className="italic text-accent">redação</em>.
          </h1>
          <label htmlFor="admin-secret" className={eyebrow}>Admin secret</label>
          <input id="admin-secret" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="current-password" className={field} />
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          <button type="submit" className={primary}>Entrar</button>
        </form>
      </div>
    );
  }

  const rows = payload?.rows ?? [];
  const drafts = rows.filter((r) => r.draft);
  const approved = rows.filter((r) => r.draft?.status === "approved");
  const published = rows.filter((r) => r.published);
  const missing = rows.filter((r) => !r.draft).map((r) => r.sign);
  const toApprove = rows.filter((r) => r.draft && r.draft.status !== "approved").map((r) => r.sign);
  const toPublish = rows.filter((r) => r.draft && !r.published).map((r) => r.sign);
  const isToday = payload && period === payload.today;
  const isTomorrow = payload && period === shiftPeriod(payload.today, 1);

  return (
    <div className="mx-auto flex max-w-page flex-col px-5 pt-7 pb-20">
      <AdminHeader onLogout={() => { try { sessionStorage.removeItem(SECRET_KEY); } catch {} setSecret(""); setPayload(null); }} />

      {/* Navegação de datas */}
      <section className="pt-9 pb-6 border-b border-ink">
        <p className={eyebrow}>
          {isToday ? "Hoje" : isTomorrow ? "Amanhã" : "Edição"}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-display font-light text-[clamp(28px,6.5vw,40px)] leading-[1.06] tracking-[-0.02em]">
            {period ? periodLabel(period) : "…"}
          </h1>
          <nav className="flex items-center gap-4 text-sm" aria-label="Trocar de dia">
            <button type="button" onClick={() => period && load(secret, shiftPeriod(period, -1))} className={link}>Anterior</button>
            <button type="button" onClick={() => period && load(secret, shiftPeriod(period, 1))} className={link}>Próximo</button>
            {payload && !isTomorrow && (
              <button type="button" onClick={() => load(secret, shiftPeriod(payload.today, 1))} className={link}>Amanhã</button>
            )}
            {payload && !isToday && (
              <button type="button" onClick={() => load(secret, payload.today)} className={link}>Hoje</button>
            )}
          </nav>
        </div>
      </section>

      {/* Resumo e ações em lote */}
      {payload && (
        <section className="py-5 border-b border-rule space-y-3">
          <p className="text-sm text-ink-2">
            <Stat n={drafts.length} label="rascunhos" /> · <Stat n={approved.length} label="aprovados" /> ·{" "}
            <Stat n={published.length} label="publicados" />
            {payload.sky && <span className="text-muted"> · {payload.sky.moonPhase}</span>}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {missing.length > 0 && (
              <button type="button" disabled={!!busy} onClick={() => actAll("gerar", missing, "regenerate")} className={primary}>
                {busy === "gerar" ? "Gerando…" : `Gerar ${missing.length === 12 ? "os doze" : `os ${missing.length} que faltam`}`}
              </button>
            )}
            {toApprove.length > 0 && (
              <button type="button" disabled={!!busy} onClick={() => actAll("aprovar", toApprove, "approve")} className={link}>
                {busy === "aprovar" ? "Aprovando…" : `Aprovar todos (${toApprove.length})`}
              </button>
            )}
            {toPublish.length > 0 && (
              <button type="button" disabled={!!busy} onClick={() => actAll("publicar", toPublish, "publish")} className={link}>
                {busy === "publicar" ? "Publicando…" : `Publicar todos (${toPublish.length})`}
              </button>
            )}
          </div>
          {payload.sky && <SkyDetails sky={payload.sky} />}
        </section>
      )}

      {payload && isToday && <InstagramPanel secret={secret} published={published.map((r) => r.sign)} />}
      {payload && isToday && <EmailPanel secret={secret} />}

      {error && <p role="alert" className="pt-4 text-sm text-danger">{error}</p>}
      {!payload && !error && <p className="pt-6 text-sm text-muted">Carregando…</p>}

      {/* Signos */}
      {payload && (
        <section className="divide-y divide-rule">
          {rows.map((row) => (
            <SignEditor key={`${period}:${row.sign}`} row={row} busy={busy} onAct={act} />
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Peças ──────────────────────────────────────────────────────────────────

function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <header className="flex items-baseline justify-between border-b border-ink pb-3.5">
      <a href="/" className="font-display text-[22px] font-semibold tracking-tight text-ink">
        Siner<em className="font-light italic text-accent">gia</em>
        <span className="ml-3 font-ui text-xs font-normal uppercase tracking-[0.14em] text-muted">Redação</span>
      </a>
      {onLogout && (
        <button type="button" onClick={onLogout} className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
          Sair
        </button>
      )}
    </header>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-ink tabular-nums">{n}</span>
      <span className="text-muted">/12</span> {label}
    </span>
  );
}

function SkyDetails({ sky }: { sky: Sky }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-ink-2 hover:text-ink">Céu do dia</summary>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <ul className="m-0 p-0 list-none space-y-0.5 text-ink-2">
          {sky.positions.map((p) => (
            <li key={p.planet} className="flex justify-between gap-4">
              <span>{p.planet}</span>
              <span className="tabular-nums text-right">
                {p.sign} {p.degree}°{p.retrograde ? <span className="text-accent"> ℞</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <ul className="m-0 p-0 list-none space-y-0.5 text-ink-2">
          {sky.aspects.map((a, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>{a.a} <span className="font-display italic text-accent">{a.type}</span> {a.b}</span>
              <span className="tabular-nums text-muted">{a.orb}°</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

type IgStatus = {
  username: string;
  quotaUsage: number;
  quotaTotal: number | null;
  tokenExpiresAt: string | null;
  autopost: boolean;
  postedSigns: string[];
  postedKinds: string[];
};

const FEED_POSTS = [
  { kind: "ceu", label: "O céu de hoje" },
  { kind: "carrossel-1", label: "Carrossel Áries a Virgem" },
  { kind: "carrossel-2", label: "Carrossel Libra a Peixes" },
];

/** Stories e posts de hoje no Instagram. Só aparece no dia corrente. */
function InstagramPanel({ secret, published }: { secret: string; published: string[] }) {
  const [status, setStatus] = useState<IgStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState<string | null>(null);
  // O estado só desabilita os botões no próximo render; a ref barra o clique duplo
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/instagram", { headers: { "x-admin-secret": secret } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Instagram indisponível.");
      return;
    }
    setError(null);
    setStatus(body);
  }, [secret]);

  useEffect(() => { refresh(); }, [refresh]);

  async function post(label: string, payload: { sign: string } | { kind: string }): Promise<boolean> {
    const res = await fetch("/api/admin/instagram", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(payload),
    });
    if (res.ok) return true;
    const body = await res.json().catch(() => ({}));
    setError(`${label}: ${body.error ?? "falha ao postar"}`);
    return false;
  }

  async function postMany(signs: string[]) {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    try {
      for (const sign of signs) {
        setPosting(sign);
        if (!(await post(sign, { sign }))) break;
      }
    } catch {
      setError("Falha de rede ao postar.");
    } finally {
      setPosting(null);
      inFlight.current = false;
    }
    await refresh();
  }

  async function postFeed(kind: string, label: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setPosting(label);
    try {
      await post(label, { kind });
    } catch {
      setError("Falha de rede ao postar.");
    } finally {
      setPosting(null);
      inFlight.current = false;
    }
    await refresh();
  }

  const posted = new Set(status?.postedSigns ?? []);
  const pending = published.filter((s) => !posted.has(s));

  return (
    <section className="py-5 border-b border-rule space-y-3" aria-label="Instagram">
      <p className={eyebrow}>Instagram</p>
      {status ? (
        <>
          <p className="text-sm text-ink-2">
            @{status.username} · <span className="tabular-nums">{status.quotaUsage}{status.quotaTotal ? `/${status.quotaTotal}` : ""}</span> publicações nas últimas 24h
            {status.tokenExpiresAt && (
              <span className="text-muted"> · token vence em {new Date(status.tokenExpiresAt).toLocaleDateString("pt-BR")}</span>
            )}
            <span className="text-muted"> · {status.autopost ? "postagem automática ligada" : "postagem automática desligada"}</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {pending.length > 0 && (
              <button type="button" disabled={!!posting} onClick={() => postMany(pending)} className={primary}>
                {posting ? `Postando ${posting}…` : `Postar Stories de hoje (${pending.length})`}
              </button>
            )}
            {pending.length === 0 && published.length > 0 && <span className="text-sm text-ink-2">Stories de hoje postados.</span>}
            {published.length === 0 && <span className="text-sm text-muted">Publique as previsões de hoje antes de postar.</span>}
          </div>
          <ul className="m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
            {published.map((sign) => (
              <li key={sign}>
                {posted.has(sign) ? (
                  <span className="text-muted">{sign} ✓</span>
                ) : (
                  <button type="button" disabled={!!posting} onClick={() => postMany([sign])} className={link}>
                    {sign}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <ul className="m-0 p-0 list-none flex flex-wrap gap-x-6 gap-y-1.5 text-sm pt-1">
            {FEED_POSTS.map(({ kind, label }) => (
              <li key={kind}>
                {status.postedKinds.includes(kind) ? (
                  <span className="text-muted">{label} ✓</span>
                ) : (
                  <button type="button" disabled={!!posting} onClick={() => postFeed(kind, label)} className={link}>
                    {posting === label ? "Postando…" : `Postar ${label.charAt(0).toLowerCase()}${label.slice(1)}`}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        !error && <p className="text-sm text-muted">Carregando…</p>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </section>
  );
}

type EmailStatus = {
  usage: { month: number; day: number; monthLimit: number; dayLimit: number };
  warnRatio: number;
  subscribers: number;
  withSign: number;
  dailyTier: number;
  last: { period: string; sentDaily: number; sentWeekly: number; blocked: number } | null;
};

/** Cota do Resend. Só aparece no dia corrente. */
function EmailPanel({ secret }: { secret: string }) {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/email", { headers: { "x-admin-secret": secret } })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Email indisponível.");
        setStatus(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Email indisponível."));
  }, [secret]);

  const u = status?.usage;
  const warn = !!status && !!u && (u.month >= u.monthLimit * status.warnRatio || u.day >= u.dayLimit * status.warnRatio);
  const weekly = status ? status.withSign - status.dailyTier : 0;

  return (
    <section className="py-5 border-b border-rule space-y-2" aria-label="Email">
      <p className={eyebrow}>Email</p>
      {status && u && (
        <>
          <p className="text-sm text-ink-2">
            <span className={`tabular-nums ${warn ? "text-danger font-semibold" : ""}`}>{u.month}/{u.monthLimit}</span> no mês ·{" "}
            <span className="tabular-nums">{u.day}/{u.dayLimit}</span> hoje ·{" "}
            <span className="tabular-nums">{status.subscribers}</span> inscritos
            {status.subscribers !== status.withSign && <span className="text-muted"> ({status.withSign} com signo)</span>}
          </p>
          <p className="text-sm text-ink-2">
            {weekly > 0
              ? `${status.dailyTier} recebem todo dia, ${weekly} uma vez por semana para caber na cota.`
              : "Todos recebem todo dia."}
            {status.last && (
              <span className="text-muted">
                {" "}Último envio ({status.last.period}): {status.last.sentDaily} diários, {status.last.sentWeekly} semanais
                {status.last.blocked > 0 ? `, ${status.last.blocked} não saíram (cota ou erro do Resend)` : ""}.
              </span>
            )}
          </p>
          {warn && (
            <p role="alert" className="text-sm text-danger">
              Perto do limite do plano gratuito do Resend. Hora de decidir: plano pago ou mais gente no semanal.
            </p>
          )}
        </>
      )}
      {!status && !error && <p className="text-sm text-muted">Carregando…</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </section>
  );
}

function SignEditor({
  row,
  busy,
  onAct,
}: {
  row: Row;
  busy: string | null;
  onAct: (sign: string, action: Action, data?: Partial<Forecast>) => Promise<void>;
}) {
  const { sign, draft, published } = row;
  const [quote, setQuote] = useState(draft?.data.quote ?? "");
  const [cards, setCards] = useState<string[]>(draft?.data.cards.map((c) => c.text) ?? ["", "", ""]);

  useEffect(() => {
    setQuote(draft?.data.quote ?? "");
    setCards(draft?.data.cards.map((c) => c.text) ?? ["", "", ""]);
  }, [draft]);

  const dirty = !!draft && (quote !== draft.data.quote || cards.some((t, i) => t !== draft.data.cards[i].text));
  const edited = (): Partial<Forecast> => ({ quote, cards: cards.map((text, i) => ({ ...draft!.data.cards[i], text })) });
  const isBusy = (a: Action) => busy === `${sign}:${a}`;
  const anyBusy = !!busy;

  const status = published
    ? { text: `Publicado às ${timeLabel(published.publishedAt)}${published.source === "fallback" ? ", texto de reserva" : published.source === "auto" ? ", sem aprovação" : ""}`, tone: "text-ink" }
    : draft?.status === "approved"
      ? { text: "Aprovado, publica às 06h05", tone: "text-accent" }
      : draft
        ? { text: `Rascunho gerado às ${timeLabel(draft.generatedAt)}${draft.editedAt ? ", editado" : ""}`, tone: "text-muted" }
        : { text: "Sem rascunho", tone: "text-muted" };

  return (
    <article className="py-8" aria-label={sign}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 mb-4">
        <h2 className="flex items-baseline gap-3">
          <span className="font-display font-light text-[clamp(30px,7vw,40px)] leading-none tracking-[-0.02em]">{sign}</span>
          <span className="font-glyph text-xl text-accent" aria-hidden="true">{SIGN_SYMBOLS[sign]}{TEXT_GLYPH}</span>
        </h2>
        <span className={`text-xs uppercase tracking-[0.14em] ${status.tone}`}>{status.text}</span>
      </header>

      {draft ? (
        <>
          <p className={`${eyebrow} mb-3`}>{draft.data.planetLine}</p>

          <label htmlFor={`quote-${sign}`} className="sr-only">Leitura do dia</label>
          <textarea
            id={`quote-${sign}`}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className={`${field} font-display text-[19px] mb-4`}
          />

          <dl className="border-t border-ink mb-5">
            {["Amor", "Trabalho", "Energia"].map((label, i) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-3 border-b border-rule">
                <dt className="font-display italic text-lg text-accent">
                  <label htmlFor={`${label}-${sign}`}>{label}</label>
                </dt>
                <dd className="m-0">
                  <textarea
                    id={`${label}-${sign}`}
                    value={cards[i]}
                    onChange={(e) => setCards(cards.map((t, j) => (j === i ? e.target.value : t)))}
                    rows={2}
                    className={`${field} text-sm`}
                  />
                  <span className={`block mt-1 text-[11px] tabular-nums ${cards[i].length > 180 ? "text-danger" : "text-muted"}`}>
                    {cards[i].length}/180
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {draft.status !== "approved" ? (
              <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "approve", dirty ? edited() : undefined)} className={primary}>
                {isBusy("approve") ? "Aprovando…" : dirty ? "Salvar e aprovar" : "Aprovar"}
              </button>
            ) : (
              <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "unapprove")} className={link}>
                {isBusy("unapprove") ? "…" : "Desfazer aprovação"}
              </button>
            )}
            {dirty && (
              <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "save", edited())} className={link}>
                {isBusy("save") ? "Salvando…" : "Salvar sem aprovar"}
              </button>
            )}
            <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "publish")} className={link}>
              {isBusy("publish") ? "Publicando…" : published ? "Republicar agora" : "Publicar agora"}
            </button>
            <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "regenerate")} className={`${link} text-ink-2`}>
              {isBusy("regenerate") ? "Gerando…" : "Regenerar"}
            </button>
          </div>
        </>
      ) : (
        <button type="button" disabled={anyBusy} onClick={() => onAct(sign, "regenerate")} className={primary}>
          {isBusy("regenerate") ? "Gerando…" : "Gerar rascunho"}
        </button>
      )}
    </article>
  );
}
