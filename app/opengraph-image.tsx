import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "Sinergia · O céu de hoje, lido para você";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fbfaf7",
          color: "#17130f",
          padding: "64px 72px",
          fontFamily: "Instrument Sans, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34, borderBottom: "2px solid #17130f", paddingBottom: 16 }}>
          <span>Siner</span>
          <span style={{ fontStyle: "italic", color: "#6f1d24" }}>gia</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Fraunces, serif", fontSize: 92, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>O céu de hoje,</span>
          <span style={{ display: "flex" }}>
            <span style={{ fontStyle: "italic", color: "#6f1d24", marginRight: 22 }}>lido</span>
            <span>para você.</span>
          </span>
        </div>
        <div style={{ fontSize: 24, color: "#4a433c", maxWidth: 900 }}>
          Uma previsão por dia, escrita com calma a partir das posições reais dos planetas.
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
