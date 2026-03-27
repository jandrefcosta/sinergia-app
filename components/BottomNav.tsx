"use client";

import { useState } from "react";

export default function BottomNav() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.origin;
    const text = "✨ Descubra o que os astros têm a dizer para você hoje — Sinergia";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Sinergia", text, url });
      } catch {
        // cancelled
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <nav
      className={[
        "md:hidden fixed bottom-0 left-0 w-full z-50",
        "flex justify-around items-center px-2 pb-safe pt-2 h-20",
        "bg-[#161212]/80 backdrop-blur-2xl",
        "border-t border-[#FFB77B]/10",
        "shadow-[0_-10px_30px_rgba(74,14,14,0.5)]",
        "rounded-t-3xl",
      ].join(" ")}
      aria-label="Navegação inferior"
    >
      {/* Daily */}
      <div
        className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl bg-gradient-to-br from-[#B87333]/20 to-[#4A0E0E]/20 text-secondary animate-glow-pulse min-w-[52px] min-h-[44px]"
        aria-current="page"
      >
        <span className="material-symbols-outlined filled text-2xl" aria-hidden="true">
          auto_awesome
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest">Daily</span>
      </div>

      {/* Share */}
      <button
        onClick={handleShare}
        aria-label="Compartilhar Sinergia"
        className={[
          "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl min-w-[52px] min-h-[44px]",
          "transition-all duration-300",
          copied
            ? "text-[#4ade80] bg-[#4ade80]/10"
            : "text-[#FFB77B]/60 hover:text-[#FFB77B] hover:bg-[#FFB77B]/10",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB77B]/60",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-2xl" aria-hidden="true">
          {copied ? "check_circle" : "ios_share"}
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest">
          {copied ? "Copiado" : "Share"}
        </span>
      </button>
    </nav>
  );
}
