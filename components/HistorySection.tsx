import { getRelativeDateLabel } from "@/lib/utils";

const HISTORY_ITEMS = [
  {
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })(),
    title: "A Estrela: Um caminho de esperança se abre no campo financeiro",
    excerpt: "Júpiter expande horizontes. Novos fluxos de abundância emergem de parcerias inesperadas.",
  },
  {
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d; })(),
    title: "O Eremita: O silêncio é sua ferramenta mais potente para a decisão",
    excerpt: "Saturno convoca introspecção. Afaste-se do ruído antes de agir.",
  },
  {
    date: (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d; })(),
    title: "A Roda da Fortuna: Mudanças abruptas exigem adaptabilidade",
    excerpt: "Urano em tensão com Marte anuncia virada. O inesperado traz presente disfarçado.",
  },
];

export default function HistorySection() {
  return (
    <section
      id="history"
      className="space-y-5 pt-2"
      aria-label="Histórico de previsões recentes"
    >
      <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-primary/40">
        Ecos Recentes
      </h3>

      <div className="space-y-2" role="list">
        {HISTORY_ITEMS.map((item, index) => (
          <article
            key={index}
            role="listitem"
            className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/50"
          >
            <time
              dateTime={item.date.toISOString().split("T")[0]}
              className="shrink-0 text-xs font-label text-outline/60 italic w-14 text-right"
            >
              {getRelativeDateLabel(item.date)}
            </time>

            <span className="text-sm font-headline italic text-on-surface/80 truncate">
              {item.title}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
