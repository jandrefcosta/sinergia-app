export default function Footer() {
  return (
    <footer className="mt-16 flex flex-wrap justify-between gap-2 border-t border-rule pt-4 text-xs text-muted">
      <span>Sinergia, {new Date().getFullYear()}</span>
      <span>
        Previsões escritas a partir das posições reais dos planetas ·{" "}
        <a href="/unsubscribe" className="underline underline-offset-2 hover:text-ink">
          Cancelar inscrição
        </a>
      </span>
    </footer>
  );
}
