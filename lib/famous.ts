import type { SignName } from "@/lib/ephemeris";
import { signByMonthDay } from "@/lib/slugs";

/**
 * Gente famosa e personagens por signo. O signo é calculado pela data,
 * nunca digitado, para a base ser conferível: basta checar o aniversário.
 *
 * kind: "pessoa" (real) ou "personagem" (ficção, aniversário canônico ou
 * consagrado pela obra). Datas em cúspide são rejeitadas pela checagem.
 */

export type Famous = {
  name: string;
  /** "MM-DD" */
  date: string;
  kind: "pessoa" | "personagem";
  /** Obra, banda ou área, para dar contexto na tela. */
  from: string;
};

export const FAMOUS: Famous[] = [
  // ── Música (internacional) ──
  { name: "Beyoncé", date: "09-04", kind: "pessoa", from: "cantora" },
  { name: "Taylor Swift", date: "12-13", kind: "pessoa", from: "cantora" },
  { name: "Rihanna", date: "02-20", kind: "pessoa", from: "cantora" },
  { name: "Lady Gaga", date: "03-28", kind: "pessoa", from: "cantora" },
  { name: "Ariana Grande", date: "06-26", kind: "pessoa", from: "cantora" },
  { name: "Billie Eilish", date: "12-18", kind: "pessoa", from: "cantora" },
  { name: "Harry Styles", date: "02-01", kind: "pessoa", from: "cantor" },
  { name: "Bad Bunny", date: "03-10", kind: "pessoa", from: "cantor" },
  { name: "Shakira", date: "02-02", kind: "pessoa", from: "cantora" },
  { name: "Adele", date: "05-05", kind: "pessoa", from: "cantora" },
  { name: "The Weeknd", date: "02-16", kind: "pessoa", from: "cantor" },
  { name: "Bruno Mars", date: "10-08", kind: "pessoa", from: "cantor" },
  { name: "Drake", date: "10-24", kind: "pessoa", from: "rapper" },
  { name: "Kendrick Lamar", date: "06-17", kind: "pessoa", from: "rapper" },
  { name: "Justin Bieber", date: "03-01", kind: "pessoa", from: "cantor" },
  { name: "Olivia Rodrigo", date: "02-20", kind: "pessoa", from: "cantora" },
  { name: "Sabrina Carpenter", date: "05-11", kind: "pessoa", from: "cantora" },
  { name: "Doja Cat", date: "10-21", kind: "pessoa", from: "cantora" },
  { name: "SZA", date: "11-08", kind: "pessoa", from: "cantora" },
  { name: "Katy Perry", date: "10-25", kind: "pessoa", from: "cantora" },
  { name: "Madonna", date: "08-16", kind: "pessoa", from: "cantora" },
  { name: "Michael Jackson", date: "08-29", kind: "pessoa", from: "cantor" },
  { name: "Freddie Mercury", date: "09-05", kind: "pessoa", from: "Queen" },
  { name: "David Bowie", date: "01-08", kind: "pessoa", from: "cantor" },
  { name: "Elvis Presley", date: "01-08", kind: "pessoa", from: "cantor" },
  { name: "John Lennon", date: "10-09", kind: "pessoa", from: "Beatles" },
  { name: "Paul McCartney", date: "06-18", kind: "pessoa", from: "Beatles" },
  { name: "Bob Marley", date: "02-06", kind: "pessoa", from: "cantor" },
  { name: "Prince", date: "06-07", kind: "pessoa", from: "cantor" },
  { name: "Whitney Houston", date: "08-09", kind: "pessoa", from: "cantora" },
  { name: "Amy Winehouse", date: "09-14", kind: "pessoa", from: "cantora" },
  { name: "Kurt Cobain", date: "02-20", kind: "pessoa", from: "Nirvana" },
  { name: "Britney Spears", date: "12-02", kind: "pessoa", from: "cantora" },
  { name: "Mariah Carey", date: "03-27", kind: "pessoa", from: "cantora" },
  { name: "Elton John", date: "03-25", kind: "pessoa", from: "cantor" },
  { name: "Stevie Wonder", date: "05-13", kind: "pessoa", from: "cantor" },
  { name: "Tina Turner", date: "11-26", kind: "pessoa", from: "cantora" },
  { name: "Jimi Hendrix", date: "11-27", kind: "pessoa", from: "guitarrista" },
  { name: "Nicki Minaj", date: "12-08", kind: "pessoa", from: "rapper" },
  { name: "Jungkook", date: "09-01", kind: "pessoa", from: "BTS" },
  { name: "Jimin", date: "10-13", kind: "pessoa", from: "BTS" },
  { name: "V", date: "12-30", kind: "pessoa", from: "BTS" },
  { name: "RM", date: "09-12", kind: "pessoa", from: "BTS" },
  { name: "Jennie", date: "01-16", kind: "pessoa", from: "Blackpink" },
  { name: "Lisa", date: "03-27", kind: "pessoa", from: "Blackpink" },
  { name: "Rosé", date: "02-11", kind: "pessoa", from: "Blackpink" },

  // ── Música (Brasil) ──
  { name: "Anitta", date: "03-30", kind: "pessoa", from: "cantora" },
  { name: "Gilberto Gil", date: "06-26", kind: "pessoa", from: "cantor" },
  { name: "Caetano Veloso", date: "08-07", kind: "pessoa", from: "cantor" },
  { name: "Chico Buarque", date: "06-19", kind: "pessoa", from: "cantor" },
  { name: "Elis Regina", date: "03-17", kind: "pessoa", from: "cantora" },
  { name: "Gal Costa", date: "09-26", kind: "pessoa", from: "cantora" },
  { name: "Maria Bethânia", date: "06-18", kind: "pessoa", from: "cantora" },
  { name: "Djavan", date: "01-27", kind: "pessoa", from: "cantor" },
  { name: "Marisa Monte", date: "07-01", kind: "pessoa", from: "cantora" },
  { name: "Rita Lee", date: "12-31", kind: "pessoa", from: "cantora" },
  { name: "Cazuza", date: "04-04", kind: "pessoa", from: "cantor" },
  { name: "Renato Russo", date: "03-27", kind: "pessoa", from: "Legião Urbana" },
  { name: "Tim Maia", date: "09-28", kind: "pessoa", from: "cantor" },
  { name: "Jorge Ben Jor", date: "03-22", kind: "pessoa", from: "cantor" },
  { name: "Milton Nascimento", date: "10-26", kind: "pessoa", from: "cantor" },
  { name: "Ivete Sangalo", date: "05-27", kind: "pessoa", from: "cantora" },
  { name: "Ludmilla", date: "04-24", kind: "pessoa", from: "cantora" },
  { name: "Pabllo Vittar", date: "11-01", kind: "pessoa", from: "cantora" },
  { name: "Luísa Sonza", date: "07-18", kind: "pessoa", from: "cantora" },
  { name: "Tom Jobim", date: "01-25", kind: "pessoa", from: "compositor" },
  { name: "Vinicius de Moraes", date: "10-19", kind: "pessoa", from: "poeta" },
  { name: "Cartola", date: "10-11", kind: "pessoa", from: "sambista" },
  { name: "Luiz Gonzaga", date: "12-13", kind: "pessoa", from: "cantor" },
  { name: "Dorival Caymmi", date: "04-30", kind: "pessoa", from: "cantor" },
  { name: "Zeca Pagodinho", date: "02-04", kind: "pessoa", from: "sambista" },
  { name: "Seu Jorge", date: "06-08", kind: "pessoa", from: "cantor" },
  { name: "Emicida", date: "08-17", kind: "pessoa", from: "rapper" },
  { name: "Criolo", date: "09-05", kind: "pessoa", from: "rapper" },
  { name: "Mano Brown", date: "04-22", kind: "pessoa", from: "Racionais MC's" },
  { name: "Gloria Groove", date: "03-26", kind: "pessoa", from: "cantora" },
  { name: "Liniker", date: "07-03", kind: "pessoa", from: "cantora" },
  { name: "Jão", date: "12-03", kind: "pessoa", from: "cantor" },
  { name: "Ana Castela", date: "11-05", kind: "pessoa", from: "cantora" },
  { name: "Gusttavo Lima", date: "09-03", kind: "pessoa", from: "cantor" },
  { name: "Sandy", date: "01-28", kind: "pessoa", from: "cantora" },
  { name: "Lulu Santos", date: "05-04", kind: "pessoa", from: "cantor" },
  { name: "Nando Reis", date: "01-12", kind: "pessoa", from: "cantor" },
  { name: "Cássia Eller", date: "12-10", kind: "pessoa", from: "cantora" },
  { name: "Marina Sena", date: "06-03", kind: "pessoa", from: "cantora" },
  { name: "Ney Matogrosso", date: "08-01", kind: "pessoa", from: "cantor" },
  { name: "Elba Ramalho", date: "08-17", kind: "pessoa", from: "cantora" },
  { name: "Adriana Calcanhotto", date: "10-03", kind: "pessoa", from: "cantora" },

  // ── Cinema, TV e artes ──
  { name: "Zendaya", date: "09-01", kind: "pessoa", from: "atriz" },
  { name: "Timothée Chalamet", date: "12-27", kind: "pessoa", from: "ator" },
  { name: "Leonardo DiCaprio", date: "11-11", kind: "pessoa", from: "ator" },
  { name: "Brad Pitt", date: "12-18", kind: "pessoa", from: "ator" },
  { name: "Angelina Jolie", date: "06-04", kind: "pessoa", from: "atriz" },
  { name: "Tom Cruise", date: "07-03", kind: "pessoa", from: "ator" },
  { name: "Meryl Streep", date: "06-22", kind: "pessoa", from: "atriz" },
  { name: "Margot Robbie", date: "07-02", kind: "pessoa", from: "atriz" },
  { name: "Ryan Gosling", date: "11-12", kind: "pessoa", from: "ator" },
  { name: "Emma Watson", date: "04-15", kind: "pessoa", from: "atriz" },
  { name: "Keanu Reeves", date: "09-02", kind: "pessoa", from: "ator" },
  { name: "Will Smith", date: "09-25", kind: "pessoa", from: "ator" },
  { name: "Denzel Washington", date: "12-28", kind: "pessoa", from: "ator" },
  { name: "Johnny Depp", date: "06-09", kind: "pessoa", from: "ator" },
  { name: "Natalie Portman", date: "06-09", kind: "pessoa", from: "atriz" },
  { name: "Robert Downey Jr.", date: "04-04", kind: "pessoa", from: "ator" },
  { name: "Chris Evans", date: "06-13", kind: "pessoa", from: "ator" },
  { name: "Chris Hemsworth", date: "08-11", kind: "pessoa", from: "ator" },
  { name: "Tom Holland", date: "06-01", kind: "pessoa", from: "ator" },
  { name: "Pedro Pascal", date: "04-02", kind: "pessoa", from: "ator" },
  { name: "Jennifer Aniston", date: "02-11", kind: "pessoa", from: "atriz" },
  { name: "Julia Roberts", date: "10-28", kind: "pessoa", from: "atriz" },
  { name: "Sandra Bullock", date: "07-26", kind: "pessoa", from: "atriz" },
  { name: "Oprah Winfrey", date: "01-29", kind: "pessoa", from: "apresentadora" },
  { name: "Kim Kardashian", date: "10-21", kind: "pessoa", from: "empresária" },
  { name: "Steven Spielberg", date: "12-18", kind: "pessoa", from: "diretor" },
  { name: "Quentin Tarantino", date: "03-27", kind: "pessoa", from: "diretor" },
  { name: "Martin Scorsese", date: "11-17", kind: "pessoa", from: "diretor" },
  { name: "Greta Gerwig", date: "08-04", kind: "pessoa", from: "diretora" },
  { name: "Hayao Miyazaki", date: "01-05", kind: "pessoa", from: "Studio Ghibli" },
  { name: "Walt Disney", date: "12-05", kind: "pessoa", from: "criador" },
  { name: "Stan Lee", date: "12-28", kind: "pessoa", from: "Marvel" },
  { name: "Fernanda Montenegro", date: "10-16", kind: "pessoa", from: "atriz" },
  { name: "Fernanda Torres", date: "09-15", kind: "pessoa", from: "atriz" },
  { name: "Wagner Moura", date: "06-27", kind: "pessoa", from: "ator" },
  { name: "Selton Mello", date: "12-30", kind: "pessoa", from: "ator" },
  { name: "Alice Braga", date: "04-15", kind: "pessoa", from: "atriz" },
  { name: "Sônia Braga", date: "06-08", kind: "pessoa", from: "atriz" },
  { name: "Bruna Marquezine", date: "08-04", kind: "pessoa", from: "atriz" },
  { name: "Tatá Werneck", date: "08-11", kind: "pessoa", from: "humorista" },
  { name: "Paulo Gustavo", date: "10-30", kind: "pessoa", from: "humorista" },
  { name: "Renato Aragão", date: "01-13", kind: "pessoa", from: "Didi" },
  { name: "Silvio Santos", date: "12-12", kind: "pessoa", from: "apresentador" },
  { name: "Hebe Camargo", date: "03-08", kind: "pessoa", from: "apresentadora" },
  { name: "Xuxa", date: "03-27", kind: "pessoa", from: "apresentadora" },
  { name: "Ana Maria Braga", date: "04-01", kind: "pessoa", from: "apresentadora" },
  { name: "Luciano Huck", date: "09-03", kind: "pessoa", from: "apresentador" },
  { name: "Gisele Bündchen", date: "07-20", kind: "pessoa", from: "modelo" },
  { name: "Mauricio de Sousa", date: "10-27", kind: "pessoa", from: "Turma da Mônica" },
  { name: "Clarice Lispector", date: "12-10", kind: "pessoa", from: "escritora" },
  { name: "Jorge Amado", date: "08-10", kind: "pessoa", from: "escritor" },
  { name: "Tarsila do Amaral", date: "09-01", kind: "pessoa", from: "pintora" },
  { name: "Oscar Niemeyer", date: "12-15", kind: "pessoa", from: "arquiteto" },
  { name: "Santos Dumont", date: "07-20", kind: "pessoa", from: "inventor" },
  { name: "Frida Kahlo", date: "07-06", kind: "pessoa", from: "pintora" },
  { name: "Pablo Picasso", date: "10-25", kind: "pessoa", from: "pintor" },
  { name: "Leonardo da Vinci", date: "04-15", kind: "pessoa", from: "artista" },
  { name: "Salvador Dalí", date: "05-11", kind: "pessoa", from: "pintor" },
  { name: "Vincent van Gogh", date: "03-30", kind: "pessoa", from: "pintor" },
  { name: "Albert Einstein", date: "03-14", kind: "pessoa", from: "físico" },
  { name: "Marie Curie", date: "11-07", kind: "pessoa", from: "cientista" },
  { name: "Steve Jobs", date: "02-24", kind: "pessoa", from: "Apple" },
  { name: "Bill Gates", date: "10-28", kind: "pessoa", from: "Microsoft" },
  { name: "Barack Obama", date: "08-04", kind: "pessoa", from: "ex-presidente" },

  // ── Esporte ──
  { name: "Cristiano Ronaldo", date: "02-05", kind: "pessoa", from: "futebol" },
  { name: "Lionel Messi", date: "06-24", kind: "pessoa", from: "futebol" },
  { name: "Neymar", date: "02-05", kind: "pessoa", from: "futebol" },
  { name: "Vini Jr.", date: "07-12", kind: "pessoa", from: "futebol" },
  { name: "Ronaldo Fenômeno", date: "09-18", kind: "pessoa", from: "futebol" },
  { name: "Zico", date: "03-03", kind: "pessoa", from: "futebol" },
  { name: "Serena Williams", date: "09-26", kind: "pessoa", from: "tênis" },
  { name: "LeBron James", date: "12-30", kind: "pessoa", from: "basquete" },
  { name: "Michael Jordan", date: "02-17", kind: "pessoa", from: "basquete" },
  { name: "Usain Bolt", date: "08-21", kind: "pessoa", from: "atletismo" },
  { name: "Simone Biles", date: "03-14", kind: "pessoa", from: "ginástica" },
  { name: "Rebeca Andrade", date: "05-08", kind: "pessoa", from: "ginástica" },
  { name: "Rayssa Leal", date: "01-04", kind: "pessoa", from: "skate" },

  // ── Personagens (aniversário canônico ou consagrado) ──
  { name: "Harry Potter", date: "07-31", kind: "personagem", from: "Harry Potter" },
  { name: "Hermione Granger", date: "09-19", kind: "personagem", from: "Harry Potter" },
  { name: "Ron Weasley", date: "03-01", kind: "personagem", from: "Harry Potter" },
  { name: "Draco Malfoy", date: "06-05", kind: "personagem", from: "Harry Potter" },
  { name: "Severus Snape", date: "01-09", kind: "personagem", from: "Harry Potter" },
  { name: "Hagrid", date: "12-06", kind: "personagem", from: "Harry Potter" },
  { name: "Luna Lovegood", date: "02-13", kind: "personagem", from: "Harry Potter" },
  { name: "Ginny Weasley", date: "08-11", kind: "personagem", from: "Harry Potter" },
  { name: "Neville Longbottom", date: "07-30", kind: "personagem", from: "Harry Potter" },
  { name: "Sirius Black", date: "11-03", kind: "personagem", from: "Harry Potter" },
  { name: "Katniss Everdeen", date: "05-08", kind: "personagem", from: "Jogos Vorazes" },
  { name: "Bella Swan", date: "09-13", kind: "personagem", from: "Crepúsculo" },
  { name: "Percy Jackson", date: "08-18", kind: "personagem", from: "Percy Jackson" },
  { name: "Sherlock Holmes", date: "01-06", kind: "personagem", from: "Sherlock Holmes" },
  { name: "Peter Parker", date: "08-10", kind: "personagem", from: "Homem-Aranha" },
  { name: "Tony Stark", date: "05-29", kind: "personagem", from: "Homem de Ferro" },
  { name: "Steve Rogers", date: "07-04", kind: "personagem", from: "Capitão América" },
  { name: "Diana Prince", date: "03-22", kind: "personagem", from: "Mulher-Maravilha" },
  { name: "Harley Quinn", date: "07-20", kind: "personagem", from: "DC" },
  { name: "Homer Simpson", date: "05-12", kind: "personagem", from: "Os Simpsons" },
  { name: "Marge Simpson", date: "10-01", kind: "personagem", from: "Os Simpsons" },
  { name: "Bart Simpson", date: "02-23", kind: "personagem", from: "Os Simpsons" },
  { name: "Lisa Simpson", date: "05-09", kind: "personagem", from: "Os Simpsons" },
  { name: "Mickey Mouse", date: "11-18", kind: "personagem", from: "Disney" },
  { name: "Hello Kitty", date: "11-01", kind: "personagem", from: "Sanrio" },
  { name: "Barbie", date: "03-09", kind: "personagem", from: "Mattel" },
  { name: "Pernalonga", date: "07-27", kind: "personagem", from: "Looney Tunes" },
  { name: "Snoopy", date: "08-10", kind: "personagem", from: "Peanuts" },
  { name: "Charlie Brown", date: "10-30", kind: "personagem", from: "Peanuts" },
  { name: "Garfield", date: "06-19", kind: "personagem", from: "Garfield" },
  { name: "Bob Esponja", date: "07-14", kind: "personagem", from: "Bob Esponja" },
  { name: "Scooby-Doo", date: "09-13", kind: "personagem", from: "Scooby-Doo" },
  { name: "Popeye", date: "01-17", kind: "personagem", from: "Popeye" },
  { name: "Sonic", date: "06-23", kind: "personagem", from: "Sonic" },
  { name: "Lara Croft", date: "02-14", kind: "personagem", from: "Tomb Raider" },
  { name: "Master Chief", date: "03-07", kind: "personagem", from: "Halo" },
  { name: "Naruto Uzumaki", date: "10-10", kind: "personagem", from: "Naruto" },
  { name: "Sakura Haruno", date: "03-28", kind: "personagem", from: "Naruto" },
  { name: "Monkey D. Luffy", date: "05-05", kind: "personagem", from: "One Piece" },
  { name: "Roronoa Zoro", date: "11-11", kind: "personagem", from: "One Piece" },
  { name: "Nami", date: "07-03", kind: "personagem", from: "One Piece" },
  { name: "Tanjiro Kamado", date: "07-14", kind: "personagem", from: "Demon Slayer" },
  { name: "Eren Yeager", date: "03-30", kind: "personagem", from: "Attack on Titan" },
  { name: "Mikasa Ackerman", date: "02-10", kind: "personagem", from: "Attack on Titan" },
  { name: "Levi Ackerman", date: "12-25", kind: "personagem", from: "Attack on Titan" },
  { name: "Light Yagami", date: "02-28", kind: "personagem", from: "Death Note" },
  { name: "L", date: "10-31", kind: "personagem", from: "Death Note" },
  { name: "Usagi Tsukino", date: "06-30", kind: "personagem", from: "Sailor Moon" },
  { name: "Ash Ketchum", date: "05-22", kind: "personagem", from: "Pokémon" },
  { name: "Fox Mulder", date: "10-13", kind: "personagem", from: "Arquivo X" },
  { name: "Dana Scully", date: "02-23", kind: "personagem", from: "Arquivo X" },
  { name: "Michael Scott", date: "03-15", kind: "personagem", from: "The Office" },
  { name: "Jim Halpert", date: "10-01", kind: "personagem", from: "The Office" },
  { name: "Leslie Knope", date: "01-18", kind: "personagem", from: "Parks and Recreation" },
  { name: "Bruce Banner", date: "12-18", kind: "personagem", from: "Hulk" },
  { name: "Ken Kaneki", date: "12-20", kind: "personagem", from: "Tokyo Ghoul" },
  { name: "Makoto Kino", date: "12-05", kind: "personagem", from: "Sailor Moon" },
  { name: "Kakashi Hatake", date: "09-15", kind: "personagem", from: "Naruto" },
  { name: "Itachi Uchiha", date: "06-09", kind: "personagem", from: "Naruto" },
  { name: "Nico Robin", date: "02-06", kind: "personagem", from: "One Piece" },
  { name: "Usopp", date: "04-01", kind: "personagem", from: "One Piece" },
  { name: "Sanji", date: "03-02", kind: "personagem", from: "One Piece" },
  { name: "Hinata Hyuga", date: "12-27", kind: "personagem", from: "Naruto" },
  { name: "Nezuko Kamado", date: "12-28", kind: "personagem", from: "Demon Slayer" },
];

export type FamousWithSign = Famous & { sign: SignName; month: number; day: number };

function parse(date: string): { month: number; day: number } {
  const [m, d] = date.split("-").map(Number);
  return { month: m, day: d };
}

let cache: FamousWithSign[] | null = null;

/** Lista completa com o signo calculado pela data. */
export function allFamous(): FamousWithSign[] {
  if (!cache) {
    cache = FAMOUS.map((f) => {
      const { month, day } = parse(f.date);
      return { ...f, month, day, sign: signByMonthDay(month, day).sign };
    });
  }
  return cache;
}

export function famousBySign(sign: SignName): FamousWithSign[] {
  return allFamous().filter((f) => f.sign === sign);
}

/** Quem faz aniversário num dia (mês e dia). */
export function birthdaysOn(month: number, day: number): FamousWithSign[] {
  return allFamous().filter((f) => f.month === month && f.day === day);
}

/**
 * Seleção do dia: n nomes do signo, girando de forma determinística
 * conforme o período (YYYY-MM-DD), para o site mudar todo dia.
 */
export function pickForPeriod(sign: SignName, period: string, n = 3): FamousWithSign[] {
  const list = famousBySign(sign);
  if (list.length <= n) return list;
  const dayNumber = Math.floor(Date.parse(`${period}T00:00:00Z`) / 86_400_000);
  const start = ((dayNumber % list.length) + list.length) % list.length;
  return Array.from({ length: n }, (_, i) => list[(start + i * Math.max(1, Math.floor(list.length / n))) % list.length]);
}

/** Frase curta "Sou de Libra como A, B e C". */
export function likeLine(sign: SignName, names: string[]): string {
  if (names.length === 0) return `Sou de ${sign}.`;
  const last = names[names.length - 1];
  const rest = names.slice(0, -1);
  return rest.length ? `Sou de ${sign} como ${rest.join(", ")} e ${last}.` : `Sou de ${sign} como ${last}.`;
}
