export function nudgeProfileEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A previsão de amanhã vai sair sem você · Sinergia</title>
</head>
<body style="margin:0;padding:0;background:#161212;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#161212;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-size:28px;letter-spacing:0.15em;color:#ffb77b;font-style:italic;">
                Sinergia
              </p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                seu guia celestial
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(160deg,#2a0e0e 0%,#1e1414 60%,#161212 100%);border-radius:20px;padding:48px 40px;text-align:center;">
              <p style="margin:0 0 20px;font-size:40px;line-height:1;">🌒</p>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.4;color:#ffb3ad;font-style:italic;font-weight:400;">
                A previsão de amanhã<br/>vai sair sem você.
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Todo dia, antes das 7h, o Sinergia envia uma previsão astrológica
                personalizada para cada assinante. Amor, trabalho e energia —
                escritos para o seu signo, toda manhã.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #ffb77b20;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- The problem -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Seu email está cadastrado — mas os astros ainda não sabem o seu
                signo. Sem isso, sua previsão não é gerada e você não recebe nada.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                São menos de 30 segundos para mudar isso.
              </p>
            </td>
          </tr>

          <!-- What each field does -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                O que cada dado faz por você
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff08;">
                    <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">♈ &nbsp;Signo — obrigatório</p>
                    <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                      Ativa sua previsão. Sem ele, você não recebe nada.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff08;">
                    <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">🎂 &nbsp;Data de nascimento — recomendado</p>
                    <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                      Refina as previsões com trânsitos específicos do seu ano.
                      Conteúdo muito mais preciso e relevante para você.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">🕐 &nbsp;Hora de nascimento — opcional</p>
                    <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                      Revela seu ascendente e posiciona a Lua com exatidão.
                      O nível mais profundo de personalização disponível.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 12px;text-align:center;">
              <a href="https://sinergia-astros.app" style="display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#B87333 0%,#4A0E0E 100%);color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-family:Arial,sans-serif;font-weight:600;letter-spacing:0.06em;">
                Completar meu perfil agora
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#ffffff40;font-family:Arial,sans-serif;">
                Gratuito. Sem compromisso. Os astros já esperaram o suficiente.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff30;font-family:Arial,sans-serif;line-height:1.6;">
                Você recebe este email porque se cadastrou em<br/>
                <a href="https://sinergia-astros.app" style="color:#ffb77b60;text-decoration:none;">sinergia-astros.app</a>
                &nbsp;·&nbsp;
                <a href="https://sinergia-astros.app/unsubscribe?email=${encodeURIComponent(email)}" style="color:#ffb77b60;text-decoration:none;">cancelar inscrição</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const nudgeProfileEmailSubject = "A previsão de amanhã vai sair sem você · Sinergia";
