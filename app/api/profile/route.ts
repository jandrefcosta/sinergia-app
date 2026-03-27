import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { VALID_SIGNS } from "@/lib/forecast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// YYYY-MM-DD, entre 1900 e hoje
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
}

export async function POST(req: NextRequest) {
  const { email, sign, birthdate } = await req.json().catch(() => ({}));

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (!sign || !VALID_SIGNS.includes(sign)) {
    return NextResponse.json({ error: "Signo inválido" }, { status: 400 });
  }
  if (!birthdate || !DATE_RE.test(birthdate)) {
    return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 });
  }

  const birth = new Date(birthdate);
  const now = new Date();
  if (isNaN(birth.getTime()) || birth > now || birth.getFullYear() < 1900) {
    return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Verifica se o email está cadastrado
  const score = await redis.zscore("sinergia:emails", normalizedEmail);
  if (score === null) {
    return NextResponse.json({ error: "Email não cadastrado" }, { status: 404 });
  }

  // Salva perfil como Hash — upsert seguro
  await redis.hset(`sinergia:profile:${normalizedEmail}`, { sign, birthdate });

  return NextResponse.json({ ok: true });
}
