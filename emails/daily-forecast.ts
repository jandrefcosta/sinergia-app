import type { Forecast } from "@/lib/signs";
import { colors, escapeHtml, eyebrow, fonts, rule, shell } from "@/emails/layout";
import { SITE_URL } from "@/lib/clients";

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })
    .replace("-feira", "");
}

export function dailyForecastEmailHtml(forecast: Forecast, email: string): string {
  const { sign, symbol, planetLine, quote, cards } = forecast;
  const first = escapeHtml(quote.charAt(0));
  const rest = escapeHtml(quote.slice(1));

  const cardsHtml = cards
    .map(
      (card) => `
        <tr>
          <td style="padding:18px 0;border-bottom:1px solid ${colors.rule};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td width="110" valign="top" style="font-family:${fonts.display};font-style:italic;font-size:19px;color:${colors.accent};padding-right:12px;">${card.label}</td>
              <td valign="top" style="font-family:${fonts.ui};font-size:16px;line-height:1.55;color:${colors.ink2};">${escapeHtml(card.text)}</td>
            </tr></table>
          </td>
        </tr>`
    )
    .join("");

  const body = `
    ${eyebrow(escapeHtml(planetLine))}
    <p style="margin:0 0 24px;font-family:${fonts.display};font-weight:normal;font-size:52px;line-height:1;letter-spacing:-0.02em;color:${colors.ink};">
      ${escapeHtml(sign)} <span style="font-family:'Segoe UI Symbol','Apple Symbols',sans-serif;font-size:32px;color:${colors.accent};">${symbol}&#xFE0E;</span>
    </p>
    <p style="margin:0 0 32px;font-family:${fonts.display};font-size:24px;line-height:1.35;color:${colors.ink};">
      <span style="font-style:italic;color:${colors.accent};">${first}</span>${rest}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      ${rule(true)}
      ${cardsHtml}
    </table>
    <p style="margin:28px 0 0;font-family:${fonts.ui};font-size:14px;color:${colors.ink2};">
      <a href="${SITE_URL}" style="color:${colors.ink};text-decoration:none;border-bottom:1px solid ${colors.rule};">Ler no site</a>
    </p>`;

  return shell({
    title: `${sign}, hoje · Sinergia`,
    preheader: quote,
    body,
    email,
    dateLabel: todayLabel(),
  });
}

export function dailyForecastEmailSubject(sign: string, symbol: string): string {
  return `${symbol} ${sign}, hoje · Sinergia`;
}
