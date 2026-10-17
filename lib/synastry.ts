import { computeSky, type PlanetName, type SignName } from "@/lib/ephemeris";

/**
 * Sinastria simplificada para o "alma gêmea": cruza Sol, Lua, Vênus e Marte
 * de duas pessoas e dá um índice de 0 a 100 com os encontros mais fortes.
 *
 * Sem hora de nascimento, usa meio-dia de Brasília. Sol, Vênus e Marte mal
 * mudam ao longo do dia; a Lua anda uns 13°, então pode trocar de signo e o
 * resultado avisa quando isso acontece.
 */

type Body = "Sol" | "Lua" | "Vênus" | "Marte";
const BODIES: Body[] = ["Sol", "Lua", "Vênus", "Marte"];

export type Placement = { sign: SignName; longitude: number };
export type Chart = { placements: Record<Body, Placement>; moonUncertain: boolean };

export type BirthInput = { date: string; time?: string };

export function isValidBirth(input: unknown): input is BirthInput {
  if (!input || typeof input !== "object") return false;
  const { date, time } = input as Record<string, unknown>;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) return false;
  const year = Number(date.slice(0, 4));
  if (year < 1900 || year > new Date().getFullYear()) return false;
  return time === undefined || time === "" || (typeof time === "string" && /^\d{2}:\d{2}$/.test(time));
}

function placementsAt(instant: Date): Record<Body, Placement> {
  const sky = computeSky(instant);
  const pick = (p: PlanetName) => {
    const pos = sky.positions.find((x) => x.planet === p)!;
    return { sign: pos.sign, longitude: pos.longitude };
  };
  return { Sol: pick("Sol"), Lua: pick("Lua"), Vênus: pick("Vênus"), Marte: pick("Marte") };
}

export function chartFor({ date, time }: BirthInput): Chart {
  const placements = placementsAt(new Date(`${date}T${time || "12:00"}:00-03:00`));
  let moonUncertain = false;
  if (!time) {
    const start = placementsAt(new Date(`${date}T00:00:00-03:00`)).Lua.sign;
    const end = placementsAt(new Date(`${date}T23:59:00-03:00`)).Lua.sign;
    moonUncertain = start !== end;
  }
  return { placements, moonUncertain };
}

// ─── Aspectos entre os mapas ────────────────────────────────────────────────

type Harmony = "fusao" | "fluxo" | "tensao";

const ASPECTS = [
  { name: "conjunção", angle: 0, orb: 8, quality: 1, harmony: "fusao" },
  { name: "trígono", angle: 120, orb: 7, quality: 0.95, harmony: "fluxo" },
  { name: "sextil", angle: 60, orb: 5, quality: 0.8, harmony: "fluxo" },
  { name: "oposição", angle: 180, orb: 8, quality: 0.6, harmony: "tensao" },
  { name: "quadratura", angle: 90, orb: 6, quality: 0.45, harmony: "tensao" },
] as const;

/** Sem aspecto, o contato ainda conta um pouco: ninguém é incompatível em tudo. */
const NO_ASPECT = 0.3;

type Kind = "sol-lua" | "lua-lua" | "venus-marte" | "sol-sol" | "venus-venus" | "lua-venus";

/** Os contatos avaliados, com o peso de cada um. Os cruzados aparecem nos dois sentidos. */
const CONTACTS: { kind: Kind; a: Body; b: Body; weight: number }[] = [
  { kind: "sol-lua", a: "Sol", b: "Lua", weight: 3 },
  { kind: "sol-lua", a: "Lua", b: "Sol", weight: 3 },
  { kind: "lua-lua", a: "Lua", b: "Lua", weight: 2 },
  { kind: "venus-marte", a: "Vênus", b: "Marte", weight: 2 },
  { kind: "venus-marte", a: "Marte", b: "Vênus", weight: 2 },
  { kind: "lua-venus", a: "Lua", b: "Vênus", weight: 1.5 },
  { kind: "lua-venus", a: "Vênus", b: "Lua", weight: 1.5 },
  { kind: "sol-sol", a: "Sol", b: "Sol", weight: 1.5 },
  { kind: "venus-venus", a: "Vênus", b: "Vênus", weight: 1 },
];

const COPY: Record<Kind, Record<Harmony, string>> = {
  "sol-lua": {
    fusao: "O clássico das almas gêmeas: quem um é por fora, o outro sente por dentro. Há reconhecimento desde o primeiro encontro.",
    fluxo: "Um ilumina, o outro acolhe. A convivência é natural e um se sente em casa no jeito do outro.",
    tensao: "O que um mostra nem sempre é o que o outro precisa. A atração é real, e o cuidado está em escutar antes de reagir.",
  },
  "lua-lua": {
    fusao: "Vocês sentem do mesmo jeito. Os humores se espelham, para o bem e para o mal.",
    fluxo: "As necessidades emocionais combinam. Vocês sabem cuidar um do outro sem manual.",
    tensao: "Cada um se acalma de um jeito diferente. Vale combinar como cuidar um do outro nos dias difíceis.",
  },
  "venus-marte": {
    fusao: "Química forte: o desejo de um encontra exatamente o jeito de amar do outro.",
    fluxo: "Atração que flui sem esforço. Romance e iniciativa se completam.",
    tensao: "Faísca garantida, às vezes com atrito. A tensão alimenta a atração, desde que não vire disputa.",
  },
  "lua-venus": {
    fusao: "O carinho que um precisa é o jeito natural do outro de amar.",
    fluxo: "Ternura fácil. Os gestos de afeto chegam do jeito certo.",
    tensao: "Um demonstra afeto de um jeito que o outro nem sempre lê. Falar sobre isso aproxima muito.",
  },
  "sol-sol": {
    fusao: "Mesma essência, mesma direção. Vocês se reconhecem de cara.",
    fluxo: "Os temperamentos se apoiam. Um torce pelo brilho do outro.",
    tensao: "Dois temperamentos fortes em direções diferentes. Juntos crescem, desde que ninguém precise vencer.",
  },
  "venus-venus": {
    fusao: "Gostam das mesmas coisas e amam do mesmo jeito.",
    fluxo: "Gostos que combinam: o encontro, o passeio e o presente certo saem fácil.",
    tensao: "Gostos diferentes, que ampliam o mundo de cada um quando há curiosidade.",
  },
};

// Artigos para frases como "seu Sol" e "a Lua da outra pessoa"
const MINE: Record<Body, string> = { Sol: "Seu Sol", Lua: "Sua Lua", Vênus: "Sua Vênus", Marte: "Seu Marte" };
const THEIRS: Record<Body, string> = { Sol: "o Sol", Lua: "a Lua", Vênus: "a Vênus", Marte: "o Marte" };

function separation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export type Highlight = { title: string; aspect: string; text: string };

export type SoulmateResult = {
  score: number;
  tier: string;
  you: Record<Body, SignName>;
  them: Record<Body, SignName>;
  highlights: Highlight[];
  moonUncertain: boolean;
};

export function tierFor(score: number): string {
  if (score >= 88) return "Alma gêmea";
  if (score >= 78) return "Conexão forte";
  if (score >= 68) return "Boa química";
  return "Desafio que ensina";
}

export function soulmate(a: BirthInput, b: BirthInput): SoulmateResult {
  const ca = chartFor(a);
  const cb = chartFor(b);

  let total = 0;
  let weights = 0;
  const found: (Highlight & { strength: number })[] = [];

  for (const c of CONTACTS) {
    const pa = ca.placements[c.a];
    const pb = cb.placements[c.b];
    const sep = separation(pa.longitude, pb.longitude);
    const asp = ASPECTS.find((x) => Math.abs(sep - x.angle) <= x.orb);
    // Aspecto mais exato vale um pouco mais
    const quality = asp ? asp.quality * (1 - (Math.abs(sep - asp.angle) / asp.orb) * 0.2) : NO_ASPECT;
    total += quality * c.weight;
    weights += c.weight;
    if (asp) {
      found.push({
        title: `${MINE[c.a]} em ${pa.sign} e ${THEIRS[c.b]} da outra pessoa em ${pb.sign}`,
        aspect: asp.name,
        text: COPY[c.kind][asp.harmony],
        strength: quality * c.weight,
      });
    }
  }

  // A média ponderada fica entre ~0,3 e ~0,65 em pares reais. A escala foi
  // calibrada numa amostra de datas aleatórias: mediana perto de 72 e só os
  // ~10% mais fortes acima de 88, a faixa de "alma gêmea".
  const score = Math.min(99, Math.max(40, Math.round(8 + 158 * (total / weights))));
  const sign = (chart: Chart) =>
    Object.fromEntries(BODIES.map((x) => [x, chart.placements[x].sign])) as Record<Body, SignName>;

  return {
    score,
    tier: tierFor(score),
    you: sign(ca),
    them: sign(cb),
    // Um destaque por tipo de contato, os três mais fortes
    highlights: found
      .sort((x, y) => y.strength - x.strength)
      .filter((h, i, arr) => arr.findIndex((o) => o.text === h.text) === i)
      .slice(0, 3)
      .map(({ title, aspect, text }) => ({ title, aspect, text })),
    moonUncertain: ca.moonUncertain || cb.moonUncertain,
  };
}
