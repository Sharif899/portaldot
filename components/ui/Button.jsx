import { Loader2 } from "lucide-react";

/**
 * Reusable Button component
 *
 * Props:
 *   variant  — "primary" | "secondary" | "ghost" | "danger"
 *   size     — "sm" | "md" | "lg"
 *   loading  — shows spinner and disables click
 *   icon     — lucide-react icon component (renders left of label)
 *   fullWidth — stretches to container width
 *   onClick, disabled, children — standard button props
 *
 * Usage:
 *   <Button variant="primary" onClick={handleMint} loading={isMinting}>
 *     Mint Token
 *   </Button>
 */
export default function Button({
  children,
  variant   = "primary",
  size      = "md",
  loading   = false,
  icon:  Icon,
  fullWidth = false,
  onClick,
  disabled,
  type      = "button",
  style     = {},
}) {
  const isDisabled = disabled || loading;

  // ── Size tokens ──────────────────────────────────────────────
  const sizes = {
    sm: { padding: "6px 14px",  fontSize: "12px", borderRadius: "8px",  iconSize: 13 },
    md: { padding: "10px 20px", fontSize: "13px", borderRadius: "10px", iconSize: 15 },
    lg: { padding: "13px 28px", fontSize: "15px", borderRadius: "12px", iconSize: 17 },
  };

  // ── Variant styles ────────────────────────────────────────────
  const variants = {
    primary: {
      background:  "var(--brand)",
      color:       "#fff",
      border:      "1px solid transparent",
      hoverBg:     "var(--brand-light)",
      hoverShadow: "var(--glow)",
    },
    secondary: {
      background:  "var(--brand-dim)",
      color:       "var(--brand)",
      border:      "1px solid var(--brand)",
      hoverBg:     "var(--brand)",
      hoverColor:  "#fff",
      hoverShadow: "none",
    },
    ghost: {
      background:  "transparent",
      color:       "var(--text-secondary)",
      border:      "1px solid var(--border)",
      hoverBg:     "var(--bg-muted)",
      hoverColor:  "var(--text-primary)",
      hoverShadow: "none",
    },
    danger: {
      background:  "rgba(255,107,107,0.15)",
      color:       "var(--accent-coral)",
      border:      "1px solid var(--accent-coral)",
      hoverBg:     "var(--accent-coral)",
      hoverColor:  "#fff",
      hoverShadow: "none",
    },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size]       || sizes.md;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "8px",
        padding:        s.padding,
        fontSize:       s.fontSize,
        fontFamily:     "DM Sans, sans-serif",
        fontWeight:     500,
        borderRadius:   s.borderRadius,
        border:         v.border,
        background:     v.background,
        color:          v.color,
        cursor:         isDisabled ? "not-allowed" : "pointer",
        opacity:        isDisabled ? 0.55 : 1,
        transition:     "all 0.2s ease",
        width:          fullWidth ? "100%" : "auto",
        whiteSpace:     "nowrap",
        userSelect:     "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.background = v.hoverBg;
        if (v.hoverColor) e.currentTarget.style.color = v.hoverColor;
        if (v.hoverShadow) e.currentTarget.style.boxShadow = v.hoverShadow;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.background  = v.background;
        e.currentTarget.style.color       = v.color;
        e.currentTarget.style.boxShadow   = "none";
        e.currentTarget.style.transform   = "translateY(0)";
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2
          size={s.iconSize}
          style={{ animation: "spin 1s linear infinite" }}
        />
      )}

      {/* Optional icon (left of label) — hidden when loading */}
      {!loading && Icon && <Icon size={s.iconSize} />}

      {children}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
