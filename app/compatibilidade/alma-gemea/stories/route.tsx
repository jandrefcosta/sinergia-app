import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { asJpeg, wantsJpeg } from "@/lib/og-jpeg";
import { signFromSlug } from "@/lib/slugs";
import { tierFor } from "@/lib/synastry";

/**
 * Card vertical (1080×1920) do resultado de alma gêmea, para Stories.
 * Recebe só o índice e os dois signos solares, nunca as datas.
 * /compatibilidade/alma-gemea/stories?s=87&a=leao&b=aquario
 */

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const score = Number(q.get("s"));
  const a = signFromSlug(q.get("a") ?? "");
  const b = signFromSlug(q.get("b") ?? "");
  if (!Number.isInteger(score) || score < 0 || score > 100 || !a || !b) {
    return new Response("Not found", { status: 404 });
  }
  const fonts = await loadOgFonts();

  const png = new ImageResponse(
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
            Índice de alma gêmea
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 340, lineHeight: 1, letterSpacing: -12 }}>{String(score)}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: 88, color: accent, marginTop: 8 }}>{tierFor(score)}</div>
          <div style={{ fontSize: 44, color: ink2, marginTop: 56 }}>{`${a} e ${b}`}</div>
          <div style={{ fontSize: 32, color: muted, marginTop: 12 }}>Sol, Lua, Vênus e Marte de cada um</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: `3px solid ${ink}`, paddingTop: 32 }}>
          <div style={{ fontSize: 38, fontWeight: 600 }}>E vocês, são alma gêmea?</div>
          <div style={{ fontSize: 32, color: accent, marginTop: 10 }}>sinergia-astros.app/compatibilidade</div>
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

  return wantsJpeg(req) ? asJpeg(png) : png;
}
