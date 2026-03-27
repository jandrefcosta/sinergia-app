"use client";

import { useState, useRef, useEffect } from "react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://sinergia-astros.app";
  const shareText =
    "✨ Descubra o que os astros têm a dizer para você hoje — Sinergia";

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  async function handleClick() {
    // Native share on mobile if supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sinergia",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled — do nothing
      }
      return;
    }
    setOpen((v) => !v);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1800);
  }

  function shareWhatsApp() {
    const msg = encodeURIComponent(`${shareText}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        aria-label="Compartilhar Sinergia"
        aria-expanded={open}
        className={[
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-label",
          "bg-gradient-to-br from-[#B87333]/20 to-[#4A0E0E]/20",
          "text-[#FFB77B] hover:text-[#FFB3AD]",
          "border border-[#FFB77B]/20 hover:border-[#FFB77B]/40",
          "transition-all duration-300 cubic-bezier(0.22,1,0.36,1)",
          "hover:shadow-[0_0_16px_rgba(184,115,51,0.3)]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB77B]/60",
        ].join(" ")}
      >
        <span
          className="material-symbols-outlined text-[18px]"
          aria-hidden="true"
        >
          ios_share
        </span>
        <span className="hidden sm:inline">Compartilhar</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="menu"
          className={[
            "absolute right-0 mt-2 w-52 z-50",
            "bg-[#1e1515]/95 backdrop-blur-2xl",
            "rounded-2xl overflow-hidden",
            "shadow-[0_8px_32px_rgba(74,14,14,0.6),0_0_0_1px_rgba(255,183,123,0.12)]",
            "animate-in fade-in slide-in-from-top-1 duration-200",
          ].join(" ")}
        >
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] uppercase tracking-widest text-[#FFB77B]/50 font-label">
              Compartilhar via
            </p>
          </div>

          {/* WhatsApp */}
          <button
            role="menuitem"
            onClick={shareWhatsApp}
            className={[
              "w-full flex items-center gap-3 px-4 py-3",
              "text-sm text-[#FFB3AD] font-label text-left",
              "hover:bg-[#FFB77B]/10 transition-colors duration-150",
            ].join(" ")}
          >
            <span className="text-[#25D366] text-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </span>
            WhatsApp
          </button>

          {/* Copy link */}
          <button
            role="menuitem"
            onClick={copyLink}
            className={[
              "w-full flex items-center gap-3 px-4 py-3 mb-1",
              "text-sm font-label text-left transition-colors duration-150",
              copied
                ? "text-[#4ade80] bg-[#4ade80]/10"
                : "text-[#FFB3AD] hover:bg-[#FFB77B]/10",
            ].join(" ")}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              aria-hidden="true"
            >
              {copied ? "check_circle" : "link"}
            </span>
            {copied ? "Link copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
