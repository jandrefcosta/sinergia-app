"use client";

export default function Header() {
  return (
    <header
      className="fixed top-0 w-full z-50 bg-[#161212]/60 backdrop-blur-xl border-b border-[#FFB77B]/15 shadow-wine-sm"
      role="banner"
    >
      <div className="flex justify-between items-center px-4 md:px-8 h-[72px] w-full max-w-7xl mx-auto">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 transition-celestial hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded-md"
          aria-label="Sinergia — Página inicial"
        >
          <span
            className="material-symbols-outlined text-primary text-xl"
            aria-hidden="true"
          >
            auto_awesome
          </span>
          <span className="text-2xl font-headline italic tracking-tighter text-secondary copper-glow select-none">
            Sinergia
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Navegação principal"
        >
          <a
            href="#forecast"
            className="font-headline text-base tracking-tight transition-celestial hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded-sm text-secondary border-b-2 border-secondary pb-0.5"
            aria-current="page"
          >
            Forecast
          </a>
        </nav>
      </div>
    </header>
  );
}
