import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "hsl(220,100%,97%)",
          100: "hsl(220,100%,93%)",
          200: "hsl(220,100%,86%)",
          300: "hsl(220,90%,75%)",
          400: "hsl(220,85%,62%)",
          500: "hsl(220,80%,50%)",
          600: "hsl(220,80%,42%)",
          700: "hsl(220,80%,34%)",
          800: "hsl(220,80%,26%)",
          900: "hsl(220,80%,18%)",
        },
        surface: {
          DEFAULT: "hsl(220,20%,10%)",
          100: "hsl(220,20%,13%)",
          200: "hsl(220,20%,16%)",
          300: "hsl(220,18%,20%)",
          400: "hsl(220,15%,26%)",
          border: "hsl(220,15%,22%)",
        },
        danger: {
          DEFAULT: "hsl(0,72%,51%)",
          hover: "hsl(0,72%,44%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-ring": "pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "50%": { opacity: "0.3" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
