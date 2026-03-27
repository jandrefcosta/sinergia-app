import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createHash } from "crypto";
import { getRedis, getBRTPeriod, secondsUntilReset } from "@/lib/forecast";

const MAX_CHARS = 500;
const RATE_LIMIT = 3; // submissões por dia por fingerprint

function getFingerprint(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const lang = req.headers.get("accept-language")?.split(",")[0] ?? "unknown";
  return createHash("sha256").update(`${ip}|${ua}|${lang}`).digest("hex").slice(0, 32);
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  const { message } = await req.json().catch(() => ({}));

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  if (message.length > MAX_CHARS) {
    return NextResponse.json({ error: "Mensagem muito longa" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  // Rate limit por fingerprint
  const period = getBRTPeriod();
  const rlKey = `sinergia:feedback-rl:${getFingerprint(req)}:${period}`;
  const count = await redis.incr(rlKey);
  if (count === 1) await redis.expire(rlKey, secondsUntilReset());
  if (count > RATE_LIMIT) {
    return NextResponse.json({ error: "Limite diário atingido" }, { status: 429 });
  }

  // Salva no Redis — lista ordenada por timestamp
  const entry = JSON.stringify({
    message: message.trim(),
    timestamp: new Date().toISOString(),
    fingerprint: getFingerprint(req).slice(0, 8), // prefixo apenas, para referência
  });
  await redis.lpush("sinergia:feedback", entry);

  // Notifica o admin por email (não bloqueia a resposta se falhar)
  const adminEmail = process.env.FEEDBACK_EMAIL;
  const resend = getResend();
  if (adminEmail && resend) {
    resend.emails.send({
      from: "Sinergia <ola@sinergia-astros.app>",
      to: adminEmail,
      subject: "Nova mensagem recebida · Sinergia",
      html: `<p style="font-family:Arial,sans-serif;font-size:14px;color:#333;">
        <strong>Nova mensagem do Sinergia:</strong><br/><br/>
        ${message.trim().replace(/\n/g, "<br/>")}
        <br/><br/>
        <span style="color:#999;font-size:12px;">${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
      </p>`,
    }).catch((err) => console.error("[feedback] Falha ao notificar admin:", err));
  }

  return NextResponse.json({ ok: true });
}
