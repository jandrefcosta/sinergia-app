import type { Forecast } from "@/lib/signs";
import { TEXT_GLYPH } from "@/lib/signs";
import ShareActions from "@/components/ShareActions";

/**
 * Apresentação de uma previsão. Sem estado, serve tanto na home (cliente)
 * quanto na página de compartilhamento por signo (servidor).
 */
export default function ForecastView({ data }: { data: Forecast }) {
  return (
    <>
      <p className="mb-3.5 text-xs uppercase tracking-[0.14em] text-muted">{data.planetLine}</p>
      <div className="mb-7 flex items-baseline gap-4">
        <h2 className="font-display font-light text-[clamp(44px,11vw,72px)] leading-none tracking-[-0.03em]">
          {data.sign}
        </h2>
        <span className="font-glyph text-[clamp(26px,6vw,38px)] text-accent" aria-hidden="true">
          {data.symbol}{TEXT_GLYPH}
        </span>
      </div>

      <p className="quote font-display text-[clamp(22px,5.2vw,28px)] leading-[1.32] tracking-[-0.012em] mb-11 [text-wrap:pretty]">
        {data.quote}
      </p>

      <dl className="border-t border-ink">
        {data.cards.map((card) => (
          <div key={card.label} className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1.5 sm:gap-4 py-5 border-b border-rule">
            <dt className="font-display italic text-xl text-accent">{card.label}</dt>
            <dd className="text-ink-2">{card.text}</dd>
          </div>
        ))}
      </dl>

      <ShareActions sign={data.sign} quote={data.quote} />
    </>
  );
}
