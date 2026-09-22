"use client";

import ShareButtons from "@/components/ShareButtons";
import { slugFor } from "@/lib/slugs";
import type { SignName } from "@/lib/ephemeris";

type Props = { sign: string; quote: string };

/** Compartilhar a previsão do dia: manda o link da página do signo, que tem card próprio. */
export default function ShareActions({ sign, quote }: Props) {
  return (
    <ShareButtons
      url={`/signo/${slugFor(sign as SignName)}`}
      text={`${sign}, hoje: "${quote}"\n\nSinergia, o céu de hoje lido para você.`}
      label={sign}
    />
  );
}
