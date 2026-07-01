/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: "#071330",        // Azul Marinho
        night: "#0E1F4D",       // Azul Noturno
        galaxy: "#193B7D",      // Azul Galáxia
        nebula: "#5A4FCF",      // Roxo Nebulosa
        star: "#F8D76E",        // Dourado Estrela
        lunar: "#FFFFFF",       // Branco Lunar
        mist: "#E7EAF2"         // Cinza Neblina
      },
      fontFamily: {
        display: ["Marcellus", "serif"],
        body: ["Outfit", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 18px rgba(248,215,110,.35)",
        glass: "0 8px 32px rgba(7,19,48,.45)"
      },
      backdropBlur: { xs: "2px" },
      keyframes: {
        twinkle: { "0%,100%": { opacity: ".25" }, "50%": { opacity: "1" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } }
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
