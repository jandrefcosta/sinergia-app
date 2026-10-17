import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { RELATIONS, elementLine, parsePairSlug, relationOf } from "@/lib/compatibility";

export const alt = "Compatibilidade entre signos · Sinergia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export default async function Image({ params }: { params: Promise<{ par: string }> }) {
  const { par } = await params;
  const pair = parsePairSlug(par);
  const fonts = await loadOgFonts();
  const rel = pair ? RELATIONS[relationOf(pair.a, pair.b)] : null;
  // "Capricórnio e Capricórnio" não cabe a 96px
  const titleSize = pair && pair.a.length + pair.b.length > 16 ? 76 : 96;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: "56px 72px", fontFamily: "Instrument Sans, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: 16 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted }}>Compatibilidade</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: titleSize, lineHeight: 1, letterSpacing: -3, marginBottom: 24 }}>
            <span>{pair ? pair.a : "Signos"}</span>
            <span style={{ fontStyle: "italic", color: accent, margin: "0 28px" }}>e</span>
            <span>{pair ? pair.b : "signos"}</span>
          </div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 40, lineHeight: 1.3, color: ink2, maxWidth: 1000 }}>
            {rel ? rel.headline : "Vocês combinam?"}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: muted, borderTop: "1px solid #e6e0d8", paddingTop: 16 }}>
          <span>sinergia-astros.app</span>
          <span>{pair && rel ? `${rel.label} · ${elementLine(pair.a, pair.b)}` : "Amor, amizade e trabalho"}</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
