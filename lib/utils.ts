/**
 * Returns today's date formatted in Brazilian Portuguese.
 * e.g. "Hoje, 26 de Março"
 */
export function getTodayFormatted(): string {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    weekday: undefined,
  });
}

/**
 * Returns a relative or formatted date label in pt-BR.
 */
export function getRelativeDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
