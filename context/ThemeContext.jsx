import { createContext, useContext, useEffect, useState } from "react";

// ─── Context ──────────────────────────────────────────────────
const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

// ─── Provider ─────────────────────────────────────────────────
export function ThemeProvider({ children }) {
  // Default to dark — Web3 native feel
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // On mount: read saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("portalrwa-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("portalrwa-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Prevent flash of wrong theme on first render
  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
// Usage in any component: const { isDark, toggleTheme } = useTheme();
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
