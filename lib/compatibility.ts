import { SIGNS, type SignName } from "@/lib/ephemeris";
import { ELEMENT } from "@/lib/quiz";
import { signFromSlug, slugFor } from "@/lib/slugs";

/**
 * Compatibilidade entre signos solares, com texto fixo escrito à mão.
 * O tom de cada par vem da distância entre os signos no zodíaco (o aspecto
 * que eles formam), e o detalhe vem do que cada signo traz para uma relação.
 * Nada aqui é gerado: 7 relações × 12 signos cobrem os 78 pares.
 */

export type Relation = "espelho" | "vizinhos" | "aliados" | "atrito" | "mesmo-elemento" | "ajuste" | "opostos";

export type RelationCopy = {
  /** Nome curto, para o selo da página. */
  label: string;
  /** Uma linha que resume o par. */
  headline: string;
  text: [string, string];
  amor: string;
  amizade: string;
  trabalho: string;
  /** O ponto de atenção do par. */
  cuidado: string;
};

export const RELATIONS: Record<Relation, RelationCopy> = {
  espelho: {
    label: "Mesmo signo",
    headline: "Entendem um ao outro sem tradução, inclusive nos defeitos.",
    text: [
      "Dois do mesmo signo reconhecem o jeito do outro de longe. O ritmo é parecido, as prioridades também, e muita coisa não precisa ser explicada.",
      "O risco é o mesmo da vantagem: os pontos cegos também são iguais. Quando os dois erram na mesma direção, ninguém puxa de volta.",
    ],
    amor: "Afinidade imediata. Funciona melhor quando cada um mantém um pedaço de vida próprio.",
    amizade: "Amizade de reconhecimento. Riem das mesmas coisas e se irritam com as mesmas pessoas.",
    trabalho: "Rendem bem em tarefas que pedem o talento do signo. Precisam de alguém de fora para cobrir o que nenhum dos dois faz.",
    cuidado: "Competir pelo mesmo papel na relação.",
  },
  vizinhos: {
    label: "Signos vizinhos",
    headline: "Lado a lado no zodíaco, diferentes em quase tudo.",
    text: [
      "Signos vizinhos não compartilham elemento nem ritmo. Um costuma ter o que falta ao outro, e isso aparece cedo, às vezes como estranhamento.",
      "Quando dá certo, é uma relação de aprendizado. Cada um mostra ao outro um jeito de viver que sozinho não tentaria.",
    ],
    amor: "Começa devagar e cresce com o convívio. A curiosidade pelo diferente é o que segura.",
    amizade: "Boa amizade de conselho: um enxerga o que o outro não vê.",
    trabalho: "Complementares, desde que as funções fiquem claras.",
    cuidado: "Querer que o outro funcione no seu ritmo.",
  },
  aliados: {
    label: "Aliados",
    headline: "Combinação leve, com conversa fácil e apoio mútuo.",
    text: [
      "Os dois estão a dois signos de distância, em elementos que se ajudam: Fogo com Ar, Terra com Água. Um alimenta o outro sem esforço.",
      "É uma das combinações mais fáceis do zodíaco. Não tem muita faísca de conflito, e por isso mesmo depende de iniciativa para não ficar morna.",
    ],
    amor: "Relação de parceria e bom humor. Cresce quando alguém propõe o próximo passo.",
    amizade: "Das melhores combinações para amizade. Fácil de manter, mesmo com distância.",
    trabalho: "Dupla que troca ideias bem e entrega junto.",
    cuidado: "Deixar a relação no automático porque está tudo bem.",
  },
  atrito: {
    label: "Atrito",
    headline: "Tensão que pode virar faísca ou briga, conforme o dia.",
    text: [
      "Os dois formam uma quadratura: estão a três signos de distância, com elementos que não se misturam fácil. Querem coisas parecidas por caminhos opostos.",
      "É a combinação que mais exige conversa, e também a que mais faz crescer. Quem passa pela fase de atrito costuma construir algo sólido.",
    ],
    amor: "Atração com desafio. Funciona com acordos claros e paciência nos dias ruins.",
    amizade: "Discordam muito e se respeitam por isso.",
    trabalho: "Produtivos sob pressão, desde que ninguém precise vencer a discussão.",
    cuidado: "Transformar diferença de método em disputa de poder.",
  },
  "mesmo-elemento": {
    label: "Mesmo elemento",
    headline: "Falam a mesma língua, cada um com o seu sotaque.",
    text: [
      "Os dois são do mesmo elemento e formam um trígono, o aspecto mais fluido da astrologia. Valores e ritmo combinam sem negociação.",
      "A harmonia é natural, mas pode acomodar. Como os dois concordam no essencial, sobra pouco atrito para mover a relação adiante.",
    ],
    amor: "Combinação de afinidade profunda. Precisa de novidade para não virar rotina.",
    amizade: "Amizade de longa duração, das que sobrevivem a anos sem se ver.",
    trabalho: "Sintonia rápida. Vale chamar alguém de outro elemento para questionar.",
    cuidado: "Reforçar os exageros do elemento em vez de equilibrá-los.",
  },
  ajuste: {
    label: "Ajuste",
    headline: "Linguagens diferentes, que pedem tradução constante.",
    text: [
      "Os dois estão a cinco signos de distância, um aspecto chamado quincúncio. Elemento e ritmo não têm nada em comum, e o que é óbvio para um não é para o outro.",
      "A relação funciona quando os dois aceitam que vão se ajustar o tempo todo. Com isso, viram uma dupla curiosa e difícil de prever.",
    ],
    amor: "Atração pelo mistério do outro. Pede paciência para entender o que não é dito.",
    amizade: "Amizade improvável que, quando pega, surpreende os dois.",
    trabalho: "Funciona com papéis bem separados e comunicação por escrito.",
    cuidado: "Interpretar diferença como falta de interesse.",
  },
  opostos: {
    label: "Opostos",
    headline: "Lados opostos do zodíaco, atraídos pelo que falta em si.",
    text: [
      "Signos opostos estão a seis casas de distância e trabalham o mesmo tema por lados contrários. Os elementos se completam: Fogo com Ar, Terra com Água.",
      "A atração costuma ser forte, porque cada um vê no outro o que não desenvolveu. A relação dá certo quando vira equilíbrio, e não cabo de guerra.",
    ],
    amor: "Química intensa. Cresce quando cada um aprende com o outro em vez de tentar mudá-lo.",
    amizade: "Um equilibra o outro. Bons conselheiros mútuos.",
    trabalho: "Cobrem os pontos fracos um do outro, se dividirem bem as tarefas.",
    cuidado: "Cada um puxar a relação para o seu extremo.",
  },
};

export type SignInLove = {
  /** O que o signo traz para uma relação. */
  traz: string;
  /** O que o signo precisa receber. */
  precisa: string;
};

export const SIGN_IN_LOVE: Record<SignName, SignInLove> = {
  Áries: { traz: "iniciativa, coragem e a disposição de tentar primeiro", precisa: "liberdade de movimento e respostas diretas" },
  Touro: { traz: "constância, presença e cuidado com o conforto", precisa: "segurança, tempo e gestos concretos" },
  Gêmeos: { traz: "conversa, humor e ideias novas", precisa: "variedade e alguém que acompanhe o raciocínio" },
  Câncer: { traz: "acolhimento, memória e lealdade", precisa: "um lugar onde possa baixar a guarda" },
  Leão: { traz: "generosidade, calor e entusiasmo", precisa: "admiração declarada e lealdade" },
  Virgem: { traz: "atenção aos detalhes e cuidado prático", precisa: "reconhecimento pelo que faz sem alarde" },
  Libra: { traz: "gentileza, diálogo e senso de justiça", precisa: "harmonia e decisões tomadas a dois" },
  Escorpião: { traz: "intensidade, profundidade e lealdade total", precisa: "confiança e verdade, mesmo a difícil" },
  Sagitário: { traz: "otimismo, aventura e franqueza", precisa: "espaço para crescer e planos em aberto" },
  Capricórnio: { traz: "compromisso, estrutura e visão de longo prazo", precisa: "respeito pelo tempo e pelas metas dele" },
  Aquário: { traz: "originalidade, amizade e mente aberta", precisa: "independência e conversa sobre ideias" },
  Peixes: { traz: "empatia, imaginação e entrega", precisa: "delicadeza e alguém que o ajude a pisar no chão" },
};

const DISTANCE_TO_RELATION: Relation[] = ["espelho", "vizinhos", "aliados", "atrito", "mesmo-elemento", "ajuste", "opostos"];

export function relationOf(a: SignName, b: SignName): Relation {
  const d = Math.abs(SIGNS.indexOf(a) - SIGNS.indexOf(b));
  return DISTANCE_TO_RELATION[Math.min(d, 12 - d)];
}

export function elementLine(a: SignName, b: SignName): string {
  return ELEMENT[a] === ELEMENT[b] ? `Os dois de ${ELEMENT[a]}` : `${ELEMENT[a]} com ${ELEMENT[b]}`;
}

// ─── URLs: /compatibilidade/aries-e-libra, sempre na ordem do zodíaco ──────

export function pairSlug(a: SignName, b: SignName): string {
  const [x, y] = SIGNS.indexOf(a) <= SIGNS.indexOf(b) ? [a, b] : [b, a];
  return `${slugFor(x)}-e-${slugFor(y)}`;
}

export function parsePairSlug(slug: string): { a: SignName; b: SignName } | null {
  const parts = slug.split("-e-");
  if (parts.length !== 2) return null;
  const a = signFromSlug(parts[0]);
  const b = signFromSlug(parts[1]);
  return a && b ? { a, b } : null;
}

/** Os 78 pares, na ordem do zodíaco. */
export function allPairs(): [SignName, SignName][] {
  const pairs: [SignName, SignName][] = [];
  SIGNS.forEach((a, i) => SIGNS.slice(i).forEach((b) => pairs.push([a, b])));
  return pairs;
}
