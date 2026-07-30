import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101820",
        route: "#1B4D3E",
        beacon: "#F2A93B",
        paper: "#F6F3EC",
        rust: "#B34B36",
        line: "#D8D2C2",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "route-dashes":
          "repeating-linear-gradient(90deg, currentColor 0, currentColor 10px, transparent 10px, transparent 18px)",
      },
    },
  },
  plugins: [],
};
export default config;
