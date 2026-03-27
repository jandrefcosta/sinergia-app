import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { welcomeEmailHtml, welcomeEmailSubject } from "@/emails/welcome";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

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

  // Envia boas-vindas apenas para novos cadastros
  if (added === 1) {
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: "Sinergia <ola@sinergia-astros.app>",
        to: email,
        subject: welcomeEmailSubject,
        html: welcomeEmailHtml(email),
      });
    }
  }

  return NextResponse.json({ ok: true, new: added === 1 });
}
