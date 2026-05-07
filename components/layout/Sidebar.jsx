import Link from "next/link";
import { useRouter } from "next/router";
import { useWallet } from "@/context/WalletContext";
import {
  LayoutDashboard,
  Plus,
  ShoppingCart,
  GitMerge,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

// ─── Sidebar links ────────────────────────────────────────────
const SIDEBAR_LINKS = [
  {
    href:  "/dashboard",
    label: "Dashboard",
    icon:  LayoutDashboard,
    desc:  "Portfolio overview",
  },
  {
    href:  "/tokenize",
    label: "Tokenize Asset",
    icon:  Plus,
    desc:  "Create new RWA token",
  },
  {
    href:  "/marketplace",
    label: "Marketplace",
    icon:  ShoppingCart,
    desc:  "Buy & sell fractions",
  },
  {
    href:  "/bridge",
    label: "Bridge",
    icon:  GitMerge,
    desc:  "Cross-chain transfer",
  },
  {
    href:  "/privacy",
    label: "ZKP Privacy",
    icon:  ShieldCheck,
    desc:  "Verify asset proofs",
  },
];

export default function Sidebar() {
  const router                              = useRouter();
  const { selectedAccount, shortAddress }  = useWallet();

  const isActive = (href) => router.pathname === href;

  return (
    <aside style={{
      width:        "240px",
      flexShrink:   0,
      background:   "var(--bg-surface)",
      borderRight:  "1px solid var(--border)",
      minHeight:    "calc(100vh - 64px)",
      display:      "flex",
      flexDirection:"column",
      padding:      "20px 12px",
    }}>

      {/* ── Nav links ── */}
      <nav style={{ flex: 1 }}>
        <p style={{
          fontSize:     "11px",
          fontWeight:   600,
          color:        "var(--text-muted)",
          textTransform:"uppercase",
          letterSpacing:"0.08em",
          padding:      "0 12px",
          marginBottom: "8px",
          fontFamily:   "DM Sans, sans-serif",
        }}>
          Navigation
        </p>

        {SIDEBAR_LINKS.map(({ href, label, icon: Icon, desc }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "12px",
                padding:      "10px 12px",
                borderRadius: "10px",
                marginBottom: "2px",
                background:   active ? "var(--brand-dim)" : "transparent",
                border:       active
                  ? "1px solid rgba(97,82,248,0.3)"
                  : "1px solid transparent",
                cursor:       "pointer",
                transition:   "all 0.15s ease",
                position:     "relative",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--bg-muted)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}>

                {/* Icon */}
                <div style={{
                  width:        "32px",
                  height:       "32px",
                  borderRadius: "8px",
                  background:   active ? "var(--brand)" : "var(--bg-muted)",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  flexShrink:   0,
                  transition:   "background 0.15s ease",
                }}>
                  <Icon
                    size={15}
                    color={active ? "#fff" : "var(--text-secondary)"}
                  />
                </div>

                {/* Label + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize:   "13px",
                    fontWeight: active ? 600 : 400,
                    color:      active ? "var(--brand)" : "var(--text-primary)",
                    fontFamily: "DM Sans, sans-serif",
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize:  "11px",
                    color:     "var(--text-muted)",
                    marginTop: "1px",
                  }}>
                    {desc}
                  </div>
                </div>

                {active && (
                  <ChevronRight size={14} color="var(--brand)" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Connected wallet info at bottom ── */}
      {selectedAccount && (
        <div style={{
          marginTop:    "auto",
          padding:      "12px",
          borderRadius: "10px",
          background:   "var(--bg-muted)",
          border:       "1px solid var(--border)",
        }}>
          <p style={{
            fontSize:     "10px",
            fontWeight:   600,
            color:        "var(--text-muted)",
            textTransform:"uppercase",
            letterSpacing:"0.06em",
            marginBottom: "6px",
          }}>
            Connected wallet
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Green dot */}
            <div style={{
              width:        "8px",
              height:       "8px",
              borderRadius: "50%",
              background:   "var(--accent-green)",
              boxShadow:    "0 0 6px var(--accent-green)",
              flexShrink:   0,
            }} />
            <span style={{
              fontSize:   "12px",
              color:      "var(--text-secondary)",
              fontFamily: "JetBrains Mono, monospace",
              overflow:   "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {shortAddress(selectedAccount.address)}
            </span>
          </div>
          {selectedAccount.meta?.name && (
            <p style={{
              fontSize:  "11px",
              color:     "var(--text-muted)",
              marginTop: "4px",
            }}>
              {selectedAccount.meta.name}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
