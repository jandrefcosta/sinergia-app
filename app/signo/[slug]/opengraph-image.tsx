import { ImageResponse } from "next/og";
import { getRedis } from "@/lib/clients";
import { getForecast } from "@/lib/forecast";
import { loadOgFonts } from "@/lib/og-fonts";
import { signFromSlug } from "@/lib/slugs";

export const revalidate = 1800;
export const alt = "Previsão do dia · Sinergia";
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
  const data = sign ? await getForecast(sign, getRedis()) : null;
  const fonts = await loadOgFonts();

  const dateLabel = new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })
    .replace("-feira", "");

  const quote = data?.quote ?? "O céu de hoje, lido para você.";
  const quoteSize = quote.length > 220 ? 34 : quote.length > 160 ? 38 : 44;

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: `2px solid ${ink}`,
            paddingBottom: 16,
          }}
        >
          <div style={{ display: "flex", fontFamily: "Fraunces, serif", fontSize: 34 }}>
            <span>Siner</span>
            <span style={{ fontStyle: "italic", color: accent }}>gia</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted }}>{dateLabel}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", paddingTop: 24 }}>
          {data?.planetLine && (
            <div style={{ fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 14 }}>
              {data.planetLine}
            </div>
          )}
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 96, lineHeight: 1, letterSpacing: -3, marginBottom: 28 }}>
            {data?.sign ?? "Sinergia"}
          </div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: quoteSize, lineHeight: 1.3, color: ink2, maxWidth: 1000 }}>
            {quote}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: muted, borderTop: `1px solid #e6e0d8`, paddingTop: 16 }}>
          <span>sinergia-astros.app</span>
          <span>Uma previsão por dia, a partir das posições reais dos planetas</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })) }
  );
}
