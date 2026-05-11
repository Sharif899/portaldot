import Head from "next/head";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import {
  Building2, Package, FileText, ShieldCheck,
  GitMerge, LayoutDashboard, ArrowRight,
  Layers, Zap, Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon:  Building2,
    color: "var(--brand)",
    bg:    "var(--brand-dim)",
    title: "Tokenize Real Assets",
    desc:  "Turn property, commodities, and invoices into on-chain tokens in minutes. Upload documents to IPFS, generate a ZKP proof, mint your asset token.",
  },
  {
    icon:  LayoutDashboard,
    color: "var(--accent-cyan)",
    bg:    "rgba(0,212,255,0.12)",
    title: "Portfolio Dashboard",
    desc:  "Track all your tokenized assets in one place. Monitor values, ownership fractions, verification status, and transaction history.",
  },
  {
    icon:  Package,
    color: "var(--accent-amber)",
    bg:    "rgba(245,166,35,0.12)",
    title: "Fractional Trading",
    desc:  "Buy and sell fractions of real-world assets on the native marketplace. Powered by Portaldot's iSwap DEX integration.",
  },
  {
    icon:  GitMerge,
    color: "var(--accent-green)",
    bg:    "rgba(0,229,160,0.12)",
    title: "Cross-Chain Bridge",
    desc:  "Move your RWA tokens across chains via iBridge. Portaldot's native cross-chain infrastructure keeps your assets liquid everywhere.",
  },
  {
    icon:  ShieldCheck,
    color: "#a855f7",
    bg:    "rgba(168,85,247,0.12)",
    title: "ZKP Privacy",
    desc:  "Prove your asset is real without revealing sensitive documents. Zero-knowledge proofs verify ownership on-chain privately.",
  },
  {
    icon:  Globe,
    color: "var(--accent-coral)",
    bg:    "rgba(255,107,107,0.12)",
    title: "Emerging Market Focus",
    desc:  "Built for Africa and beyond. Unlock liquidity in real estate, agricultural commodities, and trade finance across emerging markets.",
  },
];

const STATS = [
  { value: "3B",    label: "POT Total Supply"       },
  { value: "L0",    label: "Portaldot Layer"         },
  { value: "ZKP",   label: "Privacy Standard"        },
  { value: "ink!",  label: "Smart Contract Language" },
];

export default function Home() {
  const { isConnected, connect } = useWallet();
  const { isDark }               = useTheme();

  return (
    <>
      <Head>
        <title>AssetDot — Real-World Asset Tokenization on Portaldot</title>
        <meta name="description" content="Tokenize, trade, and bridge real-world assets on the Portaldot Layer 0 blockchain." />
      </Head>

      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section style={{
          position:   "relative",
          padding:    "80px 0 100px",
          overflow:   "hidden",
        }}>
          {/* Background glow */}
          <div style={{
            position:   "absolute",
            top:        "-20%",
            left:       "50%",
            transform:  "translateX(-50%)",
            width:      "800px",
            height:     "500px",
            background: isDark
              ? "radial-gradient(ellipse, rgba(97,82,248,0.25) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(97,82,248,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Grid background */}
          <div style={{
            position:           "absolute",
            inset:              0,
            backgroundImage:    isDark
              ? "linear-gradient(rgba(97,82,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(97,82,248,0.06) 1px, transparent 1px)"
              : "linear-gradient(rgba(97,82,248,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(97,82,248,0.08) 1px, transparent 1px)",
            backgroundSize:     "40px 40px",
            pointerEvents:      "none",
            maskImage:          "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
            WebkitMaskImage:    "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
          }} />

          <div className="page-container" style={{ position: "relative", textAlign: "center" }}>


            {/* Headline */}
            <h1 style={{
              fontFamily:    "Syne, sans-serif",
              fontSize:      "clamp(36px, 7vw, 72px)",
              fontWeight:    800,
              lineHeight:    1.08,
              letterSpacing: "-0.03em",
              color:         "var(--text-primary)",
              margin:        "0 auto 20px",
              maxWidth:      "820px",
            }}>
              Real-World Assets,{" "}
              <span style={{
                background: "linear-gradient(135deg, var(--brand) 0%, var(--accent-cyan) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}>
                On-Chain
              </span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize:    "clamp(16px, 2.5vw, 20px)",
              color:       "var(--text-secondary)",
              maxWidth:    "560px",
              margin:      "0 auto 40px",
              lineHeight:  1.6,
              fontFamily:  "DM Sans, sans-serif",
            }}>
              Tokenize property, commodities, and invoices on Portaldot L0.
              Trade fractions, bridge cross-chain, and verify ownership with ZKP privacy.
            </p>

            {/* CTAs */}
            <div style={{
              display:        "flex",
              gap:            "12px",
              justifyContent: "center",
              flexWrap:       "wrap",
            }}>
              {isConnected ? (
                <Link href="/tokenize" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Tokenize an Asset
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" size="lg" onClick={connect} icon={Layers}>
                  Connect Wallet to Start
                </Button>
              )}
              <Link href="/marketplace" style={{ textDecoration: "none" }}>
                <Button variant="ghost" size="lg">
                  Browse Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap:                 "1px",
              maxWidth:            "600px",
              margin:              "60px auto 0",
              background:          "var(--border)",
              borderRadius:        "16px",
              overflow:            "hidden",
              border:              "1px solid var(--border)",
            }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{
                  padding:    "20px 12px",
                  background: "var(--bg-surface)",
                  textAlign:  "center",
                }}>
                  <p style={{
                    fontFamily:    "Syne, sans-serif",
                    fontSize:      "22px",
                    fontWeight:    700,
                    color:         "var(--brand)",
                    margin:        "0 0 4px",
                    letterSpacing: "-0.02em",
                  }}>
                    {value}
                  </p>
                  <p style={{
                    fontSize: "11px",
                    color:    "var(--text-muted)",
                    margin:   0,
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section style={{ padding: "80px 0", background: "var(--bg-surface)" }}>
          <div className="page-container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{
                fontSize:      "11px",
                fontWeight:    600,
                color:         "var(--brand)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom:  "10px",
              }}>
                Everything in one place
              </p>
              <h2 style={{
                fontFamily:    "Syne, sans-serif",
                fontSize:      "clamp(28px, 4vw, 40px)",
                fontWeight:    700,
                color:         "var(--text-primary)",
                margin:        0,
                letterSpacing: "-0.02em",
              }}>
                The complete RWA stack
              </h2>
            </div>

            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap:                 "20px",
            }}>
              {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
                <div
                  key={title}
                  style={{
                    padding:      "24px",
                    borderRadius: "16px",
                    border:       "1px solid var(--border)",
                    background:   "var(--bg-base)",
                    transition:   "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.transform   = "translateY(-2px)";
                    e.currentTarget.style.boxShadow   = `0 8px 32px ${color}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform   = "translateY(0)";
                    e.currentTarget.style.boxShadow   = "none";
                  }}
                >
                  <div style={{
                    width:        "44px",
                    height:       "44px",
                    borderRadius: "12px",
                    background:   bg,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <h3 style={{
                    fontFamily:    "Syne, sans-serif",
                    fontSize:      "16px",
                    fontWeight:    700,
                    color:         "var(--text-primary)",
                    margin:        "0 0 8px",
                    letterSpacing: "-0.01em",
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontSize:   "13px",
                    color:      "var(--text-secondary)",
                    lineHeight: 1.7,
                    margin:     0,
                  }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section style={{ padding: "80px 0" }}>
          <div className="page-container">
            <div style={{
              borderRadius: "24px",
              padding:      "60px 40px",
              textAlign:    "center",
              background:   isDark
                ? "linear-gradient(135deg, #1a1528 0%, #0d1f1a 100%)"
                : "linear-gradient(135deg, #f0f0ff 0%, #e8fff8 100%)",
              border:       "1px solid var(--border)",
              position:     "relative",
              overflow:     "hidden",
            }}>
              <div style={{
                position:   "absolute",
                inset:      0,
                background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(97,82,248,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative" }}>
                <h2 style={{
                  fontFamily:    "Syne, sans-serif",
                  fontSize:      "clamp(24px, 4vw, 36px)",
                  fontWeight:    700,
                  color:         "var(--text-primary)",
                  margin:        "0 0 12px",
                  letterSpacing: "-0.02em",
                }}>
                  Ready to tokenize your first asset?
                </h2>
                <p style={{
                  fontSize:    "15px",
                  color:       "var(--text-secondary)",
                  margin:      "0 0 28px",
                  maxWidth:    "440px",
                  marginLeft:  "auto",
                  marginRight: "auto",
                }}>
                  Connect your Polkadot wallet and go from asset owner to on-chain token in under 5 minutes.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/tokenize" style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="lg" icon={ArrowRight}>
                      Start Tokenizing
                    </Button>
                  </Link>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <Button variant="ghost" size="lg">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
