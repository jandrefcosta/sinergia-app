import { button, heading, paragraph, shell } from "@/emails/layout";
import { SITE_URL } from "@/lib/clients";

export function welcomeEmailHtml(email: string): string {
  const body = `
    ${heading("Bem-vindo. <em>Amanhã cedo</em> a gente se fala.")}
    ${paragraph("Sua primeira previsão chega por volta das 7h, no horário de Brasília. É um texto curto, escrito a partir das posições reais dos planetas do dia, para ler antes do café.")}
    ${paragraph("Enquanto isso, a previsão de hoje já está no site.")}
    ${button("Ler a previsão de hoje", SITE_URL)}`;

  return shell({
    title: "Bem-vindo ao Sinergia",
    preheader: "Sua primeira previsão chega amanhã, por volta das 7h.",
    body,
    email,
  });
}

export const welcomeEmailSubject = "Bem-vindo ao Sinergia";
