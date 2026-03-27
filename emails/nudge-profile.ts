export function nudgeProfileEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sua previsão ainda não é sua de verdade · Sinergia</title>
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
              <p style="margin:0 0 20px;font-size:36px;line-height:1;">🌒</p>
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.4;color:#ffb3ad;font-style:italic;font-weight:400;">
                Os astros estão prontos.<br/>Só falta você.
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Você se cadastrou no Sinergia, mas sua previsão diária<br/>
                ainda não chegou — porque os astros ainda não<br/>
                sabem qual é o seu signo.
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

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                São apenas dois campos: <span style="color:#ffb77b;">seu signo</span> e
                <span style="color:#ffb77b;">sua data de nascimento</span>.
                Com isso, você recebe toda manhã uma previsão escrita
                especialmente para você — amor, trabalho e energia,
                antes do café.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.8;color:#c9b8b8;font-family:Arial,sans-serif;">
                Leva menos de 30 segundos. Os astros já esperaram
                o suficiente.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <a href="https://sinergia-astros.app" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#B87333 0%,#4A0E0E 100%);color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-family:Arial,sans-serif;font-weight:600;letter-spacing:0.05em;">
                Completar meu perfil agora
              </a>
              <p style="margin:16px 0 0;font-size:12px;color:#ffffff40;font-family:Arial,sans-serif;">
                Grátis. Sem compromisso.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#ffffff30;font-family:Arial,sans-serif;line-height:1.6;">
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

export const nudgeProfileEmailSubject = "Os astros estão prontos. Só falta você · Sinergia";
