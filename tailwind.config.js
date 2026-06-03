/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        postpilot: {
          background: "#FAF9F6",
          surface: "#FFFFFF",
          soft: "#F6F3EE",
          accentSoft: "#F1F5F2",
          text: "#1F1F1F",
          secondary: "#6B6B6B",
          muted: "#9A9A9A",
          border: "#E7E2DA",
          borderSoft: "#EFEAE3",
          accent: "#1A3D2F",
          accentHover: "#123025",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans Thai",
          "IBM Plex Sans Thai",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
