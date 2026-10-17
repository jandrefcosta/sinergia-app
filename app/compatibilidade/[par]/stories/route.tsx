import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { RELATIONS, elementLine, pairSlug, parsePairSlug, relationOf } from "@/lib/compatibility";

/**
 * Card vertical (1080×1920) de um par de signos, para Stories.
 * Mesmas margens seguras do card do quiz.
 */

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";
const rule = "#e6e0d8";

export async function GET(_req: Request, { params }: { params: Promise<{ par: string }> }) {
  const { par } = await params;
  const pair = parsePairSlug(par);
  if (!pair || pairSlug(pair.a, pair.b) !== par) return new Response("Not found", { status: 404 });
  const { a, b } = pair;
  const rel = RELATIONS[relationOf(a, b)];
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: paper,
          color: ink,
          padding: "260px 96px 280px",
          fontFamily: "Instrument Sans, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", borderBottom: `3px solid ${ink}`, paddingBottom: 28 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 64 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: muted, marginTop: 10 }}>
            {`Compatibilidade · ${rel.label}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 140, lineHeight: 1, letterSpacing: -4 }}>{a}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 80, fontStyle: "italic", color: accent, margin: "8px 0" }}>e</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 140, lineHeight: 1, letterSpacing: -4, marginBottom: 44 }}>{b}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 50, lineHeight: 1.3, color: ink2, marginBottom: 40 }}>{rel.headline}</div>
          <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${rule}`, paddingTop: 32 }}>
            <div style={{ fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 10 }}>No amor</div>
            <div style={{ fontSize: 38, lineHeight: 1.4, color: ink2 }}>{rel.amor}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: `3px solid ${ink}`, paddingTop: 32 }}>
          <div style={{ fontSize: 38, fontWeight: 600 }}>{`${elementLine(a, b)}. E vocês?`}</div>
          <div style={{ fontSize: 32, color: accent, marginTop: 10 }}>sinergia-astros.app/compatibilidade</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    }
  );
}
