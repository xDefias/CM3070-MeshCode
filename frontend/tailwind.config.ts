/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const scrollHide = plugin(({ addUtilities }) => {
  addUtilities({
    ".scroll-hide": {
      "scrollbar-width": "none",
      "-ms-overflow-style": "none",
      "&::-webkit-scrollbar": {
        display: "none"
      }
    }
  });
});

const customScrollStyle = plugin(({ addUtilities }) => {
  addUtilities({
    ".custom-scroll": {
      "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px"
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent"
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(150, 150, 150, 0.5)",
        borderRadius: "6px"
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "rgba(0, 255, 0, 0.25)"
      }
    },
    "@media (max-width: 768px)": {
      ".custom-scroll::-webkit-scrollbar": {
        width: "4px",
        height: "4px"
      }
    }
  });
});

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ["Robot Radicals", "sans-serif"],
        secondary: ["OCR A", "sans-serif"],
        tertiary: ["Poppins", "sans-serif"]
      },
      borderWidth: {
        "3": "3px"
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-in-out",
        "fade-out": "fadeOut 0.25s ease-in-out",
        fadeOn: "fadeOn 0.25s ease-in-out",
        fadeOut: "fadeOff 0.25s ease-in-out"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", right: "-100%" },
          "100%": { opacity: "1", right: "0" }
        },
        fadeOut: {
          "0%": { opacity: "1", right: "0" },
          "100%": { opacity: "0", right: "-100%" }
        },
        fadeOn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        fadeOff: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" }
        }
      }
    },
    colors: {
      terminal: "#00ff00",
      transparent: "transparent",
      grey: "#969696",
      black: "#000000",
      white: "#ffffff",
      rose: "#d91273",
      "terminal-dark": "#121612",
      orange: "#ffa800"
    }
  },
  plugins: [scrollHide, customScrollStyle],
  future: {
    hoverOnlyWhenSupported: true
  }
} satisfies Config;
