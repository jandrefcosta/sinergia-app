export default function Footer() {
  return (
    <footer className="mt-16 flex flex-wrap justify-between gap-2 border-t border-rule pt-4 text-xs text-muted">
      <span>Sinergia, {new Date().getFullYear()}</span>
      <span>
        <a href="/qual-e-o-meu-signo" className="underline underline-offset-2 hover:text-ink">
          Qual é o meu signo?
        </a>{" "}
        ·{" "}
        <a href="/quiz" className="underline underline-offset-2 hover:text-ink">
          Teste
        </a>{" "}
        ·{" "}
        <a href="/famosos" className="underline underline-offset-2 hover:text-ink">
          Famosos
        </a>{" "}
        ·{" "}
        <a href="/unsubscribe" className="underline underline-offset-2 hover:text-ink">
          Cancelar inscrição
        </a>
      </span>
    </footer>
  );
}
