import type { SignName } from "@/lib/ephemeris";

/**
 * Texto fixo de Mercúrio retrógrado, escrito à mão e revisado uma vez.
 * É organizado por casa (contada do signo solar) e por signo onde o planeta
 * retrograda, então serve para qualquer ciclo sem gerar texto novo.
 */

export type HouseCopy = {
  /** Assunto da casa, curto, para títulos e listas. */
  theme: string;
  /** Dois parágrafos curtos. */
  text: [string, string];
  good: string;
  avoid: string;
};

export const HOUSES: Record<number, HouseCopy> = {
  1: {
    theme: "você e a forma como se apresenta",
    text: [
      "Mercúrio volta sobre o seu próprio signo. O assunto é você: o jeito de falar, de se mostrar, de decidir o que vem primeiro. Frases saem antes da hora, e a imagem que você passa pode não ser a que imagina.",
      "É um bom período para ouvir mais do que explicar e para rever planos pessoais que começaram no impulso. O que você quer agora talvez não seja o que queria no começo do ano, e tudo bem perceber isso.",
    ],
    good: "Reler o que escreve antes de enviar e rever metas pessoais.",
    avoid: "Mudar de visual ou de rumo só para responder a uma fase.",
  },
  2: {
    theme: "dinheiro, valores e o que é seu",
    text: [
      "Mercúrio retrograda na casa do dinheiro que você ganha e gasta. Boletos esquecidos, cobranças em dobro e assinaturas que você nem usa tendem a aparecer.",
      "Use o período para conferir a conta, renegociar o que pesa e perguntar se você paga pelo que de fato valoriza. Compras grandes rendem mais quando você pesquisa agora e decide depois.",
    ],
    good: "Revisar extrato, cancelar o que não usa e retomar uma cobrança parada.",
    avoid: "Compra grande por impulso, ainda mais de eletrônicos.",
  },
  3: {
    theme: "conversas do dia a dia, estudos e trajetos",
    text: [
      "Mercúrio está na casa em que ele mais trabalha: mensagens, telefonemas, a ida e a volta, o vizinho, o irmão. É onde os desencontros ficam mais visíveis, como áudio mal interpretado, endereço errado e reunião que ninguém confirmou.",
      "Em compensação, é ótimo para revisar textos, retomar um curso parado e reatar conversa com alguém próximo. Saia com mais tempo e confirme o combinado por escrito.",
    ],
    good: "Revisar, reescrever e retomar estudos.",
    avoid: "Responder no calor do momento no grupo da família.",
  },
  4: {
    theme: "casa, família e raízes",
    text: [
      "Mercúrio retrograda na casa do lar. Pode ser o chuveiro que volta a dar problema, a mudança que atrasa, ou uma conversa de família que não terminou e pede para ser retomada.",
      "É um bom período para arrumar, consertar, reorganizar armários e ligar para quem está longe. Se você precisa decidir sobre imóvel, junte informação agora e assine quando o planeta voltar a andar.",
    ],
    good: "Consertos, arrumação e conversas pendentes em casa.",
    avoid: "Fechar contrato de aluguel ou compra sem ler duas vezes.",
  },
  5: {
    theme: "romance, prazer e criatividade",
    text: [
      "Mercúrio volta pela casa do que dá prazer: paquera, filhos, hobbies, o projeto criativo de gaveta. Gente do passado costuma reaparecer, às vezes com uma mensagem sem contexto às onze da noite.",
      "Antes de responder, pergunte o que mudou de lá para cá. Para quem cria, é um ótimo período para retomar o que ficou pela metade em vez de começar do zero.",
    ],
    good: "Retomar um hobby ou um projeto criativo parado.",
    avoid: "Reatar só porque bateu saudade numa noite.",
  },
  6: {
    theme: "rotina, trabalho diário e saúde",
    text: [
      "Mercúrio retrograda na casa da rotina. Agenda que trava, sistema que cai, tarefa que volta com correção. O detalhe que passou despercebido em setembro pede atenção agora.",
      "É um bom período para revisar processos, organizar arquivos e remarcar aquele exame que você vem adiando. Ajustar a rotina rende mais do que reinventá-la.",
    ],
    good: "Organizar o trabalho, fazer backup e marcar exames de rotina.",
    avoid: "Trocar de método ou de ferramenta no meio de uma entrega.",
  },
  7: {
    theme: "parcerias, relações e contratos",
    text: [
      "Mercúrio volta pela casa das relações a dois, no amor e nos negócios. Pode surgir um mal-entendido com quem está do seu lado, ou um contrato que precisa ser revisto antes de seguir.",
      "Fale com calma e repita o que entendeu antes de responder. Acordos antigos podem ser renegociados com vantagem para os dois lados agora.",
    ],
    good: "Renegociar acordos e ter a conversa que ficou para depois.",
    avoid: "Assinar parceria nova sem tempo para ler.",
  },
  8: {
    theme: "dinheiro compartilhado, dívidas e intimidade",
    text: [
      "Mercúrio retrograda na casa do que é dividido: conta conjunta, dívida, imposto, herança, e também a intimidade. Assuntos que você evitou tendem a voltar à mesa.",
      "É um bom período para organizar papéis, quitar ou renegociar uma dívida e falar do que ficou não dito numa relação próxima. Leia as letras miúdas.",
    ],
    good: "Renegociar dívidas e organizar documentos.",
    avoid: "Emprestar dinheiro ou fazer financiamento sem conferir tudo.",
  },
  9: {
    theme: "viagens, estudos e crenças",
    text: [
      "Mercúrio volta pela casa das viagens longas, dos estudos e das grandes ideias. Voo remarcado, documento vencido e inscrição com erro são os tropeços típicos.",
      "Confira passaporte, reserva e prazo de matrícula com antecedência. É um ótimo período para reler um livro importante, retomar um idioma ou rever uma opinião que você defendia com força.",
    ],
    good: "Conferir documentos de viagem e retomar estudos.",
    avoid: "Comprar passagem sem checar datas e regras de remarcação.",
  },
  10: {
    theme: "carreira e reputação",
    text: [
      "Mercúrio retrograda na casa da vida pública. Recados de chefia podem chegar truncados, um projeto antigo pode voltar à pauta e uma decisão de carreira pode pedir mais tempo.",
      "Use o período para rever metas profissionais, atualizar o currículo e retomar contato com quem já trabalhou com você. Anúncios grandes rendem mais depois da estação direta.",
    ],
    good: "Atualizar currículo e portfólio e reatar contatos profissionais.",
    avoid: "Pedir demissão por um e-mail mal interpretado.",
  },
  11: {
    theme: "amigos, grupos e planos para o futuro",
    text: [
      "Mercúrio volta pela casa dos amigos e dos grupos. Confusão no grupo de mensagens, encontro desmarcado e um amigo antigo que reaparece são o tom do período.",
      "É um bom momento para rever planos de longo prazo e perguntar se eles ainda são seus. Retome contato com quem sumiu sem cobrar explicação.",
    ],
    good: "Rever planos de longo prazo e reencontrar amigos antigos.",
    avoid: "Discussões longas por mensagem em grupo.",
  },
  12: {
    theme: "descanso, bastidores e o que fica guardado",
    text: [
      "Mercúrio retrograda na casa mais silenciosa do mapa. Pensamentos que você deixou de lado tendem a voltar, às vezes de madrugada. O cansaço pode ser maior do que o normal.",
      "É um período para dormir mais, escrever o que passa pela cabeça e resolver por dentro antes de falar por fora. O que está nos bastidores vem à tona com calma, se você deixar.",
    ],
    good: "Descansar, escrever e terapia.",
    avoid: "Tomar decisões importantes cansado.",
  },
};

/** Tom do ciclo conforme o signo onde Mercúrio retrograda. */
export const RETRO_SIGN_TONE: Record<SignName, string> = {
  Áries: "Em Áries, a pressa é o problema. Palavras saem rápidas demais, e começar de novo tenta mais do que terminar.",
  Touro: "Em Touro, o assunto é dinheiro, conforto e o que se tem. É hora de rever gastos e valores sem pressa.",
  Gêmeos: "Em Gêmeos, signo que Mercúrio rege, os desencontros de comunicação ficam em dobro, e revisar também rende em dobro.",
  Câncer: "Em Câncer, a memória e a família ganham voz. Conversas antigas voltam, e o passado pede um lugar na mesa.",
  Leão: "Em Leão, o orgulho atrapalha a escuta. É tempo de rever como você se expressa e o que quer que vejam.",
  Virgem: "Em Virgem, signo que Mercúrio rege, os detalhes cobram atenção. Revisar listas, rotinas e números é o melhor uso do período.",
  Libra: "Em Libra, o foco está nos acordos e nas relações. Decisões a dois pedem mais uma rodada de conversa.",
  Escorpião: "Em Escorpião, o que não foi dito vem à tona. É um ciclo para conversas difíceis, segredos guardados e dinheiro dividido.",
  Sagitário: "Em Sagitário, promessas grandes e planos de viagem pedem revisão. Confira os fatos antes de defender uma opinião.",
  Capricórnio: "Em Capricórnio, planos de carreira e compromissos sérios voltam à pauta. Prazos e contratos merecem leitura atenta.",
  Aquário: "Em Aquário, grupos, tecnologia e ideias de futuro entram em revisão. Espere falhas de sistema e reencontros com amigos.",
  Peixes: "Em Peixes, a comunicação fica mais intuitiva e menos precisa. Confirme o que entendeu e dê espaço ao que sente.",
};

/** Explicação geral, igual para todos os ciclos. */
export const WHAT_IS: string[] = [
  "Mercúrio não anda para trás. Da Terra, ele parece recuar no céu por cerca de três semanas, três ou quatro vezes por ano, porque os dois planetas giram em velocidades diferentes em volta do Sol.",
  "Na astrologia, Mercúrio rege comunicação, contratos, deslocamentos e tecnologia. Quando ele retrograda, esses assuntos pedem revisão. É uma fase melhor para retomar do que para começar.",
  "A sombra é o trecho antes e depois do retrógrado em que Mercúrio passa pelos mesmos graus. Os temas costumam aparecer na sombra de entrada e se resolver na de saída.",
];
