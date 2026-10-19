import { NextRequest, NextResponse } from "next/server";
import { EMAIL_FROM, getRedis, getResend } from "@/lib/clients";
import { releaseEmails, reserveEmails } from "@/lib/email-quota";
import { welcomeEmailHtml, welcomeEmailSubject } from "@/emails/welcome";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  // ZADD com timestamp como score — preserva ordem de cadastro e ignora duplicatas
  const added = await redis.zadd(
    "sinergia:emails",
    { nx: true },
    { score: Date.now(), member: email.toLowerCase().trim() }
  );

  // Envia boas-vindas apenas para novos cadastros, se ainda houver cota
  if (added === 1) {
    const resend = getResend();
    if (resend && (await reserveEmails(redis, 1)) === 1) {
      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: welcomeEmailSubject,
        html: welcomeEmailHtml(email),
      });
      if (error) {
        await releaseEmails(redis, 1);
        console.error("[email] Falha nas boas-vindas:", error);
      }
    }
  }

  return NextResponse.json({ ok: true, new: added === 1 });
}
