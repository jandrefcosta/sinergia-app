import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { RESULT_COPY, parseCombo, tensionLine } from "@/lib/quiz";

export const alt = "Resultado do teste · Sinergia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export default async function Image({ params }: { params: Promise<{ combo: string }> }) {
  const { combo } = await params;
  const parsed = parseCombo(combo);
  const fonts = await loadOgFonts();

  const quiz = parsed?.quiz ?? null;
  const real = parsed?.real ?? null;
  const body = quiz ? (real ? tensionLine(quiz, real) : RESULT_COPY[quiz]) : "Sete perguntas sobre o seu jeito.";
  const bodySize = body.length > 140 ? 30 : 34;

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
          padding: "56px 72px",
          fontFamily: "Instrument Sans, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `2px solid ${ink}`, paddingBottom: 16 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted }}>Com que signo você se parece?</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 26, color: ink2, marginBottom: 6 }}>{quiz ? "Eu respondo como" : "Teste"}</div>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Fraunces, serif", fontSize: 104, lineHeight: 1, letterSpacing: -3, marginBottom: 18 }}>
            <span>{quiz ?? "Sinergia"}</span>
            {real && real !== quiz && (
              <span style={{ fontSize: 40, fontStyle: "italic", color: accent, marginLeft: 26 }}>mas sou {real}</span>
            )}
            {real && real === quiz && (
              <span style={{ fontSize: 40, fontStyle: "italic", color: accent, marginLeft: 26 }}>e sou {real} mesmo</span>
            )}
          </div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: bodySize, lineHeight: 1.3, color: ink2, maxWidth: 1000 }}>{body}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: muted, borderTop: "1px solid #e6e0d8", paddingTop: 16 }}>
          <span>sinergia-astros.app/quiz</span>
          <span>Faça o teste e descubra o seu</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
