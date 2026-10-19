import { NextRequest, NextResponse } from "next/server";
import { EMAIL_FROM, getRedis, getResend } from "@/lib/clients";
import { sendWithinQuota } from "@/lib/email-quota";
import { completeProfileEmailHtml, completeProfileEmailSubject } from "@/emails/complete-profile";

export async function POST(req: NextRequest) {
  // Proteção por secret
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const redis = getRedis();
  const resend = getResend();
  if (!redis || !resend) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  // Busca todos os emails cadastrados
  const emails = await redis.zrange("sinergia:emails", 0, -1) as string[];

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  // Verifica em paralelo quais não têm signo no perfil
  const profileChecks = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );

  const targets = emails.filter((_, i) => !profileChecks[i]);

  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, skipped: emails.length });
  }

  const { sent, blocked } = await sendWithinQuota(
    redis,
    resend,
    targets.map((email) => ({
      from: EMAIL_FROM,
      to: email,
      subject: completeProfileEmailSubject,
      html: completeProfileEmailHtml(email),
    }))
  );

  return NextResponse.json({ sent, blocked, skipped: emails.length - targets.length });
}
