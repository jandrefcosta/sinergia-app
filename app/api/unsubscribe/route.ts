import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/forecast";

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

  const normalizedEmail = email.toLowerCase().trim();

  await Promise.all([
    redis.zrem("sinergia:emails", normalizedEmail),
    redis.del(`sinergia:profile:${normalizedEmail}`),
  ]);

  return NextResponse.json({ ok: true });
}
