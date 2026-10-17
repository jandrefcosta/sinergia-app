import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { RESULT_COPY, parseCombo, tensionLine } from "@/lib/quiz";

/**
 * Card vertical (1080×1920) do resultado do quiz, para Stories.
 * O conteúdo fica entre ~250px do topo e da base, fora da área coberta
 * pela interface do Instagram e do WhatsApp.
 */

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";
const rule = "#e6e0d8";

export async function GET(_req: Request, { params }: { params: Promise<{ combo: string }> }) {
  const { combo } = await params;
  const parsed = parseCombo(combo);
  if (!parsed) return new Response("Not found", { status: 404 });
  const { quiz, real } = parsed;
  const fonts = await loadOgFonts();

  const tension = real ? tensionLine(quiz, real) : null;
  const copy = RESULT_COPY[quiz];
  const copySize = copy.length > 160 ? 46 : 52;

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
            Com que signo você se parece?
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 40, color: ink2, marginBottom: 12 }}>Eu respondo como</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 170, lineHeight: 1, letterSpacing: -5, marginBottom: 20 }}>{quiz}</div>
          {real && (
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 64, fontStyle: "italic", color: accent, marginBottom: 48 }}>
              {real === quiz ? `e sou ${real} mesmo` : `mas sou ${real}`}
            </div>
          )}
          <div style={{ fontFamily: "Fraunces, serif", fontSize: copySize, lineHeight: 1.3, color: ink2, marginTop: real ? 0 : 36 }}>{copy}</div>
          {tension && (
            <div style={{ fontSize: 36, lineHeight: 1.4, color: ink2, borderTop: `1px solid ${rule}`, paddingTop: 32, marginTop: 44 }}>
              {tension}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: `3px solid ${ink}`, paddingTop: 32 }}>
          <div style={{ fontSize: 38, fontWeight: 600 }}>E você, se parece com qual?</div>
          <div style={{ fontSize: 32, color: accent, marginTop: 10 }}>sinergia-astros.app/quiz</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    }
  );
}
