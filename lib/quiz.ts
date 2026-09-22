import { SIGNS, type SignName } from "@/lib/ephemeris";
import { signFromSlug } from "@/lib/slugs";

/**
 * Quiz "com que signo você mais se parece".
 * Cada alternativa soma pontos para alguns signos. As perguntas alternam
 * entre elemento (Fogo, Terra, Ar, Água) e modo de agir, para que o
 * resultado não dependa de um único eixo.
 */

export type Option = { text: string; signs: SignName[] };
export type Question = { text: string; options: Option[] };

export const QUESTIONS: Question[] = [
  {
    text: "Sexta à noite. O plano ideal é:",
    options: [
      { text: "Sair e conhecer gente nova", signs: ["Áries", "Leão", "Sagitário"] },
      { text: "Jantar bom em casa, com quem já conheço", signs: ["Touro", "Virgem", "Capricórnio"] },
      { text: "Uma conversa que vira madrugada", signs: ["Gêmeos", "Libra", "Aquário"] },
      { text: "Filme, cobertor e ninguém precisando de mim", signs: ["Câncer", "Escorpião", "Peixes"] },
    ],
  },
  {
    text: "Chega a mensagem: \"precisamos conversar\". Você:",
    options: [
      { text: "Liga na hora e resolve", signs: ["Áries", "Capricórnio", "Libra"] },
      { text: "Fica calmo por fora, mas não pensa em outra coisa", signs: ["Touro", "Leão", "Aquário"] },
      { text: "Responde perguntando o que é, com uma piada", signs: ["Gêmeos", "Sagitário", "Virgem"] },
      { text: "Já imaginou os três piores cenários", signs: ["Câncer", "Escorpião", "Peixes"] },
    ],
  },
  {
    text: "Num trabalho em grupo, você é quem:",
    options: [
      { text: "Puxa e decide", signs: ["Áries", "Leão", "Capricórnio"] },
      { text: "Organiza e revisa antes de entregar", signs: ["Virgem", "Touro", "Escorpião"] },
      { text: "Tem as ideias e apresenta", signs: ["Gêmeos", "Aquário", "Sagitário"] },
      { text: "Segura o clima e percebe quem está mal", signs: ["Câncer", "Libra", "Peixes"] },
    ],
  },
  {
    text: "Seu jeito de discutir:",
    options: [
      { text: "Falo na hora e passa rápido", signs: ["Áries", "Sagitário", "Gêmeos"] },
      { text: "Guardo e lembro por muito tempo", signs: ["Escorpião", "Touro", "Capricórnio"] },
      { text: "Evito, mas fico remoendo", signs: ["Câncer", "Peixes", "Libra"] },
      { text: "Argumento até o outro entender a lógica", signs: ["Aquário", "Virgem", "Leão"] },
    ],
  },
  {
    text: "Férias dos sonhos:",
    options: [
      { text: "Roteiro novo, mochila, sem plano fixo", signs: ["Sagitário", "Áries"] },
      { text: "Lugar bonito, comida boa, sem pressa", signs: ["Touro", "Libra", "Câncer"] },
      { text: "Cidade grande, cultura, gente", signs: ["Gêmeos", "Leão", "Aquário"] },
      { text: "Praia vazia ou montanha, silêncio", signs: ["Peixes", "Escorpião", "Virgem", "Capricórnio"] },
    ],
  },
  {
    text: "Caiu um dinheiro inesperado. Você:",
    options: [
      { text: "Gasta numa experiência, agora", signs: ["Áries", "Sagitário", "Leão"] },
      { text: "Guarda, talvez invista", signs: ["Touro", "Capricórnio", "Virgem"] },
      { text: "Divide: um pouco pra você, um pouco pra alguém", signs: ["Câncer", "Libra", "Peixes"] },
      { text: "Compra algo tecnológico ou um curso", signs: ["Aquário", "Gêmeos", "Escorpião"] },
    ],
  },
  {
    text: "Como você ama:",
    options: [
      { text: "Intensamente e de uma vez", signs: ["Escorpião", "Áries", "Leão"] },
      { text: "Devagar, com presença e rotina", signs: ["Touro", "Câncer", "Capricórnio"] },
      { text: "Com conversa, liberdade e curiosidade", signs: ["Gêmeos", "Aquário", "Sagitário"] },
      { text: "Cuidando, às vezes demais", signs: ["Virgem", "Peixes", "Libra"] },
    ],
  },
];

/**
 * Soma os pontos e devolve o signo vencedor. Em empate, escolhe entre os
 * empatados por um índice derivado das respostas, para não favorecer a
 * ordem da lista e manter o resultado determinístico.
 */
export function computeResult(answers: number[]): SignName {
  const score = new Map<SignName, number>(SIGNS.map((s) => [s, 0]));
  answers.forEach((choice, i) => {
    const opt = QUESTIONS[i]?.options[choice];
    if (!opt) return;
    for (const s of opt.signs) score.set(s, (score.get(s) ?? 0) + 1);
  });
  const max = Math.max(...score.values());
  const tied = SIGNS.filter((s) => score.get(s) === max);
  const seed = answers.reduce((acc, a, i) => acc + (a + 1) * (i + 7), 0);
  return tied[seed % tied.length];
}

// ─── Textos de resultado ────────────────────────────────────────────────────

export const RESULT_COPY: Record<SignName, string> = {
  Áries: "Você decide rápido e prefere errar agindo a acertar esperando. Impaciência é o preço, coragem é o ganho.",
  Touro: "Você gosta do que dura: rotina boa, comida boa, gente que fica. Mudar você não é impossível, só é lento.",
  Gêmeos: "Sua cabeça funciona em abas abertas. A curiosidade te leva longe, desde que alguém lembre de onde você começou.",
  Câncer: "Você sente o clima da sala antes de alguém falar. Cuida de todo mundo e às vezes esquece de se incluir na lista.",
  Leão: "Você precisa de palco, mas o que quer mesmo é ser visto por quem importa. Generosidade e orgulho vêm no mesmo pacote.",
  Virgem: "Você repara no detalhe que ninguém viu e conserta antes de avisar. Sua autocrítica trabalha mais que qualquer chefe.",
  Libra: "Você pesa os dois lados até quando não precisa. Faz isso porque quer que fique justo, e bonito.",
  Escorpião: "Você não faz nada pela metade, nem confiar, nem cortar. Profundidade é a sua zona de conforto.",
  Sagitário: "Você acredita que o próximo lugar vai ser melhor, e geralmente vai atrás para conferir. Otimismo com passagem comprada.",
  Capricórnio: "Você joga o jogo longo. Enquanto os outros comemoram o começo, você já está construindo o meio.",
  Aquário: "Você olha para o que todo mundo aceita e pergunta por quê. Às vezes fica sozinho nessa, e não se importa.",
  Peixes: "Você absorve o que está no ar, o bom e o ruim. A imaginação é o seu refúgio e o seu jeito de resolver.",
};

export type Element = "Fogo" | "Terra" | "Ar" | "Água";

export const ELEMENT: Record<SignName, Element> = {
  Áries: "Fogo", Leão: "Fogo", Sagitário: "Fogo",
  Touro: "Terra", Virgem: "Terra", Capricórnio: "Terra",
  Gêmeos: "Ar", Libra: "Ar", Aquário: "Ar",
  Câncer: "Água", Escorpião: "Água", Peixes: "Água",
};

/** Frase de cruzamento: como você responde (elemento) versus como nasceu (elemento). */
const TENSION: Record<Element, Record<Element, string>> = {
  Fogo: {
    Fogo: "Seu jeito combina com o mapa. O que os amigos veem é o que o céu escreveu.",
    Terra: "Você age com impulso de Fogo em cima de uma base de Terra. O arroubo passa, a palavra fica.",
    Ar: "Fogo no jeito, Ar no mapa. Você acende as ideias dos outros e depois quer saber onde foram parar.",
    Água: "Fogo por fora, Água por dentro. A coragem que todo mundo vê protege uma sensibilidade que poucos conhecem.",
  },
  Terra: {
    Fogo: "Você responde como Terra, mas nasceu Fogo. A calma é aprendida, o impulso é de fábrica, e ele aparece quando importa.",
    Terra: "Seu jeito combina com o mapa. O que os amigos veem é o que o céu escreveu.",
    Ar: "Terra no jeito, Ar no mapa. Você organiza o que a cabeça inventa, e a cabeça inventa muito.",
    Água: "Terra por fora, Água por dentro. Parece firme porque sente demais e aprendeu a segurar.",
  },
  Ar: {
    Fogo: "Você responde como Ar, mas nasceu Fogo. Racionaliza o impulso, e quando não dá, o impulso vence.",
    Terra: "Ar no jeito, Terra no mapa. Fala leve, mas por baixo há alguém que não esquece um combinado.",
    Ar: "Seu jeito combina com o mapa. O que os amigos veem é o que o céu escreveu.",
    Água: "Ar por fora, Água por dentro. Explica tudo com lógica até chegar no assunto que dói.",
  },
  Água: {
    Fogo: "Você responde como Água, mas nasceu Fogo. Sente antes de agir, e quando age, ninguém segura.",
    Terra: "Água no jeito, Terra no mapa. Emoção com raiz: sente fundo, mas não sai do lugar por isso.",
    Ar: "Água por fora, Ar por dentro. Parece intuição, mas você está lendo todo mundo o tempo inteiro.",
    Água: "Seu jeito combina com o mapa. O que os amigos veem é o que o céu escreveu.",
  },
};

export function tensionLine(quizSign: SignName, realSign: SignName): string {
  return TENSION[ELEMENT[quizSign]][ELEMENT[realSign]];
}

/**
 * Segmento da URL de resultado: "escorpiao" (só o resultado) ou
 * "escorpiao-leao" (resultado e signo real).
 */
export function parseCombo(combo: string): { quiz: SignName; real: SignName | null } | null {
  const [a, b, extra] = combo.split("-");
  if (extra) return null;
  const quiz = signFromSlug(a);
  if (!quiz) return null;
  if (!b) return { quiz, real: null };
  const real = signFromSlug(b);
  return real ? { quiz, real } : null;
}

/** Título do resultado, com ou sem o signo real. */
export function resultTitle(quizSign: SignName, realSign: SignName | null): string {
  if (!realSign) return `Você responde como ${quizSign}`;
  if (realSign === quizSign) return `Você responde como ${quizSign}. E é ${quizSign}.`;
  return `Você responde como ${quizSign}, mas é ${realSign}`;
}
