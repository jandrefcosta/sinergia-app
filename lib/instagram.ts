import type { Redis } from "@upstash/redis";

/**
 * Publicação no Instagram pela API com login do Instagram (graph.instagram.com).
 *
 * O token de longa duração vale 60 dias. O valor inicial vem de
 * INSTAGRAM_ACCESS_TOKEN; cada renovação grava o novo token no Redis, que
 * passa a ter precedência sobre a variável.
 *
 * A Meta busca a imagem pela URL no momento da publicação: ela precisa ser
 * pública e em JPEG (as rotas de card aceitam ?format=jpg).
 */

const API = "https://graph.instagram.com/v25.0";
const TOKEN_KEY = "sinergia:ig:token";

type StoredToken = { token: string; refreshedAt: string; expiresAt: string };

export class InstagramError extends Error {}

export function instagramUserId(): string | null {
  return process.env.INSTAGRAM_USER_ID || null;
}

export async function getToken(redis: Redis | null): Promise<string | null> {
  const stored = redis ? await redis.get<StoredToken>(TOKEN_KEY) : null;
  return stored?.token ?? process.env.INSTAGRAM_ACCESS_TOKEN ?? null;
}

async function call<T>(method: "GET" | "POST", path: string, params: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(params);
  const url = method === "GET" ? `${API}${path}?${body}` : `${API}${path}`;
  const res = await fetch(url, method === "GET" ? { cache: "no-store" } : { method, body, cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const msg = json.error?.error_user_msg ?? json.error?.message ?? `HTTP ${res.status}`;
    throw new InstagramError(msg);
  }
  return json as T;
}

async function credentials(redis: Redis | null): Promise<{ userId: string; token: string }> {
  const userId = instagramUserId();
  const token = await getToken(redis);
  if (!userId || !token) throw new InstagramError("Instagram não configurado");
  return { userId, token };
}

/** Conta conectada e uso do limite diário de publicações. */
export async function getStatus(redis: Redis | null) {
  const { userId, token } = await credentials(redis);
  const [me, limit, stored] = await Promise.all([
    call<{ username: string }>("GET", "/me", { fields: "username", access_token: token }),
    call<{ data: { quota_usage: number; config?: { quota_total: number } }[] }>(
      "GET",
      `/${userId}/content_publishing_limit`,
      { fields: "quota_usage,config", access_token: token }
    ),
    redis ? redis.get<StoredToken>(TOKEN_KEY) : null,
  ]);
  return {
    username: me.username,
    quotaUsage: limit.data[0]?.quota_usage ?? 0,
    quotaTotal: limit.data[0]?.config?.quota_total ?? null,
    tokenExpiresAt: stored?.expiresAt ?? null,
  };
}

/** Espera o container ficar pronto. Imagens costumam estar prontas na hora. */
async function waitReady(containerId: string, token: string): Promise<void> {
  for (let i = 0; i < 15; i++) {
    const { status_code } = await call<{ status_code: string }>("GET", `/${containerId}`, {
      fields: "status_code",
      access_token: token,
    });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") {
      throw new InstagramError(`Container ${status_code}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new InstagramError("Tempo esgotado esperando a imagem ser processada");
}

/** Publica uma imagem como Story ou como post no feed. Retorna o id da mídia. */
export async function publishImage(
  redis: Redis | null,
  imageUrl: string,
  opts: { story: boolean; caption?: string }
): Promise<string> {
  const { userId, token } = await credentials(redis);
  const container = await call<{ id: string }>("POST", `/${userId}/media`, {
    image_url: imageUrl,
    ...(opts.story ? { media_type: "STORIES" } : {}),
    ...(opts.caption && !opts.story ? { caption: opts.caption } : {}), // Stories não têm legenda
    access_token: token,
  });
  await waitReady(container.id, token);
  const published = await call<{ id: string }>("POST", `/${userId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  });
  return published.id;
}

/** Publica um carrossel (2 a 10 imagens) no feed. Retorna o id da mídia. */
export async function publishCarousel(redis: Redis | null, imageUrls: string[], caption: string): Promise<string> {
  const { userId, token } = await credentials(redis);
  const children: string[] = [];
  for (const url of imageUrls) {
    const child = await call<{ id: string }>("POST", `/${userId}/media`, {
      image_url: url,
      is_carousel_item: "true",
      access_token: token,
    });
    await waitReady(child.id, token);
    children.push(child.id);
  }
  const container = await call<{ id: string }>("POST", `/${userId}/media`, {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption,
    access_token: token,
  });
  await waitReady(container.id, token);
  const published = await call<{ id: string }>("POST", `/${userId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  });
  return published.id;
}

/**
 * Renova o token (precisa ter mais de 24h e não estar vencido) e grava no Redis.
 * Chamado toda semana pelo agendador.
 */
export async function refreshToken(redis: Redis): Promise<StoredToken> {
  const token = await getToken(redis);
  if (!token) throw new InstagramError("Instagram não configurado");
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new InstagramError(json.error?.message ?? `HTTP ${res.status}`);
  }
  const now = Date.now();
  const stored: StoredToken = {
    token: json.access_token,
    refreshedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + json.expires_in * 1000).toISOString(),
  };
  await redis.set(TOKEN_KEY, stored);
  return stored;
}
