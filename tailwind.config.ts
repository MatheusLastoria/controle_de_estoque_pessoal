import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7F4",
        surface: "#FFFFFF",
        ink: "#16211B",
        muted: "#5B655E",
        line: "#E3E7E0",
        money: "#2F6F4E",
        moneySoft: "#E7F0EA",
        alert: "#B5533C",
        alertSoft: "#F5E7E2",
        plan: "#3D5A80",
        planSoft: "#E7ECF3",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
