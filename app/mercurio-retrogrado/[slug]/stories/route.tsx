import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { signFromSlug } from "@/lib/slugs";
import { HOUSES } from "@/lib/retrograde-copy";
import { houseFor, rangeLabel, upcomingRetrogrades } from "@/lib/retrograde";

/**
 * Card vertical (1080×1920) de Mercúrio retrógrado por signo, para Stories.
 * Mesmas margens seguras do card do quiz.
 */

const paper = "#fbfaf7";
const ink = "#17130f";
const ink2 = "#4a433c";
const muted = "#8a8078";
const accent = "#6f1d24";
const rule = "#e6e0d8";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sign = signFromSlug(slug);
  if (!sign) return new Response("Not found", { status: 404 });
  const fonts = await loadOgFonts();
  const [r] = upcomingRetrogrades();
  const houseNumber = houseFor(sign, r.startSign);
  const house = HOUSES[houseNumber];

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
            Mercúrio retrógrado
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 40, color: ink2, marginBottom: 12 }}>{rangeLabel(r)}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 170, lineHeight: 1, letterSpacing: -5, marginBottom: 20 }}>{sign}</div>
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 60, fontStyle: "italic", color: accent, marginBottom: 40 }}>
            {`casa ${houseNumber}: ${house.theme}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${rule}`, paddingTop: 32 }}>
            <div style={{ fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 10 }}>Aproveite</div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 46, lineHeight: 1.3, color: ink2, marginBottom: 32 }}>{house.good}</div>
            <div style={{ fontSize: 30, letterSpacing: 3, textTransform: "uppercase", color: muted, marginBottom: 10 }}>Evite</div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 46, lineHeight: 1.3, color: ink2 }}>{house.avoid}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderTop: `3px solid ${ink}`, paddingTop: 32 }}>
          <div style={{ fontSize: 38, fontWeight: 600 }}>E o seu signo?</div>
          <div style={{ fontSize: 32, color: accent, marginTop: 10 }}>sinergia-astros.app/mercurio-retrogrado</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    }
  );
}
