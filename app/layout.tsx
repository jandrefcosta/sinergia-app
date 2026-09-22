import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_ID } from "@/lib/analytics";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["opsz"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Sinergia — O céu de hoje, lido para você",
  description:
    "Uma previsão por dia, escrita com calma a partir das posições reais dos planetas. Escolha seu signo e leia em menos de um minuto.",
  keywords: ["horóscopo", "astrologia", "signos", "previsão diária"],
  openGraph: {
    title: "Sinergia — O céu de hoje, lido para você",
    description: "Uma previsão por dia, escrita com calma. Escolha seu signo.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="bg-paper text-ink font-ui antialiased">
        {children}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
