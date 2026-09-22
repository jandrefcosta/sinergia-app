import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        muted: "var(--muted)",
        rule: "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        field: "var(--field)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Iowan Old Style", "Georgia", "serif"],
        ui: ["var(--font-instrument)", "Helvetica Neue", "Arial", "sans-serif"],
        // Glifos dos signos: fontes de símbolos monocromáticas, nunca a de emoji
        glyph: ["Segoe UI Symbol", "Apple Symbols", "Noto Sans Symbols 2", "Noto Sans Symbols", "DejaVu Sans", "sans-serif"],
      },
      maxWidth: {
        page: "640px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fade: {
          "0%": { opacity: "0.35", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        fade: "fade 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
