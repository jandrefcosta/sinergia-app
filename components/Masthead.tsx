"use client";

import { useEffect, useState } from "react";

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Sao_Paulo",
    })
    .replace("-feira", "");
}

export default function Masthead() {
  // Data calculada no cliente para evitar divergência de fuso na hidratação
  const [date, setDate] = useState("");
  useEffect(() => setDate(todayLabel()), []);

  return (
    <header className="flex items-baseline justify-between border-b border-ink pb-3.5">
      <a href="/" className="font-display text-[22px] font-semibold tracking-tight text-ink">
        Siner<em className="font-light italic text-accent">gia</em>
      </a>
      <span className="text-xs uppercase tracking-[0.14em] text-muted" suppressHydrationWarning>
        {date}
      </span>
    </header>
  );
}
