import { GoogleGenAI } from "@google/genai";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

/**
 * Clientes externos, criados sob demanda a partir das variáveis de ambiente.
 * Retornam null quando a credencial não está configurada, para que cada rota
 * decida como degradar.
 */

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url === "your_upstash_url_here") return null;
  return new Redis({ url, token });
}

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

let gemini: GoogleGenAI | null = null;
export function getGemini(): GoogleGenAI {
  if (!gemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");
    gemini = new GoogleGenAI({ apiKey });
  }
  return gemini;
}

export const EMAIL_FROM = "Sinergia <ola@sinergia-astros.app>";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sinergia-astros.app";
