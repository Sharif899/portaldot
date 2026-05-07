/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable class-based dark mode — toggled by adding "dark" to <html>
  darkMode: "class",

  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      // PortalRWA brand color palette
      colors: {
        portal: {
          50:  "#f0f0ff",
          100: "#e4e3ff",
          200: "#cccaff",
          300: "#a9a5ff",
          400: "#8178ff",
          500: "#6152f8",   // primary brand purple
          600: "#4f3de0",
          700: "#3f2fb8",
          800: "#352a96",
          900: "#2e2778",
          950: "#1a1548",
        },
        accent: {
          green:  "#00e5a0",  // success / active states
          amber:  "#f5a623",  // warning / pending
          coral:  "#ff6b6b",  // danger / high value
          cyan:   "#00d4ff",  // cross-chain / bridge
        },
        dark: {
          base:    "#0a0a0f",  // page background
          surface: "#111118",  // card background
          border:  "#1e1e2e",  // borders
          muted:   "#2a2a3e",  // muted elements
        },
        light: {
          base:    "#f8f8fc",
          surface: "#ffffff",
          border:  "#e8e8f0",
          muted:   "#f0f0f8",
        },
      },

      fontFamily: {
        // Display font — bold, geometric, futuristic
        display: ["'Syne'", "sans-serif"],
        // Body font — clean, readable
        body:    ["'DM Sans'", "sans-serif"],
        // Mono — for addresses and code
        mono:    ["'JetBrains Mono'", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      borderRadius: {
        "4xl": "2rem",
      },

      animation: {
        "fade-in":    "fadeIn 0.4s ease forwards",
        "slide-up":   "slideUp 0.4s ease forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 20px rgba(97, 82, 248, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(97, 82, 248, 0.7)" },
        },
      },

      backgroundImage: {
        "grid-dark":  "linear-gradient(rgba(97,82,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(97,82,248,0.05) 1px, transparent 1px)",
        "grid-light": "linear-gradient(rgba(97,82,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(97,82,248,0.08) 1px, transparent 1px)",
        "hero-dark":  "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(97,82,248,0.3) 0%, transparent 60%)",
        "hero-light": "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(97,82,248,0.15) 0%, transparent 60%)",
      },

      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },

  plugins: [],
};
