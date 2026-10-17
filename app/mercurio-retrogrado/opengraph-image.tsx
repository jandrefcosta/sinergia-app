import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { rangeLabel, signsLabel, upcomingRetrogrades } from "@/lib/retrograde";

export const revalidate = 3600;
export const alt = "Mercúrio retrógrado · Sinergia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export default async function Image() {
  const fonts = await loadOgFonts();
  const [r] = upcomingRetrogrades();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: paper, color: ink, padding: "56px 72px", fontFamily: "Instrument Sans, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: 16 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted }}>Céu do momento</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 96, lineHeight: 1, letterSpacing: -3, marginBottom: 24 }}>Mercúrio retrógrado</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 40, lineHeight: 1.3, color: ink2, maxWidth: 1000 }}>
            {`De ${rangeLabel(r)}, em ${signsLabel(r)}.`}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: muted, borderTop: "1px solid #e6e0d8", paddingTop: 16 }}>
          <span>sinergia-astros.app</span>
          <span>O que muda para cada signo</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
