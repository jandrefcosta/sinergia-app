import sharp from "sharp";

/**
 * A API do Instagram só aceita JPEG, e o next/og só gera PNG. As rotas de
 * card aceitam ?format=jpg e passam a resposta por aqui.
 */

export function wantsJpeg(req: Request): boolean {
  return new URL(req.url).searchParams.get("format") === "jpg";
}

export async function asJpeg(png: Response): Promise<Response> {
  const input = Buffer.from(await png.arrayBuffer());
  const jpeg = await sharp(input).flatten({ background: "#fbfaf7" }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
  const headers = new Headers(png.headers);
  headers.set("Content-Type", "image/jpeg");
  headers.delete("Content-Length");
  return new Response(new Uint8Array(jpeg), { status: png.status, headers });
}
