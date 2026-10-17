import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/clients";
import { getBRTPeriod, getOrComputeSky, getPublished, isValidPeriod } from "@/lib/forecast";
import { CAROUSEL_PARTS, dateLabel, skyHighlights, weekday } from "@/lib/instagram-content";
import { loadOgFonts } from "@/lib/og-fonts";
import { asJpeg } from "@/lib/og-jpeg";
import { signFromSlug } from "@/lib/slugs";

/**
 * Cards 4:5 (1080×1350) para o feed do Instagram, sempre em JPEG.
 *   /cards/{period}/ceu        o céu do dia
 *   /cards/{period}/capa-1|2   capa de cada carrossel
 *   /cards/{period}/{signo}    um slide por signo
 *
 * Só lê o que já está publicado: abrir a URL nunca publica nada.
 */

export const dynamic = "force-dynamic";

const W = 1080;
const H = 1350;
const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";
const rule = "#e6e0d8";

/** Hoje, ontem e os dois próximos dias. Fora disso, 404. */
function inWindow(period: string): boolean {
  const day = 86400000;
  const diff = (Date.parse(period) - Date.parse(getBRTPeriod())) / day;
  return diff >= -1 && diff <= 2;
}

function Header({ period }: { period: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `3px solid ${ink}`, paddingBottom: 20 }}>
      <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 48 }}>
        <span>Siner</span>
        <span style={{ fontStyle: "italic", color: accent }}>gia</span>
      </div>
      <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: muted }}>{dateLabel(period)}</div>
    </div>
  );
}

function Footer({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: muted, borderTop: `1px solid ${rule}`, paddingTop: 20 }}>
      <span>{left}</span>
      <span style={{ color: accent }}>{right}</span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: paper,
        color: ink,
        padding: "64px 80px",
        fontFamily: "Instrument Sans, sans-serif",
      }}
    >
      {children}
    </div>
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ period: string; slide: string }> }) {
  const { period, slide } = await params;
  if (!isValidPeriod(period) || !inWindow(period)) return new Response("Not found", { status: 404 });
  const redis = getRedis();
  const fonts = await loadOgFonts();
  let body: React.ReactElement | null = null;

  if (slide === "ceu") {
    const h = skyHighlights(await getOrComputeSky(period, redis));
    body = (
      <Frame>
        <Header period={period} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 120, lineHeight: 1, letterSpacing: -4, marginBottom: 36 }}>O céu de hoje</div>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 46, color: accent, marginBottom: 8 }}>{h.moon}</div>
          {h.sun && <div style={{ fontSize: 30, color: ink2, marginBottom: 40 }}>{h.sun}</div>}
          <div style={{ display: "flex", flexDirection: "column", borderTop: `2px solid ${ink}` }}>
            {h.aspects.map((a) => (
              <div key={a} style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 40, color: ink, padding: "18px 0", borderBottom: `1px solid ${rule}` }}>
                {a}
              </div>
            ))}
          </div>
          {h.retrogrades.length > 0 && (
            <div style={{ fontSize: 28, color: ink2, marginTop: 28 }}>{`Retrógrados: ${h.retrogrades.join(", ")}`}</div>
          )}
        </div>
        <Footer left="O que isso muda para o seu signo" right="link na bio" />
      </Frame>
    );
  } else if (slide === "capa-1" || slide === "capa-2") {
    const signs = CAROUSEL_PARTS[slide === "capa-1" ? 1 : 2];
    body = (
      <Frame>
        <Header period={period} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: muted, marginBottom: 20 }}>{`O céu de ${weekday(period)}`}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 132, lineHeight: 1.02, letterSpacing: -4 }}>Signo por signo</div>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 72, color: accent, marginTop: 24 }}>
            {`${signs[0]} a ${signs[signs.length - 1]}`}
          </div>
          <div style={{ fontSize: 30, color: ink2, marginTop: 48, lineHeight: 1.4 }}>{signs.join(" · ")}</div>
        </div>
        <Footer left="Arraste para ler o seu" right="→" />
      </Frame>
    );
  } else {
    const sign = signFromSlug(slide);
    const data = sign && redis ? await getPublished(redis, period, sign) : null;
    if (!data || data.source === "fallback") return new Response("Not found", { status: 404 });
    const quoteSize = data.quote.length > 220 ? 36 : data.quote.length > 160 ? 40 : 44;
    body = (
      <Frame>
        <Header period={period} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          {data.planetLine && (
            <div style={{ fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 12 }}>{data.planetLine}</div>
          )}
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 112, lineHeight: 1, letterSpacing: -4, marginBottom: 28 }}>{data.sign}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: quoteSize, lineHeight: 1.3, color: ink2, marginBottom: 32 }}>{data.quote}</div>
          <div style={{ display: "flex", flexDirection: "column", borderTop: `2px solid ${ink}` }}>
            {data.cards.map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 24, padding: "14px 0", borderBottom: `1px solid ${rule}` }}>
                <div style={{ width: 150, flexShrink: 0, fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 30, color: accent }}>{c.label}</div>
                <div style={{ flex: 1, fontSize: 25, lineHeight: 1.4, color: ink2 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>
        <Footer left={`sinergia-astros.app/signo/${slide}`} right="link na bio" />
      </Frame>
    );
  }

  const png = new ImageResponse(body, {
    width: W,
    height: H,
    fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
    headers: { "Cache-Control": "public, max-age=300" },
  });
  return asJpeg(png);
}
