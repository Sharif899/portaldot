import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/context/ThemeContext";
import { useWallet } from "@/context/WalletContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import WalletButton from "@/components/ui/WalletButton";
import { Menu, X, Layers } from "lucide-react";

// ─── Nav links ────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/",           label: "Home"        },
  { href: "/tokenize",   label: "Tokenize"    },
  { href: "/dashboard",  label: "Dashboard"   },
  { href: "/marketplace",label: "Marketplace" },
  { href: "/bridge",     label: "Bridge"      },
  { href: "/privacy",    label: "ZKP Privacy" },
];

export default function Navbar() {
  const router          = useRouter();
  const { isDark }      = useTheme();
  const { isConnected } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  return (
    <>
      <nav
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          right:           0,
          zIndex:          100,
          background:      isDark
            ? "rgba(10,10,15,0.85)"
            : "rgba(248,248,252,0.85)",
          backdropFilter:  "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom:    `1px solid ${isDark ? "#1e1e2e" : "#e8e8f0"}`,
          transition:      "background 0.3s ease",
        }}
      >
        <div className="page-container">
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            height:         "64px",
          }}>

            {/* ── Logo ── */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width:        "36px",
                  height:       "36px",
                  borderRadius: "10px",
                  background:   "linear-gradient(135deg, #6152f8 0%, #00d4ff 100%)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  boxShadow:    "0 0 20px rgba(97,82,248,0.4)",
                }}>
                  <Layers size={18} color="#fff" />
                </div>
                <div>
                  <span style={{
                    fontFamily:  "Syne, sans-serif",
                    fontWeight:  700,
                    fontSize:    "18px",
                    color:       "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}>
                    Portal<span style={{ color: "var(--brand)" }}>RWA</span>
                  </span>
                  <div style={{
                    fontSize:    "10px",
                    color:       "var(--text-muted)",
                    letterSpacing: "0.08em",
                    marginTop:   "-2px",
                    fontFamily:  "DM Sans, sans-serif",
                  }}>
                    ON PORTALDOT
                  </div>
                </div>
              </div>
            </Link>

            {/* ── Desktop nav links ── */}
            <div style={{
              display:    "flex",
              alignItems: "center",
              gap:        "4px",
            }} className="hidden-mobile">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <span style={{
                    padding:      "6px 14px",
                    borderRadius: "8px",
                    fontSize:     "13px",
                    fontWeight:   isActive(href) ? 600 : 400,
                    color:        isActive(href)
                      ? "var(--brand)"
                      : "var(--text-secondary)",
                    background:   isActive(href)
                      ? "var(--brand-dim)"
                      : "transparent",
                    transition:   "all 0.15s ease",
                    cursor:       "pointer",
                    display:      "inline-block",
                    fontFamily:   "DM Sans, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(href)) {
                      e.target.style.color      = "var(--text-primary)";
                      e.target.style.background = "var(--bg-muted)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(href)) {
                      e.target.style.color      = "var(--text-secondary)";
                      e.target.style.background = "transparent";
                    }
                  }}>
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            {/* ── Right side: theme toggle + wallet ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ThemeToggle />
              <WalletButton />

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="show-mobile"
                style={{
                  background:   "var(--bg-muted)",
                  border:       "1px solid var(--border)",
                  borderRadius: "8px",
                  padding:      "6px",
                  cursor:       "pointer",
                  color:        "var(--text-secondary)",
                  display:      "flex",
                  alignItems:   "center",
                }}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {menuOpen && (
          <div style={{
            borderTop:   `1px solid ${isDark ? "#1e1e2e" : "#e8e8f0"}`,
            background:  isDark ? "#0a0a0f" : "#f8f8fc",
            padding:     "12px 16px",
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding:      "10px 12px",
                    borderRadius: "8px",
                    fontSize:     "14px",
                    fontWeight:   isActive(href) ? 600 : 400,
                    color:        isActive(href)
                      ? "var(--brand)"
                      : "var(--text-primary)",
                    background:   isActive(href) ? "var(--brand-dim)" : "transparent",
                    marginBottom: "2px",
                    cursor:       "pointer",
                  }}
                >
                  {label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Spacer so page content doesn't hide behind fixed navbar */}
      <div style={{ height: "64px" }} />

      <style jsx global>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile   { display: none !important; }
        }
      `}</style>
    </>
  );
}
