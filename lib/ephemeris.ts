import * as Astronomy from "astronomy-engine";

/**
 * Posições planetárias reais calculadas para um instante.
 * Esses fatos são a base da previsão: o modelo de linguagem só escreve
 * a prosa a partir deles, sem inventar aspectos.
 */

export const SIGNS = [
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
] as const;
export type SignName = (typeof SIGNS)[number];

/** Regente moderno de cada signo (usado para destacar o que importa ao signo). */
export const RULERS: Record<SignName, PlanetName> = {
  Áries: "Marte", Touro: "Vênus", Gêmeos: "Mercúrio", Câncer: "Lua",
  Leão: "Sol", Virgem: "Mercúrio", Libra: "Vênus", Escorpião: "Plutão",
  Sagitário: "Júpiter", Capricórnio: "Saturno", Aquário: "Urano", Peixes: "Netuno",
};

export type PlanetName =
  | "Sol" | "Lua" | "Mercúrio" | "Vênus" | "Marte"
  | "Júpiter" | "Saturno" | "Urano" | "Netuno" | "Plutão";

const BODIES: { name: PlanetName; body: Astronomy.Body | null }[] = [
  { name: "Sol", body: null },
  { name: "Lua", body: null },
  { name: "Mercúrio", body: Astronomy.Body.Mercury },
  { name: "Vênus", body: Astronomy.Body.Venus },
  { name: "Marte", body: Astronomy.Body.Mars },
  { name: "Júpiter", body: Astronomy.Body.Jupiter },
  { name: "Saturno", body: Astronomy.Body.Saturn },
  { name: "Urano", body: Astronomy.Body.Uranus },
  { name: "Netuno", body: Astronomy.Body.Neptune },
  { name: "Plutão", body: Astronomy.Body.Pluto },
];

export type Position = {
  planet: PlanetName;
  /** Longitude eclíptica geocêntrica, 0–360. */
  longitude: number;
  sign: SignName;
  /** Grau dentro do signo, 0–29. */
  degree: number;
  retrograde: boolean;
};

export type AspectType = "conjunção" | "oposição" | "trígono" | "quadratura" | "sextil";

export type Aspect = {
  a: PlanetName;
  b: PlanetName;
  type: AspectType;
  /** Distância do aspecto exato, em graus. */
  orb: number;
};

export type Sky = {
  /** ISO do instante calculado. */
  at: string;
  positions: Position[];
  aspects: Aspect[];
  moonPhase: string;
};

const ASPECTS: { type: AspectType; angle: number; orb: number }[] = [
  { type: "conjunção", angle: 0, orb: 8 },
  { type: "oposição", angle: 180, orb: 8 },
  { type: "trígono", angle: 120, orb: 6 },
  { type: "quadratura", angle: 90, orb: 6 },
  { type: "sextil", angle: 60, orb: 4 },
];

function longitudeOf(name: PlanetName, body: Astronomy.Body | null, date: Date): number {
  if (name === "Sol") return Astronomy.SunPosition(date).elon;
  if (name === "Lua") return Astronomy.EclipticGeoMoon(date).lon;
  const vec = Astronomy.GeoVector(body!, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function separation(a: number, b: number): number {
  const d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
}

export function signFromLongitude(lon: number): SignName {
  return SIGNS[Math.floor(norm(lon) / 30)];
}

function moonPhaseName(angle: number): string {
  // Ângulo de fase 0 = nova, 90 = crescente, 180 = cheia, 270 = minguante
  if (angle < 22.5 || angle >= 337.5) return "Lua nova";
  if (angle < 67.5) return "Lua crescente (início)";
  if (angle < 112.5) return "Quarto crescente";
  if (angle < 157.5) return "Lua crescente (gibosa)";
  if (angle < 202.5) return "Lua cheia";
  if (angle < 247.5) return "Lua minguante (gibosa)";
  if (angle < 292.5) return "Quarto minguante";
  return "Lua minguante (final)";
}

/** Calcula o céu para um instante. */
export function computeSky(date: Date): Sky {
  const dayBefore = new Date(date.getTime() - 24 * 60 * 60 * 1000);

  const positions: Position[] = BODIES.map(({ name, body }) => {
    const lon = norm(longitudeOf(name, body, date));
    const prev = norm(longitudeOf(name, body, dayBefore));
    // Movimento diário; negativo (após ajuste de volta) indica retrogradação.
    let delta = lon - prev;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const retrograde = name !== "Sol" && name !== "Lua" && delta < 0;
    return {
      planet: name,
      longitude: Number(lon.toFixed(2)),
      sign: signFromLongitude(lon),
      degree: Math.floor(lon % 30),
      retrograde,
    };
  });

  const aspects: Aspect[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const sep = separation(positions[i].longitude, positions[j].longitude);
      for (const asp of ASPECTS) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb) {
          aspects.push({
            a: positions[i].planet,
            b: positions[j].planet,
            type: asp.type,
            orb: Number(orb.toFixed(1)),
          });
          break;
        }
      }
    }
  }
  aspects.sort((x, y) => x.orb - y.orb);

  return {
    at: date.toISOString(),
    positions,
    aspects,
    moonPhase: moonPhaseName(Astronomy.MoonPhase(date)),
  };
}

/** Instante de referência para um período (YYYY-MM-DD): meio-dia em Brasília. */
export function skyDateForPeriod(period: string): Date {
  return new Date(`${period}T12:00:00-03:00`);
}

/** Lista legível dos fatos do céu, em português, para compor o prompt. */
export function describeSky(sky: Sky): string {
  const lines: string[] = [];
  lines.push(`Fase da Lua: ${sky.moonPhase}.`);
  for (const p of sky.positions) {
    lines.push(`${p.planet} em ${p.sign} (${p.degree}°)${p.retrograde ? ", retrógrado" : ""}.`);
  }
  if (sky.aspects.length) {
    lines.push("Aspectos do dia (do mais exato ao menos exato):");
    for (const a of sky.aspects) {
      lines.push(`- ${a.a} em ${a.type} com ${a.b} (orbe ${a.orb}°)`);
    }
  }
  return lines.join("\n");
}

/** Fatos que tocam diretamente um signo: regente, planetas no signo e aspectos do regente. */
export function describeSkyForSign(sky: Sky, sign: SignName): string {
  const ruler = RULERS[sign];
  const rulerPos = sky.positions.find((p) => p.planet === ruler)!;
  const inSign = sky.positions.filter((p) => p.sign === sign).map((p) => p.planet);
  const rulerAspects = sky.aspects.filter((a) => a.a === ruler || a.b === ruler);

  const lines: string[] = [];
  lines.push(`Regente de ${sign}: ${ruler}, hoje em ${rulerPos.sign} (${rulerPos.degree}°)${rulerPos.retrograde ? ", retrógrado" : ""}.`);
  lines.push(
    inSign.length
      ? `Planetas transitando por ${sign}: ${inSign.join(", ")}.`
      : `Nenhum planeta transita por ${sign} hoje.`
  );
  if (rulerAspects.length) {
    lines.push(`Aspectos do regente: ${rulerAspects.map((a) => `${a.a} em ${a.type} com ${a.b}`).join("; ")}.`);
  } else {
    lines.push("O regente não faz aspectos relevantes hoje.");
  }
  return lines.join("\n");
}

/**
 * Linha planetária determinística exibida no topo da previsão.
 * Prioriza o aspecto mais exato do regente; senão, Lua e Sol.
 */
export function planetLineFor(sky: Sky, sign: SignName): string {
  const ruler = RULERS[sign];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const rulerAspect = sky.aspects.find((a) => a.a === ruler || a.b === ruler);
  const moon = sky.positions.find((p) => p.planet === "Lua")!;
  const sun = sky.positions.find((p) => p.planet === "Sol")!;

  if (rulerAspect) {
    const other = rulerAspect.a === ruler ? rulerAspect.b : rulerAspect.a;
    return `${ruler} em ${cap(rulerAspect.type)} com ${other} · Lua em ${moon.sign}`;
  }
  return `Lua em ${moon.sign} · Sol em ${sun.sign}`;
}
