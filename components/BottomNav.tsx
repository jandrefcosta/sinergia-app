export default function BottomNav() {
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
      <div
        className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl bg-gradient-to-br from-[#B87333]/20 to-[#4A0E0E]/20 text-secondary animate-glow-pulse min-w-[52px] min-h-[44px]"
        aria-current="page"
      >
        <span className="material-symbols-outlined filled text-2xl" aria-hidden="true">
          auto_awesome
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest">Daily</span>
      </div>
    </nav>
  );
}
