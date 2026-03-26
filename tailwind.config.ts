import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy
        "surface": "#161212",
        "surface-dim": "#161212",
        "surface-container-lowest": "#110d0d",
        "surface-container-low": "#1f1b1b",
        "surface-container": "#231f1f",
        "surface-container-high": "#2d2929",
        "surface-container-highest": "#393433",
        "surface-variant": "#393433",
        "surface-bright": "#3d3838",
        "surface-tint": "#ffb3ad",

        // Primary — Rose/Blush
        "primary": "#ffb3ad",
        "primary-container": "#4a0e0e",
        "primary-fixed": "#ffdad7",
        "primary-fixed-dim": "#ffb3ad",
        "on-primary": "#5a1a19",
        "on-primary-container": "#cc726d",
        "on-primary-fixed": "#3d0506",
        "on-primary-fixed-variant": "#77302d",
        "inverse-primary": "#954742",

        // Secondary — Copper
        "secondary": "#ffb77b",
        "secondary-container": "#7a4100",
        "secondary-fixed": "#ffdcc2",
        "secondary-fixed-dim": "#ffb77b",
        "on-secondary": "#4d2700",
        "on-secondary-container": "#ffb270",
        "on-secondary-fixed": "#2e1500",
        "on-secondary-fixed-variant": "#6d3a00",

        // Tertiary — Blush Pink
        "tertiary": "#ffb3b3",
        "tertiary-container": "#441417",
        "tertiary-fixed": "#ffdad9",
        "tertiary-fixed-dim": "#ffb3b3",
        "on-tertiary": "#532022",
        "on-tertiary-container": "#bf7879",
        "on-tertiary-fixed": "#380b0f",
        "on-tertiary-fixed-variant": "#6f3637",

        // Surface text
        "on-surface": "#eae0e0",
        "on-surface-variant": "#dac1bf",
        "on-background": "#eae0e0",
        "inverse-surface": "#eae0e0",
        "inverse-on-surface": "#342f2f",

        // Outline
        "outline": "#a28c8a",
        "outline-variant": "#544341",

        // Background (same as surface for dark mode)
        "background": "#161212",

        // Error
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
      },
      fontFamily: {
        headline: ["var(--font-newsreader)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        label: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      transitionTimingFunction: {
        celestial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        "400": "400ms",
      },
      boxShadow: {
        wine: "0 20px 40px rgba(74, 14, 14, 0.4)",
        "wine-sm": "0 10px 30px rgba(74, 14, 14, 0.3)",
        "wine-inset": "inset 0 0 40px rgba(74, 14, 14, 0.2)",
        "copper-glow": "0 0 15px rgba(184, 115, 51, 0.3)",
        "copper-glow-lg": "0 0 30px rgba(184, 115, 51, 0.4)",
      },
      backgroundImage: {
        "smoldering": "linear-gradient(135deg, #B87333 0%, #4A0E0E 100%)",
        "smoldering-subtle": "linear-gradient(135deg, rgba(184,115,51,0.2) 0%, rgba(74,14,14,0.2) 100%)",
        "wine-to-surface": "linear-gradient(to bottom, #4a0e0e, #161212)",
        "mesh": "radial-gradient(at 0% 0%, rgba(74, 14, 14, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(184, 115, 51, 0.15) 0px, transparent 50%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(184,115,51,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(184,115,51,0.5)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
