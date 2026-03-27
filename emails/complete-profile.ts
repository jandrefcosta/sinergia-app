export function completeProfileEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Os astros ainda não te conhecem — Sinergia</title>
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
              <p style="margin:0 0 24px;font-size:40px;line-height:1;">🌑</p>
              <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#ffb3ad;font-style:italic;font-weight:400;">
                Os astros ainda não<br/>sabem quem você é.
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#c9b8b8;font-family:Arial,sans-serif;">
                Você se cadastrou no Sinergia, mas suas previsões<br/>
                ainda não são totalmente suas — falta o mais<br/>
                importante: o seu mapa.
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

          <!-- What unlocks -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                O que você desbloqueia
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff08;">
                    <p style="margin:0;font-size:14px;color:#ffb77b;font-style:italic;">✦&nbsp;&nbsp;Previsão do seu signo</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">Amor, energia e trabalho escritos para você especificamente.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #ffffff08;">
                    <p style="margin:0;font-size:14px;color:#ffb77b;font-style:italic;">☀️&nbsp;&nbsp;Entrega todas as manhãs</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">Antes das 7h, direto no seu email, antes do café.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0;font-size:14px;color:#ffb77b;font-style:italic;">🔮&nbsp;&nbsp;Mapa astral em breve</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.5;">Sua data de nascimento abre o caminho para muito mais.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://sinergia-astros.app" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#B87333 0%,#4A0E0E 100%);color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-family:Arial,sans-serif;font-weight:600;letter-spacing:0.05em;">
                Completar meu perfil agora
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#ffffff40;font-family:Arial,sans-serif;">
                Leva menos de 30 segundos.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff30;font-family:Arial,sans-serif;line-height:1.6;">
                Você está recebendo este email porque se cadastrou em<br/>
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

export const completeProfileEmailSubject = "Os astros ainda não te conhecem — complete seu perfil · Sinergia";
