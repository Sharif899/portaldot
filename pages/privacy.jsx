import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, ShieldX, Shield, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

const MOCK_PROOFS = [
  { assetId: "5GrwABC...1234", assetName: "Lagos Island Apartment Block A", status: "Verified", hash: "a3f8e9b2c1d4...7f2e", submittedAt: "2025-01-15", verifiedAt: "2025-01-16", verifier: "5FHneW...d1Hi" },
  { assetId: "5GrwDEF...5678", assetName: "Cocoa Export Batch #2024-11",    status: "Verified", hash: "b7c2d5e8f1a3...9c4d", submittedAt: "2025-01-14", verifiedAt: "2025-01-14", verifier: "5FHneW...d1Hi" },
  { assetId: "5GrwGHI...9012", assetName: "Trade Invoice — Zenith Supplies",status: "Pending",  hash: "c9d3e6f2a8b5...1d7e", submittedAt: "2025-01-17", verifiedAt: null,          verifier: null           },
];

export default function Privacy() {
  const { isConnected, connect } = useWallet();
  const [tab,          setTab]          = useState("verify");
  const [verifyAsset,  setVerifyAsset]  = useState("");
  const [verifyHash,   setVerifyHash]   = useState("");
  const [myAssets,     setMyAssets]     = useState([]);

  // Load user assets from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("portalrwa-assets") || "[]");
      setMyAssets(saved);
    } catch(e) { setMyAssets([]); }
  }, []);
  const [verifying,    setVerifying]    = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // null | true | false
  const [submitAsset,  setSubmitAsset]  = useState("");
  const [submitHash,   setSubmitHash]   = useState("");
  const [submitCid,    setSubmitCid]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const handleVerify = async () => {
    if (!verifyAsset || !verifyHash) return;
    setVerifying(true);
    setVerifyResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    // Simulate: match against mock proof
    const found = MOCK_PROOFS.find(
      (p) => p.status === "Verified" && verifyHash.length > 10
    );
    setVerifyResult(!!found);
    setVerifying(false);
  };

  const handleSubmit = async () => {
    if (!submitAsset || !submitHash || !submitCid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  const statusColors = {
    Verified: { color: "var(--accent-green)", bg: "rgba(0,229,160,0.12)", icon: ShieldCheck },
    Pending:  { color: "var(--accent-amber)", bg: "rgba(245,166,35,0.12)", icon: Shield      },
    Revoked:  { color: "var(--accent-coral)", bg: "rgba(255,107,107,0.12)", icon: ShieldX   },
  };

  if (!isConnected) {
    return (
      <>
        <Head><title>ZKP Privacy — PortalRWA</title></Head>
        <Navbar />
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center", padding: "40px" }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h2 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: 0 }}>Connect your wallet</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Connect to submit and verify ZKP proofs</p>
          <Button variant="primary" size="lg" onClick={connect}>Connect Wallet</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>ZKP Privacy — PortalRWA</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>

          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              ZKP Privacy
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
              Submit and verify zero-knowledge proofs for your real-world assets
            </p>
          </div>

          {/* How it works banner */}
          <div style={{ display: "flex", gap: "10px", padding: "14px", borderRadius: "12px", background: "var(--brand-dim)", border: "1px solid var(--brand)", marginBottom: "24px" }}>
            <Info size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>How ZKP works:</strong> A SHA-256 hash of your legal document is stored on-chain.
              This proves the document exists and hasn't changed — without revealing its contents.
              Investors verify the hash before buying fractions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
            {/* Left: tabs */}
            <div>
              {/* Tab switcher */}
              <div style={{ display: "flex", gap: "0", marginBottom: "20px", background: "var(--bg-muted)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
                {[
                  { id: "verify", label: "Verify Proof"  },
                  { id: "submit", label: "Submit Proof"  },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    style={{
                      padding:      "8px 20px",
                      borderRadius: "9px",
                      border:       "none",
                      background:   tab === id ? "var(--bg-surface)" : "transparent",
                      color:        tab === id ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight:   tab === id ? 600 : 400,
                      fontSize:     "13px",
                      cursor:       "pointer",
                      transition:   "all 0.15s ease",
                      fontFamily:   "DM Sans, sans-serif",
                      boxShadow:    tab === id ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Verify tab */}
              {tab === "verify" && (
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", margin: "0 0 16px", color: "var(--text-primary)" }}>
                    Verify an Asset Proof
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                    Enter an asset contract address and document hash to verify the proof on-chain.
                  </p>

                  {/* Quick select from user's assets */}
                  {myAssets.length > 0 && (
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Select Your Asset</label>
                      <select
                        className="input"
                        onChange={(e) => {
                          const asset = myAssets.find(a => a.id === e.target.value);
                          if (asset) {
                            setVerifyAsset(asset.contractAddress || asset.id);
                            setVerifyHash(asset.zkpHash || "");
                            setVerifyResult(null);
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <option value="">-- Select an asset --</option>
                        {myAssets.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Asset Contract Address</label>
                    <input type="text" placeholder="5Grwva..." value={verifyAsset} onChange={(e) => { setVerifyAsset(e.target.value); setVerifyResult(null); }} className="input" />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Document Hash (SHA-256)</label>
                    <input type="text" placeholder="a3f8e9b2c1d4..." value={verifyHash} onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null); }} className="input" style={{ fontFamily: "JetBrains Mono, monospace" }} />
                  </div>

                  <Button variant="primary" fullWidth loading={verifying} icon={ShieldCheck} onClick={handleVerify}>
                    {verifying ? "Verifying on-chain..." : "Verify Proof"}
                  </Button>

                  {/* Result */}
                  {verifyResult !== null && (
                    <div style={{
                      marginTop:    "16px",
                      padding:      "16px",
                      borderRadius: "12px",
                      background:   verifyResult ? "rgba(0,229,160,0.08)" : "rgba(255,107,107,0.08)",
                      border:       `1px solid ${verifyResult ? "rgba(0,229,160,0.3)" : "rgba(255,107,107,0.3)"}`,
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "12px",
                    }}>
                      {verifyResult
                        ? <CheckCircle2 size={24} color="var(--accent-green)" />
                        : <XCircle      size={24} color="var(--accent-coral)" />
                      }
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: verifyResult ? "var(--accent-green)" : "var(--accent-coral)", margin: "0 0 2px" }}>
                          {verifyResult ? "✓ Proof Verified" : "✗ Proof Invalid"}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>
                          {verifyResult
                            ? "This asset has a valid ZKP proof. The document hash matches the on-chain record."
                            : "No valid proof found for this asset/hash combination."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit tab */}
              {tab === "submit" && (
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", margin: "0 0 16px", color: "var(--text-primary)" }}>
                    Submit Asset Proof
                  </h2>

                  {submitted ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <CheckCircle2 size={48} color="var(--accent-green)" style={{ marginBottom: "12px" }} />
                      <h3 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: "0 0 8px" }}>Proof Submitted!</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
                        Your proof is pending verification by an authorized verifier.
                      </p>
                      <Button variant="ghost" onClick={() => { setSubmitted(false); setSubmitAsset(""); setSubmitHash(""); setSubmitCid(""); }}>
                        Submit Another
                      </Button>
                    </div>
                  ) : (
                    <>
                      {[
                        { label: "Asset Contract Address", key: "asset", value: submitAsset, set: setSubmitAsset, placeholder: "5Grwva...", mono: false },
                        { label: "IPFS CID",               key: "cid",   value: submitCid,   set: setSubmitCid,   placeholder: "QmXabc...", mono: false },
                        { label: "Document Hash (SHA-256)",key: "hash",  value: submitHash,  set: setSubmitHash,  placeholder: "a3f8e9b2...", mono: true  },
                      ].map(({ label, value, set, placeholder, mono }) => (
                        <div key={label} style={{ marginBottom: "14px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>{label}</label>
                          <input type="text" placeholder={placeholder} value={value} onChange={(e) => set(e.target.value)} className="input" style={mono ? { fontFamily: "JetBrains Mono, monospace" } : {}} />
                        </div>
                      ))}
                      <Button variant="primary" fullWidth loading={submitting} icon={Shield} onClick={handleSubmit} style={{ marginTop: "8px" }}>
                        {submitting ? "Submitting on-chain..." : "Submit Proof"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: proof registry */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
                Proof Registry
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {MOCK_PROOFS.map((proof, i) => {
                  const { color, bg, icon: StatusIcon } = statusColors[proof.status] || statusColors.Pending;
                  return (
                    <div key={i} style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-muted)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", margin: 0, flex: 1, paddingRight: "8px" }}>
                          {proof.assetName}
                        </p>
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "20px", background: bg, color, flexShrink: 0 }}>
                          {proof.status}
                        </span>
                      </div>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "0 0 2px", fontFamily: "JetBrains Mono, monospace" }}>
                        Hash: {proof.hash}
                      </p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>
                        Submitted: {proof.submittedAt}
                        {proof.verifiedAt && ` · Verified: ${proof.verifiedAt}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
