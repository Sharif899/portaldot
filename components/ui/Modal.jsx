import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Reusable Modal component
 *
 * Props:
 *   isOpen    — controls visibility
 *   onClose   — called when user clicks backdrop or X
 *   title     — modal header text
 *   size      — "sm" | "md" | "lg"
 *   children  — modal body content
 *
 * Usage:
 *   <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Purchase">
 *     <p>Are you sure?</p>
 *   </Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: "400px", md: "520px", lg: "680px" };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          zIndex:     200,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          animation:  "fadeIn 0.15s ease",
        }}
      />

      {/* ── Modal panel ── */}
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     201,
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:    "16px",
        pointerEvents: "none",
      }}>
        <div
          style={{
            width:        "100%",
            maxWidth:     widths[size] || widths.md,
            background:   "var(--bg-surface)",
            border:       "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow:    "var(--shadow-lg)",
            animation:    "slideUp 0.2s ease",
            pointerEvents:"all",
            overflow:     "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "18px 20px",
            borderBottom:   "1px solid var(--border)",
          }}>
            <h3 style={{
              fontFamily:    "Syne, sans-serif",
              fontSize:      "16px",
              fontWeight:    700,
              color:         "var(--text-primary)",
              margin:        0,
              letterSpacing: "-0.01em",
            }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background:   "var(--bg-muted)",
                border:       "1px solid var(--border)",
                borderRadius: "8px",
                padding:      "5px",
                cursor:       "pointer",
                color:        "var(--text-secondary)",
                display:      "flex",
                alignItems:   "center",
                transition:   "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-coral)";
                e.currentTarget.style.color      = "#fff";
                e.currentTarget.style.borderColor= "var(--accent-coral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "var(--bg-muted)";
                e.currentTarget.style.color       = "var(--text-secondary)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px" }}>
            {children}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
}
