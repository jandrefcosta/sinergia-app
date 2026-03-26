import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
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
  const added = await redis.zadd("sinergia:emails", {
    score: Date.now(),
    member: email.toLowerCase().trim(),
    nx: true, // só adiciona se não existir
  });

  // added = 1 (novo) ou 0 (já existia) — ambos retornam sucesso para o usuário
  return NextResponse.json({ ok: true, new: added === 1 });
}
