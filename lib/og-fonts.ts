import { readFile } from "fs/promises";
import path from "path";

/**
 * Fontes para as imagens de compartilhamento. O next/og roda o Satori, que
 * precisa dos arquivos de fonte (TTF, OTF ou WOFF). Ficam no repositório em
 * app/fonts, lidas do disco e incluídas no build standalone via
 * outputFileTracingIncludes no next.config.
 */

type FontSpec = { name: string; weight: 300 | 400 | 600; style: "normal" | "italic"; data: ArrayBuffer };

const FONT_DIR = path.join(process.cwd(), "app", "fonts");

let cached: Promise<FontSpec[]> | null = null;

async function load(file: string): Promise<ArrayBuffer> {
  const buf = await readFile(path.join(FONT_DIR, file));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function loadOgFonts(): Promise<FontSpec[]> {
  if (!cached) {
    cached = Promise.all([
      load("fraunces-300.woff").then((data) => ({ name: "Fraunces", weight: 300 as const, style: "normal" as const, data })),
      load("fraunces-300-italic.woff").then((data) => ({ name: "Fraunces", weight: 300 as const, style: "italic" as const, data })),
      load("instrument-400.woff").then((data) => ({ name: "Instrument Sans", weight: 400 as const, style: "normal" as const, data })),
      load("instrument-600.woff").then((data) => ({ name: "Instrument Sans", weight: 600 as const, style: "normal" as const, data })),
    ]);
  }
  return cached;
}
