import { button, heading, paragraph, shell } from "@/emails/layout";
import { SITE_URL } from "@/lib/clients";

/** Disparo manual (admin) para quem cadastrou o email antes de o signo ser obrigatório. */
export function completeProfileEmailHtml(email: string): string {
  const body = `
    ${heading("Sua previsão diária está <em>pronta para começar.</em>")}
    ${paragraph("Você deixou seu email com a gente há um tempo, mas nunca escolheu o signo. Agora o Sinergia escreve uma previsão por dia a partir das posições reais dos planetas, e ela pode chegar na sua caixa de entrada todas as manhãs.")}
    ${paragraph("Escolha o signo no site e confirme o mesmo email. Pronto.")}
    ${button("Ativar minha previsão", SITE_URL)}`;

  return shell({
    title: "Sua previsão diária está pronta para começar · Sinergia",
    preheader: "Escolha o signo e a previsão passa a chegar todas as manhãs.",
    body,
    email,
  });
}

export const completeProfileEmailSubject = "Sua previsão diária está pronta para começar · Sinergia";
