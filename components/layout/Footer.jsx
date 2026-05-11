import Link from "next/link";
import Image from "next/image";
import { Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      borderTop:  "1px solid var(--border)",
      background: "var(--bg-surface)",
      padding:    "40px 0 24px",
      marginTop:  "auto",
    }}>
      <div className="page-container">
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap:                 "32px",
          marginBottom:        "32px",
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                <Image src="/portaldot-logo.png" alt="Portaldot Logo" width={28} height={28} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
              <span style={{
                fontFamily:    "Syne, sans-serif",
                fontWeight:    700,
                fontSize:      "15px",
                color:         "var(--text-primary)",
              }}>
                Asset<span style={{ color: "var(--brand)" }}>Dot</span>
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "200px" }}>
              Real-world asset tokenization on the Portaldot Layer 0 chain.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <a href="https://github.com/portaldotVolunteer" target="_blank" rel="noreferrer"
                style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                <Github size={16} />
              </a>
              <a href="https://x.com/PortaldotL0" target="_blank" rel="noreferrer"
                style={{ color: "var(--text-muted)", transition: "color 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Platform
            </p>
            {[
              { href: "/tokenize",    label: "Tokenize Asset" },
              { href: "/marketplace", label: "Marketplace"    },
              { href: "/bridge",      label: "Bridge"         },
              { href: "/privacy",     label: "ZKP Privacy"    },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", transition: "color 0.15s" }}
                  onMouseEnter={(e) => e.target.style.color = "var(--brand)"}
                  onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Portaldot links */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Portaldot
            </p>
            {[
              { href: "https://portaldot-network.gitbook.io/portaldot-network-docs", label: "Whitepaper"  },
              { href: "https://github.com/portaldotVolunteer",                       label: "GitHub"      },
              { href: "https://x.com/PortaldotL0",                                  label: "Twitter / X" },
            ].map(({ href, label }) => (
              <a key={href} href={href} target="_blank" rel="noreferrer"
                style={{ textDecoration: "none", display: "block", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", transition: "color 0.15s" }}
                  onMouseEnter={(e) => e.target.style.color = "var(--brand)"}
                  onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}>
                  {label} ↗
                </span>
              </a>
            ))}
          </div>

          {/* Chain status */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Network
            </p>
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "6px",
              padding:      "6px 10px",
              borderRadius: "8px",
              background:   "var(--bg-muted)",
              border:       "1px solid var(--border)",
              width:        "fit-content",
            }}>
              <div style={{
                width:        "6px",
                height:       "6px",
                borderRadius: "50%",
                background:   "var(--accent-green)",
                boxShadow:    "0 0 6px var(--accent-green)",
              }} />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Portaldot Testnet
              </span>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop:      "1px solid var(--border)",
          paddingTop:     "20px",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          flexWrap:       "wrap",
          gap:            "8px",
        }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © 2025 AssetDot. Built on Portaldot L0.
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Powered by ink! smart contracts + ZKP privacy
          </p>
        </div>
      </div>
    </footer>
  );
}
