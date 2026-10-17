"use client";

import { useState } from "react";
import { events } from "@/lib/analytics";

/**
 * Dois links de texto: compartilhar (nativo no celular, WhatsApp no desktop)
 * e copiar link. Genérico: recebe a URL e o texto.
 */

type Props = {
  url: string;
  text: string;
  /** Rótulo enviado ao Analytics no parâmetro `sign`. */
  label: string;
  shareLabel?: string;
  /** Caminho de uma imagem vertical; mostra o botão "Salvar para Stories". */
  storiesImage?: string;
};

const btn =
  "text-sm font-medium text-ink border-b border-rule-strong pb-0.5 cursor-pointer hover:border-ink transition-colors " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function ShareButtons({ url, text, label, shareLabel = "Compartilhar", storiesImage }: Props) {
  const [copied, setCopied] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);

  function withMedium(medium: string): string {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://sinergia-astros.app");
    u.searchParams.set("utm_source", "share");
    u.searchParams.set("utm_medium", medium);
    return u.toString();
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Sinergia", text, url: withMedium("native") });
        events.share("native", label);
      } catch {
        // cancelado
      }
      return;
    }
    events.share("whatsapp", label);
    const msg = encodeURIComponent(`${text}\n${withMedium("whatsapp")}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(withMedium("copy"));
      events.share("copy", label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível
    }
  }

  // No celular abre a folha de compartilhamento com a imagem (Instagram, WhatsApp);
  // onde não dá para compartilhar arquivo, baixa o PNG.
  async function stories() {
    if (!storiesImage || loadingStories) return;
    setLoadingStories(true);
    try {
      const res = await fetch(storiesImage);
      if (!res.ok) return;
      const blob = await res.blob();
      const file = new File([blob], "sinergia-stories.png", { type: "image/png" });
      if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          events.share("stories", label);
        } catch {
          // cancelado
        }
        return;
      }
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      events.share("stories_download", label);
    } catch {
      // rede indisponível
    } finally {
      setLoadingStories(false);
    }
  }

  return (
    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
      <button type="button" onClick={share} className={btn}>{shareLabel}</button>
      {storiesImage && (
        <button type="button" onClick={stories} className={btn} aria-busy={loadingStories}>
          {loadingStories ? "Gerando imagem…" : "Salvar para Stories"}
        </button>
      )}
      <button type="button" onClick={copy} className={btn} aria-live="polite">
        {copied ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}
