"use client";

import { useState } from "react";

type Props = { sign: string; quote: string };

const btn =
  "text-sm font-medium text-ink border-b border-rule-strong pb-0.5 cursor-pointer hover:border-ink transition-colors " +
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function ShareActions({ sign, quote }: Props) {
  const [copied, setCopied] = useState(false);

  function shareUrl(): string {
    return typeof window !== "undefined" ? window.location.origin : "https://sinergia-astros.app";
  }

  function shareText(): string {
    return `${sign}, hoje: "${quote}"\n\nSinergia, o céu de hoje lido para você.`;
  }

  async function nativeOrWhatsApp() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Sinergia", text: shareText(), url: shareUrl() });
      } catch {
        // cancelado pelo usuário
      }
      return;
    }
    const msg = encodeURIComponent(`${shareText()}\n${shareUrl()}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponível
    }
  }

  return (
    <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
      <button type="button" onClick={nativeOrWhatsApp} className={btn}>
        Compartilhar
      </button>
      <button type="button" onClick={copyLink} className={btn} aria-live="polite">
        {copied ? "Link copiado" : "Copiar link"}
      </button>
    </div>
  );
}
