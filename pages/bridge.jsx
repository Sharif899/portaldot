import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import { fetchAllAssets, fetchMyPurchases } from "@/lib/supabase";
import { GitMerge, ArrowRight, CheckCircle2, AlertCircle, Info, ArrowLeftRight, Loader2 } from "lucide-react";

const CHAINS = [
  { id: "portaldot", name: "Portaldot",  logo: "🔮", color: "var(--brand)"        },
  { id: "polkadot",  name: "Polkadot",   logo: "⭕", color: "#E6007A"             },
  { id: "ethereum",  name: "Ethereum",   logo: "⟠",  color: "#627EEA"             },
  { id: "bnb",       name: "BNB Chain",  logo: "🟡", color: "#F0B90B"             },
  { id: "cosmos",    name: "Cosmos",     logo: "⚛️", color: "var(--accent-cyan)"  },
];

const STEPS_LABELS = [
  "Approving token transfer...",
  "Locking tokens on Portaldot...",
  "Minting on destination chain...",
  "Bridge complete!",
];

export default function Bridge() {
  const { isConnected, connect, address } = useWallet();

  const [assets,        setAssets]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [fromChain,     setFromChain]     = useState("portaldot");
  const [toChain,       setToChain]       = useState("polkadot");
  const [amount,        setAmount]        = useState("");

  const [bridging,      setBridging]      = useState(false);
  const [txStep,        setTxStep]        = useState(0); // 0=idle 1-4=steps
  const [showTx,        setShowTx]        = useState(false);

  // ── Load assets from Supabase ──────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    async function loadAssets() {
      setLoading(true);
      try {
        // Get assets this wallet owns (minted)
        const allAssets  = await fetchAllAssets();
        const myMinted   = allAssets.filter(
          (a) => a.owner?.toLowerCase() === address?.toLowerCase()
        );

        // Get assets this wallet has purchased fractions of
        const purchases  = await fetchMyPurchases(address);
        const purchased  = purchases.map((p) => p.assetdot).filter(Boolean);

        // Merge, deduplicate by id
        const seen = new Set();
        const merged = [...myMinted, ...purchased].filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        // Normalise shape for the UI
        const normalised = merged.map((a) => ({
          id:      a.id,
          name:    a.name,
          symbol:  a.name?.slice(0, 4).toUpperCase() || "RWA",
          balance: a.fractions_available ?? a.fractions ?? 0,
        }));

        setAssets(normalised);
        if (normalised.length > 0) setSelectedAsset(normalised[0]);
      } catch (err) {
        console.error("Bridge asset load error:", err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [isConnected, address]);

  const swapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = async () => {
    if (!amount || Number(amount) <= 0) return;
    setShowTx(true);
    setBridging(true);
    setTxStep(0);

    for (let s = 1; s <= 4; s++) {
      await new Promise((r) => setTimeout(r, 1500));
      setTxStep(s);
    }
    setBridging(false);
  };

  const fromChainInfo = CHAINS.find((c) => c.id === fromChain);
  const toChainInfo   = CHAINS.find((c) => c.id === toChain);

  // ── Not connected ─────────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        <Head><title>Bridge — AssetDot</title></Head>
        <Navbar />
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center", padding: "40px" }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h2 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: 0 }}>Connect your wallet</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Connect to bridge assets cross-chain</p>
          <Button variant="primary" size="lg" onClick={connect}>Connect Wallet</Button>
        </div>
      </>
    );
  }

  // ── Main UI ───────────────────────────────────────────────
  return (
    <>
      <Head><title>Bridge — AssetDot</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>
          <div style={{ maxWidth: "560px" }}>

            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Cross-Chain Bridge
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                Move your RWA tokens across chains via Portaldot iBridge
              </p>
            </div>

            {/* Bridge card */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>

              {/* Chain selector row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>From</label>
                  <select value={fromChain} onChange={(e) => setFromChain(e.target.value)} className="input" style={{ cursor: "pointer" }}>
                    {CHAINS.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === toChain}>{c.logo} {c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={swapChains}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", flexShrink: 0, marginTop: "18px", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-dim)"; e.currentTarget.style.color = "var(--brand)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  <ArrowLeftRight size={15} />
                </button>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>To</label>
                  <select value={toChain} onChange={(e) => setToChain(e.target.value)} className="input" style={{ cursor: "pointer" }}>
                    {CHAINS.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === fromChain}>{c.logo} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route display */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: "var(--bg-muted)", marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{fromChainInfo?.logo} {fromChainInfo?.name}</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>iBridge</span>
                <ArrowRight size={14} color="var(--text-muted)" />
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 600 }}>{toChainInfo?.logo} {toChainInfo?.name}</span>
              </div>

              {/* Asset selector */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Select Asset
                </label>

                {loading ? (
                  // Loading state
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", borderRadius: "10px", background: "var(--bg-muted)", border: "1px solid var(--border)" }}>
                    <Loader2 size={16} color="var(--brand)" style={{ animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading your assets from Supabase...</span>
                  </div>
                ) : assets.length === 0 ? (
                  // Empty state
                  <div style={{ padding: "20px", borderRadius: "10px", background: "var(--bg-muted)", border: "1px solid var(--border)", textAlign: "center" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>No assets found for your wallet.</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0" }}>Tokenize an asset first to bridge it.</p>
                  </div>
                ) : (
                  // Asset list
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => { setSelectedAsset(asset); setAmount(""); }}
                        style={{
                          padding: "12px", borderRadius: "10px",
                          border: `1px solid ${selectedAsset?.id === asset.id ? "var(--brand)" : "var(--border)"}`,
                          background: selectedAsset?.id === asset.id ? "var(--brand-dim)" : "var(--bg-muted)",
                          cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{asset.symbol}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>{asset.name}</p>
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "JetBrains Mono, monospace" }}>
                          {asset.balance.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount input — only show when an asset is selected */}
              {selectedAsset && !loading && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Amount (fractions)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input"
                      style={{ paddingRight: "80px" }}
                    />
                    <button
                      onClick={() => setAmount(String(selectedAsset.balance))}
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", fontWeight: 600, color: "var(--brand)", background: "var(--brand-dim)", border: "none", borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}
                    >
                      MAX
                    </button>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                    Balance: {selectedAsset.balance.toLocaleString()} {selectedAsset.symbol}
                  </p>
                </div>
              )}

              {/* Fee info */}
              <div style={{ display: "flex", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "var(--bg-muted)", border: "1px solid var(--border)", marginBottom: "16px" }}>
                <Info size={14} color="var(--brand)" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                  Bridge fee: ~0.1% · Estimated time: 2–5 minutes · Powered by Portaldot iBridge
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                icon={GitMerge}
                onClick={handleBridge}
                disabled={!amount || Number(amount) <= 0 || loading || assets.length === 0}
              >
                Bridge to {toChainInfo?.name}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Bridge progress modal */}
      <Modal
        isOpen={showTx}
        onClose={() => { if (!bridging) { setShowTx(false); setTxStep(0); } }}
        title="Bridging in Progress"
        size="sm"
      >
        <div>
          {STEPS_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const done    = txStep > stepNum;
            const active  = txStep === stepNum;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: done ? "var(--accent-green)" : active ? "var(--brand)" : "var(--bg-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.3s ease",
                }}>
                  {done
                    ? <CheckCircle2 size={14} color="#fff" />
                    : active
                      ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      : <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>{stepNum}</span>
                  }
                </div>
                <span style={{ fontSize: "13px", color: done ? "var(--accent-green)" : active ? "var(--text-primary)" : "var(--text-muted)", fontWeight: active ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            );
          })}

          {txStep === 4 && (
            <Button
              variant="primary"
              fullWidth
              style={{ marginTop: "16px" }}
              onClick={() => { setShowTx(false); setTxStep(0); setAmount(""); }}
            >
              Bridge Another Asset
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
