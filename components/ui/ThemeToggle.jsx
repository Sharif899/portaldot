import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * ThemeToggle component
 * Sun icon = switch to light mode
 * Moon icon = switch to dark mode
 * Clicking toggles globally via ThemeContext
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width:        "36px",
        height:       "36px",
        borderRadius: "10px",
        border:       "1px solid var(--border)",
        background:   "var(--bg-muted)",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        cursor:       "pointer",
        color:        "var(--text-secondary)",
        transition:   "all 0.2s ease",
        flexShrink:   0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background   = "var(--brand-dim)";
        e.currentTarget.style.color        = "var(--brand)";
        e.currentTarget.style.borderColor  = "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background   = "var(--bg-muted)";
        e.currentTarget.style.color        = "var(--text-secondary)";
        e.currentTarget.style.borderColor  = "var(--border)";
      }}
    >
      {isDark
        ? <Sun  size={16} style={{ transition: "transform 0.3s ease" }} />
        : <Moon size={16} style={{ transition: "transform 0.3s ease" }} />
      }
    </button>
  );
}
