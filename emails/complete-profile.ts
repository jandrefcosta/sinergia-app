export function completeProfileEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sua previsão ainda está esperando por você · Sinergia</title>
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
              <p style="margin:0 0 20px;font-size:40px;line-height:1;">🌑</p>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.4;color:#ffb3ad;font-style:italic;font-weight:400;">
                Você se cadastrou.<br/>Mas os astros ainda<br/>não te conhecem.
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Toda manhã, antes das 7h, o Sinergia envia uma previsão<br/>
                astrológica personalizada direto no seu email.<br/>
                Amor, trabalho e energia — escritos para o seu signo.
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

          <!-- How it works -->
          <tr>
            <td style="padding:0 40px 8px;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                Como funciona
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                O Sinergia usa seu signo e data de nascimento para gerar uma
                previsão diária única — não é conteúdo genérico, é uma leitura
                escrita especificamente para o seu momento astral.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Você acorda, abre o email e já sabe o que os astros têm a dizer
                sobre o seu dia antes de qualquer coisa.
              </p>
            </td>
          </tr>

          <!-- Levels of precision -->
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                O que cada dado desbloqueia
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Level 1 -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:2px;">
                          <p style="margin:0;font-size:16px;">♈</p>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">Signo</p>
                          <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                            Previsão diária personalizada para o seu signo solar —
                            o ponto de partida de tudo.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Level 2 -->
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:2px;">
                          <p style="margin:0;font-size:16px;">🎂</p>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">Data de nascimento</p>
                          <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                            Refina as previsões com os trânsitos planetários do seu
                            ano de nascimento. Conteúdo mais preciso e contextualizado.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Level 3 -->
                <tr>
                  <td style="padding:14px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:32px;vertical-align:top;padding-top:2px;">
                          <p style="margin:0;font-size:16px;">🕐</p>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="margin:0 0 3px;font-size:14px;color:#ffb77b;font-style:italic;">Hora de nascimento <span style="color:#ffb77b60;font-size:11px;font-style:normal;">(opcional)</span></p>
                          <p style="margin:0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">
                            Desvenda seu ascendente e posiciona a Lua com exatidão —
                            o nível mais profundo de personalização possível.
                          </p>
                        </td>
                      </tr>
                    </table>
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
                Leva menos de 30 segundos. Gratuito.
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

export const completeProfileEmailSubject = "Sua previsão diária está esperando — complete seu perfil · Sinergia";
