import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getRedis } from "@/lib/forecast";
import { nudgeProfileEmailHtml, nudgeProfileEmailSubject } from "@/emails/nudge-profile";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
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

  // Filtra apenas quem não tem perfil completo (sem signo)
  const profileChecks = await Promise.all(
    emails.map((email) => redis.hget(`sinergia:profile:${email}`, "sign"))
  );

  const targets = emails.filter((_, i) => !profileChecks[i]);

  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, skipped: emails.length });
  }

  // Disparo em lotes de 50
  const BATCH_SIZE = 50;
  let sent = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    await resend.batch.send(
      batch.map((email) => ({
        from: "Sinergia <ola@sinergia-astros.app>",
        to: email,
        subject: nudgeProfileEmailSubject,
        html: nudgeProfileEmailHtml(email),
      }))
    );
    sent += batch.length;
  }

  console.log(`[cron/weekly] sent=${sent} skipped=${emails.length - sent}`);
  return NextResponse.json({ sent, skipped: emails.length - sent });
}
