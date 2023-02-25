const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      urbanist: ["var(--font-urbanist)", ...defaultTheme.fontFamily.sans],
    },
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "transparent",
      current: "currentColor",
      gray: {
        100: "#F3F3F3",
        800: "#25292B",
        900: "#1E1E1E",
      },
      beige: "#F0E7B5",
      deepblue: "#1B5E73",
    },
    extend: {
      keyframes: {
        "slide-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
