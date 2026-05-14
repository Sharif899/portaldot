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
              ? "radial-gradient(ellipse, rgba(97,82,248,0.2) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(97,82,248,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Real-world asset background images */}
          <div style={{
            position:   "absolute",
            inset:      0,
            overflow:   "hidden",
            pointerEvents: "none",
          }}>
            {/* Left image — building */}
            <div style={{
              position:   "absolute",
              left:       "-2%",
              top:        "5%",
              width:      "28%",
              height:     "90%",
              backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80')",
              backgroundSize:  "cover",
              backgroundPosition: "center",
              borderRadius: "0 16px 16px 0",
              opacity:    isDark ? 0.18 : 0.12,
              maskImage:  "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 70%, transparent 100%)",
            }} />
            {/* Right image — farmland */}
            <div style={{
              position:   "absolute",
              right:      "-2%",
              top:        "5%",
              width:      "28%",
              height:     "90%",
              backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80')",
              backgroundSize:  "cover",
              backgroundPosition: "center",
              borderRadius: "16px 0 0 16px",
              opacity:    isDark ? 0.18 : 0.12,
              maskImage:  "linear-gradient(to left, transparent 0%, black 30%, black 70%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 30%, black 70%, transparent 100%)",
            }} />
          </div>

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
              From Lagos real estate to Accra farmland —<br />
              tokenize, trade, and bridge any asset on Portaldot.
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

        {/* ── Features bento ── */}
        <section style={{ padding: "80px 0", background: "var(--bg-surface)" }}>
          <div className="page-container">
            <div style={{ marginBottom: "28px" }}>
              <p style={{
                fontSize: "11px", fontWeight: 600, color: "var(--brand)",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
              }}>
                Everything in one place
              </p>
              <h2 style={{
                fontFamily: "Syne, sans-serif", fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em",
                maxWidth: "500px",
              }}>
                One platform.<br />Every asset. Every chain.
              </h2>
            </div>

            {/* Bento grid — asymmetric layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: "16px" }}>

              {/* Big card — Tokenize — spans 2 cols */}
              <div style={{
                gridColumn: "1 / 3",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                background: "var(--bg-base)",
                overflow: "hidden",
                position: "relative",
                minHeight: "280px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--brand)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {/* Background image */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=70')",
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: isDark ? 0.15 : 0.1,
                }} />
                <div style={{ position: "relative", padding: "28px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Building2 size={22} color="var(--brand)" />
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>
                    Tokenize Real Assets
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: "420px" }}>
                    Turn property, farmland, commodities, and invoices into on-chain tokens in minutes. Upload your legal document to IPFS, generate a ZKP proof, and mint your token on Portaldot.
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Property", "Commodities", "Invoices"].map(t => (
                      <span key={t} style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px", background: "var(--brand-dim)", color: "var(--brand)", border: "1px solid var(--brand)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ZKP card — tall right */}
              <div style={{
                gridColumn: "3 / 4", gridRow: "1 / 3",
                borderRadius: "20px", border: "1px solid var(--border)",
                background: "var(--bg-base)", padding: "28px",
                position: "relative", overflow: "hidden",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#a855f7"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{
                  position: "absolute", bottom: 0, right: 0, width: "160px", height: "160px",
                  background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(168,85,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <ShieldCheck size={22} color="#a855f7" />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 10px" }}>
                  ZKP Privacy
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 20px" }}>
                  Prove your asset is real without exposing sensitive documents. A cryptographic hash stored on-chain lets investors verify ownership privately.
                </p>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  🔒 SHA-256 hash stored on-chain<br />
                  👁️ Document never exposed<br />
                  ✅ Verifiable by anyone
                </div>
              </div>

              {/* Marketplace card */}
              <div style={{
                borderRadius: "20px", border: "1px solid var(--border)",
                background: "var(--bg-base)", padding: "24px", overflow: "hidden", position: "relative",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-amber)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(245,166,35,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <Package size={20} color="var(--accent-amber)" />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Fractional Trading</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  Buy and sell fractions of real assets via the iSwap DEX. Invest in Lagos real estate from anywhere in the world.
                </p>
              </div>

              {/* Bridge card */}
              <div style={{
                borderRadius: "20px", border: "1px solid var(--border)",
                background: "var(--bg-base)", padding: "24px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent-green)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(0,229,160,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  <GitMerge size={20} color="var(--accent-green)" />
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Cross-Chain Bridge</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  Move your RWA tokens across chains via Portaldot iBridge. Your assets stay liquid on every network.
                </p>
              </div>

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
