import { SITE_URL } from "@/lib/clients";

/**
 * Base comum dos emails, na mesma identidade do site: papel claro, tinta escura,
 * um acento vinho, serifa nos títulos. Tudo inline e em tabelas, como email pede.
 */

export const colors = {
  paper: "#fbfaf7",
  ink: "#17130f",
  ink2: "#4a433c",
  muted: "#8a8078",
  rule: "#e6e0d8",
  accent: "#6f1d24",
  accentInk: "#ffffff",
};

export const fonts = {
  display: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  ui: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
}

/** Rótulo pequeno em caixa alta, como os do site. */
export function eyebrow(text: string): string {
  return `<p style="margin:0 0 12px;font-family:${fonts.ui};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${colors.muted};">${text}</p>`;
}

/** Título em serifa leve. `em` vira itálico no acento. */
export function heading(html: string, size = 34): string {
  return `<h1 style="margin:0 0 16px;font-family:${fonts.display};font-weight:normal;font-size:${size}px;line-height:1.08;letter-spacing:-0.01em;color:${colors.ink};">${html.replace(
    /<em>/g,
    `<em style="font-style:italic;color:${colors.accent};">`
  )}</h1>`;
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${fonts.ui};font-size:16px;line-height:1.55;color:${colors.ink2};">${html}</p>`;
}

export function button(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 0;"><tr><td style="background:${colors.accent};">
    <a href="${href}" style="display:inline-block;padding:13px 22px;font-family:${fonts.ui};font-size:15px;font-weight:bold;color:${colors.accentInk};text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

export function rule(strong = false): string {
  return `<tr><td style="padding:0;border-top:1px solid ${strong ? colors.ink : colors.rule};font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

export function shell(opts: { title: string; preheader?: string; body: string; email: string; dateLabel?: string }): string {
  const { title, preheader, body, email, dateLabel } = opts;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.paper};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${colors.paper};">
    <tr>
      <td align="center" style="padding:32px 20px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">

          <tr>
            <td style="padding-bottom:14px;border-bottom:1px solid ${colors.ink};">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
                <td style="font-family:${fonts.display};font-size:22px;color:${colors.ink};">
                  <a href="${SITE_URL}" style="color:${colors.ink};text-decoration:none;">Siner<em style="font-style:italic;color:${colors.accent};">gia</em></a>
                </td>
                <td align="right" style="font-family:${fonts.ui};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${colors.muted};">
                  ${dateLabel ?? ""}
                </td>
              </tr></table>
            </td>
          </tr>

          <tr><td style="padding:36px 0 8px;">${body}</td></tr>

          <tr>
            <td style="padding-top:16px;border-top:1px solid ${colors.rule};font-family:${fonts.ui};font-size:12px;line-height:1.6;color:${colors.muted};">
              Você recebe este email porque cadastrou ${escapeHtml(email)} no Sinergia.<br />
              <a href="${SITE_URL}" style="color:${colors.muted};">sinergia-astros.app</a>
              &nbsp;·&nbsp;
              <a href="${unsubscribeUrl(email)}" style="color:${colors.muted};">Cancelar inscrição</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
