import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/clients";
import { getForecast } from "@/lib/forecast";
import { loadOgFonts } from "@/lib/og-fonts";
import { asJpeg, wantsJpeg } from "@/lib/og-jpeg";
import { signFromSlug, slugFor } from "@/lib/slugs";

/**
 * Card vertical (1080×1920) da previsão publicada de hoje, para Stories.
 * Mesmas margens de segurança do card do quiz.
 */

export const dynamic = "force-dynamic";

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) return new Response("Not found", { status: 404 });

  const [data, fonts] = await Promise.all([getForecast(sign, getRedis()), loadOgFonts()]);

  const dateLabel = new Date(`${data.period}T12:00:00-03:00`)
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })
    .replace("-feira", "");
  const quoteSize = data.quote.length > 220 ? 50 : data.quote.length > 160 ? 56 : 62;

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `3px solid ${ink}`, paddingBottom: 24 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 56 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: muted }}>{dateLabel}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          {data.planetLine && (
            <div style={{ fontSize: 26, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 18 }}>
              {data.planetLine}
            </div>
          )}
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 170, lineHeight: 1, letterSpacing: -5, marginBottom: 40 }}>{data.sign}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: quoteSize, lineHeight: 1.3, color: ink2 }}>{data.quote}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: `3px solid ${ink}`, paddingTop: 32 }}>
          <div style={{ fontSize: 38, fontWeight: 600 }}>Amor, trabalho e energia de hoje</div>
          <div style={{ fontSize: 32, color: accent, marginTop: 10 }}>{`sinergia-astros.app/signo/${slugFor(sign)}`}</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
      headers: { "Cache-Control": "public, max-age=600" },
    }
  );

  return wantsJpeg(req) ? asJpeg(png) : png;
}
