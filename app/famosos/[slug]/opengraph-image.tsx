import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { famousBySign, likeLine, pickForPeriod } from "@/lib/famous";
import { getBRTPeriod } from "@/lib/forecast";
import { signFromSlug } from "@/lib/slugs";

export const revalidate = 3600;
export const alt = "Famosos do signo · Sinergia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  const fonts = await loadOgFonts();
  const picks = sign ? pickForPeriod(sign, getBRTPeriod(), 3).map((f) => f.name) : [];
  const total = sign ? famousBySign(sign).length : 0;
  const line = sign ? likeLine(sign, picks) : "Famosos por signo";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: "56px 72px", fontFamily: "Instrument Sans, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: 16 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted }}>Famosos do signo</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 104, lineHeight: 1, letterSpacing: -3, marginBottom: 24 }}>{sign ?? "Sinergia"}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 40, lineHeight: 1.3, color: ink2, maxWidth: 1000 }}>{line}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: muted, borderTop: "1px solid #e6e0d8", paddingTop: 16 }}>
          <span>sinergia-astros.app</span>
          <span>{total ? `${total} nomes de ${sign}, entre artistas, atletas e personagens` : "Artistas, atletas e personagens"}</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
