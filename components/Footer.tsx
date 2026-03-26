export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full py-10 md:py-12 px-6 bg-surface"
      role="contentinfo"
      aria-label="Rodapé do site"
    >
      <div className="horizontal-fade mb-10 max-w-7xl mx-auto" aria-hidden="true" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <a
          href="/"
          className="flex items-center gap-1.5 transition-celestial hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded-sm"
          aria-label="Sinergia — Início"
        >
          <span
            className="material-symbols-outlined text-primary text-lg"
            aria-hidden="true"
          >
            auto_awesome
          </span>
          <span className="font-headline text-lg italic text-primary copper-glow">
            Sinergia
          </span>
        </a>

        {/* Copyright */}
        <p className="font-label text-xs text-primary/50">
          © {year} Sinergia.{" "}
          <span className="italic">Guided by the Stars.</span>
        </p>
      </div>
    </footer>
  );
}
