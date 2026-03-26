export type ForecastCard = {
  icon: string;
  label: string;
  text: string;
  color: string;
};

export type ForecastData = {
  sign: string;
  symbol: string;
  planetLine: string;
  quote: string;
  cards: [ForecastCard, ForecastCard, ForecastCard];
};

export type ForecastStatus = "idle" | "loading" | "ready";

export type ForecastState =
  | { status: "idle" }
  | { status: "loading"; sign: string; name: string }
  | { status: "ready"; sign: string; name: string; data: ForecastData }
  | { status: "error"; message: string };

// ─── Mock forecast data keyed by zodiac sign name ───────────────────────────

const FORECASTS: Record<string, ForecastData> = {
  Áries: {
    sign: "Áries",
    symbol: "♈",
    planetLine: "Marte em Conjunção · Sol em Harmonia",
    quote:
      "O fogo que arde em você hoje não é impulsividade — é clareza. Marte amplia sua determinação enquanto o Sol ilumina o caminho que já está traçado. Avance com intenção.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Paixão e espontaneidade estão em alta. Diga o que sente antes que o momento passe.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Sua liderança natural inspira. Tome a iniciativa num projeto que está parado.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Nível máximo. Canalize para exercício físico pela manhã e evite dispersão à tarde.",
        color: "text-tertiary",
      },
    ],
  },
  Touro: {
    sign: "Touro",
    symbol: "♉",
    planetLine: "Vênus em Trígono · Saturno em Sextil",
    quote:
      "A terra sustenta quem a respeita. Vênus traz beleza às suas relações enquanto Saturno consolida o que foi plantado com paciência. Colha devagar — o que é sólido não some.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Conexões se aprofundam através do toque e da presença. Palavras são secundárias hoje.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Finanças em foco. Uma decisão que adiou há semanas pede resolução agora.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Estável e restauradora. Priorize conforto e alimentação consciente.",
        color: "text-tertiary",
      },
    ],
  },
  Gêmeos: {
    sign: "Gêmeos",
    symbol: "♊",
    planetLine: "Mercúrio em Quíntil · Urano em Aspecto",
    quote:
      "Sua mente hoje é um arquivo de insights. Mercúrio ativa conexões entre ideias que pareciam separadas. Escreva, fale, conecte — mas escolha com quem compartilha.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Conversa inteligente é seu maior afrodisíaco. Surpreenda com curiosidade genuína.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Comunicação e negociação estão favorecidas. Feche aquela conversa difícil com leveza.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Mental em overdrive. Medite 10 minutos para não perder o fio condutor do dia.",
        color: "text-tertiary",
      },
    ],
  },
  Câncer: {
    sign: "Câncer",
    symbol: "♋",
    planetLine: "Lua em Domicílio · Netuno em Sextil",
    quote:
      "O oceano interior revela seu mapa hoje. Netuno dissolve fronteiras entre intuição e certeza — confie no que sentir antes de entender. Sua sensibilidade é uma bússola, não uma fraqueza.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Vulnerabilidade cria pontes hoje. Quem realmente te ama aguenta sua maré.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Projetos criativos florescem. Evite confrontos diretos — espere pela maré certa.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Receptiva e intuitiva. Proteja-se de ambientes com muita agitação ou negatividade.",
        color: "text-tertiary",
      },
    ],
  },
  Leão: {
    sign: "Leão",
    symbol: "♌",
    planetLine: "Sol em Domicílio · Júpiter em Trígono",
    quote:
      "O palco é seu, mas o roteiro mudou. Júpiter amplifica tudo que você projeta — projete generosidade, não ego. A verdadeira liderança hoje nasce de inspirar, não de impressionar.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Romantismo em alta. Um gesto grandioso bem planejado será mais lembrado do que cem palavras.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Visibilidade máxima. Apresente sua ideia — hoje as pessoas estão receptivas à sua visão.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Solar e expansiva. Use para atividades que exijam carisma e presença.",
        color: "text-tertiary",
      },
    ],
  },
  Virgem: {
    sign: "Virgem",
    symbol: "♍",
    planetLine: "Mercúrio em Domicílio · Vesta em Conjunção",
    quote:
      "O detalhe que todos ignoram é onde sua maestria vive. Mercúrio ativa sua percepção analítica ao máximo — mas cuidado para que a análise não paralise a entrega. Feito é melhor que perfeito.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Atos de serviço falam mais que palavras. Cuide de alguém de forma prática e concreta.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Organização e revisão são seus superpoderes hoje. Documente o que sabe antes de perder.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Focada e eficiente. Cuidado com autocrítica excessiva — você está fazendo o suficiente.",
        color: "text-tertiary",
      },
    ],
  },
  Libra: {
    sign: "Libra",
    symbol: "♎",
    planetLine: "Vênus em Domicílio · Lua em Trígono",
    quote:
      "O equilíbrio que você busca não está no meio-termo — está na escolha consciente. Vênus ilumina suas relações e Lua apoia sua sensibilidade. Decida pelo que é belo e justo.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Harmonia restaurada. Uma conversa honesta hoje evita um mal-entendido futuro.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Parcerias e colaborações estão em destaque. Não decida sozinho o que pode ser co-criado.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Elegante e social. Ambientes bonitos e pessoas inspiradoras elevam sua vibração.",
        color: "text-tertiary",
      },
    ],
  },
  Escorpião: {
    sign: "Escorpião",
    symbol: "♏",
    planetLine: "Plutão em Sextil · Marte em Quíntil",
    quote:
      "Nas profundezas que você evitou está a resposta que procura. Plutão convida à transmutação — o que termina hoje abre espaço para o que ainda não tem nome. Confie na metamorfose.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Intensidade é sua linguagem nativa. Não tema a profundidade — ela é o seu dom.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Investigação e pesquisa favorecidas. Descubra o que está oculto nos números ou nas entrelinhas.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Poderosa e regeneradora. Ritual noturno de silêncio e introspecção trará clareza ao amanhã.",
        color: "text-tertiary",
      },
    ],
  },
  Sagitário: {
    sign: "Sagitário",
    symbol: "♐",
    planetLine: "Júpiter em Domicílio · Sol em Sextil",
    quote:
      "O horizonte não é um limite — é um convite. Júpiter expande sua visão para além do que parecia possível. Hoje, a pergunta certa abre mais portas do que a resposta certa.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Aventura conjunta fortalece laços. Proponha algo novo e inédito para quem ama.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Expansão internacional ou educacional no radar. Aprenda algo fora da sua zona de conforto.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Aventureira e otimista. Atividades ao ar livre ou viagens curtas carregam sua bateria.",
        color: "text-tertiary",
      },
    ],
  },
  Capricórnio: {
    sign: "Capricórnio",
    symbol: "♑",
    planetLine: "Saturno em Domicílio · Marte em Trígono",
    quote:
      "A montanha respeita quem sobe devagar. Saturno valida sua disciplina e Marte dá o impulso necessário para o próximo patamar. Nada foi em vão — tudo estava sendo construído para agora.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Compromisso e consistência são sua forma de amar. Mostre presença, não apenas intenção.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Reconhecimento profissional no horizonte. Documente conquistas e prepare-se para visibilidade.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Sólida e resiliente. Evite sobrecarga — eficiência importa mais que horas trabalhadas.",
        color: "text-tertiary",
      },
    ],
  },
  Aquário: {
    sign: "Aquário",
    symbol: "♒",
    planetLine: "Urano em Domicílio · Mercúrio em Sextil",
    quote:
      "O futuro que imagina já existe como possibilidade. Urano ativa sua visão sistêmica — enxerga o padrão onde outros veem caos. Use isso para transformar, não apenas para observar.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Amizade é a base mais sólida para o amor. Cultive quem te aceita em toda a sua singularidade.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Inovação e tecnologia favorecidas. Uma ideia aparentemente louca pode ser a próxima virada.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Elétrica e não-linear. Permita mudanças de plano — a flexibilidade é sua vantagem hoje.",
        color: "text-tertiary",
      },
    ],
  },
  Peixes: {
    sign: "Peixes",
    symbol: "♓",
    planetLine: "Netuno em Domicílio · Vênus em Conjunção",
    quote:
      "O que parece sonho é a linguagem da sua alma. Netuno dissolve ilusões e Vênus traz suavidade ao processo. Você não está perdido — está navegando por águas que mapas convencionais não alcançam.",
    cards: [
      {
        icon: "favorite",
        label: "Amor",
        text: "Empatia sem limites hoje — proteja-se da dissolução. Amar não exige que você desapareça.",
        color: "text-primary",
      },
      {
        icon: "work",
        label: "Trabalho",
        text: "Arte, música e intuição criativa estão em pico. Confie no processo sem exigir resultados imediatos.",
        color: "text-secondary",
      },
      {
        icon: "bolt",
        label: "Energia",
        text: "Fluida e sensível. Água e silêncio são restauradores. Evite ruído informacional excessivo.",
        color: "text-tertiary",
      },
    ],
  },
};

/**
 * Calls the /api/forecast route to generate a forecast via LLM.
 * Throws an error with the API message so the caller can surface it to the user.
 */
export async function generateForecast(sign: string): Promise<ForecastData> {
  const res = await fetch("/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sign }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Falha ao consultar os astros. Tente novamente.");
  }

  return await res.json();
}
