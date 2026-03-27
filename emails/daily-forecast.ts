import type { Forecast } from "@/lib/forecast";

const CARD_ICONS: Record<string, string> = {
  favorite: "♥",
  work: "✦",
  bolt: "⚡",
};

export function dailyForecastEmailHtml(forecast: Forecast, email: string): string {
  const { sign, symbol, planetLine, quote, cards } = forecast;

  const cardsHtml = cards
    .map(
      (card) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #ffffff08;">
            <p style="margin:0;font-size:14px;color:#ffb77b;font-style:italic;">
              ${CARD_ICONS[card.icon] ?? "✦"}&nbsp;&nbsp;${card.label}
            </p>
            <p style="margin:6px 0 0;font-size:13px;color:#c9b8b8;font-family:Arial,sans-serif;line-height:1.6;">
              ${card.text}
            </p>
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sua previsão de hoje · Sinergia</title>
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

          <!-- Sign hero -->
          <tr>
            <td style="background:linear-gradient(160deg,#2a0e0e 0%,#1e1414 60%,#161212 100%);border-radius:20px;padding:40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:48px;line-height:1;">${symbol}</p>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                ${sign}
              </p>
              <p style="margin:12px 0 20px;font-size:12px;color:#ffb77b60;font-family:Arial,sans-serif;letter-spacing:0.1em;">
                ${planetLine}
              </p>
              <p style="margin:0;font-size:16px;line-height:1.8;color:#ffb3ad;font-style:italic;">
                ${quote}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #ffb77b20;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- Cards -->
          <tr>
            <td style="padding:0 40px 8px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ffb77b80;font-family:Arial,sans-serif;">
                Seu dia em detalhe
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${cardsHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 40px 40px;text-align:center;">
              <a href="https://sinergia-astros.app" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#B87333 0%,#4A0E0E 100%);color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-family:Arial,sans-serif;font-weight:600;letter-spacing:0.05em;">
                Ver previsão completa
              </a>
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

export function dailyForecastEmailSubject(sign: string, symbol: string): string {
  return `${symbol} Sua previsão de ${sign} para hoje · Sinergia`;
}
