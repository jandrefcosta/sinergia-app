import { button, heading, paragraph, shell } from "@/emails/layout";
import { SITE_URL } from "@/lib/clients";

/** Lembrete semanal para quem cadastrou o email mas não escolheu o signo. */
export function nudgeProfileEmailHtml(email: string): string {
  const body = `
    ${heading("Falta só o <em>seu signo.</em>")}
    ${paragraph("Seu email está na lista, mas ainda não sabemos para qual signo escrever. Sem isso, a previsão da manhã não sai.")}
    ${paragraph("Leva dez segundos: abra o site, escolha o signo e confirme o email.")}
    ${button("Escolher meu signo", SITE_URL)}`;

  return shell({
    title: "Falta só o seu signo · Sinergia",
    preheader: "Sem o signo, a previsão da manhã não sai.",
    body,
    email,
  });
}

export const nudgeProfileEmailSubject = "Falta só o seu signo · Sinergia";
