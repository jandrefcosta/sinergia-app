import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { completeProfileEmailHtml, completeProfileEmailSubject } from "@/emails/complete-profile";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

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

  // Disparo em lotes de 50 (limite do Resend batch)
  const BATCH_SIZE = 50;
  let sent = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    await resend.batch.send(
      batch.map((email) => ({
        from: "Sinergia <ola@sinergia-astros.app>",
        to: email,
        subject: completeProfileEmailSubject,
        html: completeProfileEmailHtml(email),
      }))
    );
    sent += batch.length;
  }

  return NextResponse.json({ sent, skipped: emails.length - sent });
}
