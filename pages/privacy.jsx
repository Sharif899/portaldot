import { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, ShieldX, Shield, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

// Static marketplace assets (Mr A's original listings)
const STATIC_ASSETS = [
  { id: "1", name: "Lagos Island Apartment Block A", ipfsCid: "QmXabc123", zkpHash: "a3f8e9b2c1d4...7f2e", owner: "5Grwva...utQY" },
  { id: "2", name: "Cocoa Export Batch #2024-11",    ipfsCid: "QmYdef456", zkpHash: "b7c2d5e8f1a3...9c4d", owner: "5FHneW...d1Hi" },
  { id: "3", name: "Abuja Commercial Plaza Unit 4",  ipfsCid: "QmZghi789", zkpHash: "d4e5f6a7b8c9...2e3f", owner: "5DAAnr...hxCz" },
  { id: "4", name: "Palm Oil Futures Q1 2025",       ipfsCid: "QmAjkl012", zkpHash: "c9d3e6f2a8b5...1d7e", owner: "5HGjYb...9eVX" },
  { id: "5", name: "Logistics Invoice — DHL Africa", ipfsCid: "QmBmno345", zkpHash: "e1f2a3b4c5d6...3f4a", owner: "5CiPPu...dCJu" },
  { id: "6", name: "Nairobi Office Complex Floor 3", ipfsCid: "QmCpqr678", zkpHash: "f2a3b4c5d6e7...4a5b", owner: "5Grwva...utQY" },
];

const MOCK_PROOFS = [
  { assetId: "5GrwABC...1234", assetName: "Lagos Apartment Block A — LAGO",    status: "Verified", hash: "a3f8e9b2c1d4...7f2e", submittedAt: "2026-05-01", verifiedAt: "2026-05-02", verifier: "5FHneW...d1Hi" },
  { assetId: "5GrwDEF...5678", assetName: "Abuja Commercial Plaza Unit 5 — ACP5", status: "Verified", hash: "b7c2d5e8f1a3...9c4d", submittedAt: "2026-05-03", verifiedAt: "2026-05-03", verifier: "5FHneW...d1Hi" },
  { assetId: "5GrwGHI...9012", assetName: "Cocoa Export Batch #2026-04",       status: "Verified", hash: "d4e5f6a7b8c9...2e3f", submittedAt: "2026-05-05", verifiedAt: "2026-05-06", verifier: "5FHneW...d1Hi" },
  { assetId: "5GrwJKL...3456", assetName: "Trade Invoice — Zenith Supplies",   status: "Pending",  hash: "c9d3e6f2a8b5...1d7e", submittedAt: "2026-05-09", verifiedAt: null,         verifier: null           },
];

export default function Privacy() {
  const { isConnected, connect } = useWallet();
  const [tab,          setTab]          = useState("verify");
  const [allAssets,    setAllAssets]    = useState([]);  // ALL assets from Supabase + static
  const [verifyAsset,  setVerifyAsset]  = useState("");
  const [verifyHash,   setVerifyHash]   = useState("");
  const [verifying,    setVerifying]    = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [submitAsset,  setSubmitAsset]  = useState("");
  const [submitHash,   setSubmitHash]   = useState("");
  const [submitCid,    setSubmitCid]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  // ── Load ALL assets from Supabase + static listings ──────────
  useEffect(() => {
    const fetchAllAssets = async () => {
      const { data, error } = await supabase
        .from("assetdot")
        .select("id, name, ipfs_cid, owner")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const dbAssets = data.map((row) => ({
          id:      row.id,
          name:    row.name,
          ipfsCid: row.ipfs_cid,
          zkpHash: "",   // DB assets don't store zkpHash yet — left blank for manual entry
          owner:   row.owner,
        }));
        // DB assets first, then static
        setAllAssets([...dbAssets, ...STATIC_ASSETS]);
      } else {
        setAllAssets(STATIC_ASSETS);
      }
    };

    fetchAllAssets();
  }, []);

  const handleVerify = async () => {
    if (!verifyAsset || !verifyHash) return;
    setVerifying(true);
    setVerifyResult(null);
    await new Promise((r) => setTimeout(r, 1800));
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
    Verified: { color: "var(--accent-green)",  bg: "rgba(0,229,160,0.12)",   icon: ShieldCheck },
    Pending:  { color: "var(--accent-amber)",  bg: "rgba(245,166,35,0.12)",  icon: Shield      },
    Revoked:  { color: "var(--accent-coral)",  bg: "rgba(255,107,107,0.12)", icon: ShieldX     },
  };

  if (!isConnected) {
    return (
      <>
        <Head><title>ZKP Privacy — AssetDot</title></Head>
        <Navbar />
        <div style={{
          minHeight: "80vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "16px",
          textAlign: "center", padding: "40px",
        }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h2 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: 0 }}>
            Connect your wallet
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Connect to submit and verify ZKP proofs
          </p>
          <Button variant="primary" size="lg" onClick={connect}>Connect Wallet</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>ZKP Privacy — AssetDot</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>

          {/* Page header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700,
              color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em",
            }}>
              ZKP Privacy
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
              Submit and verify zero-knowledge proofs for real-world assets
            </p>
          </div>

          {/* How it works banner */}
          <div style={{
            display: "flex", gap: "10px", padding: "14px", borderRadius: "12px",
            background: "var(--brand-dim)", border: "1px solid var(--brand)", marginBottom: "24px",
          }}>
            <Info size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>How ZKP works:</strong> A SHA-256 hash
              of a legal document is stored on-chain. This proves the document exists and hasn't
              changed — without revealing its contents. Anyone can verify any listed asset's proof.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

            {/* ── Left: tabs ── */}
            <div>
              {/* Tab switcher */}
              <div style={{
                display: "flex", marginBottom: "20px", background: "var(--bg-muted)",
                borderRadius: "12px", padding: "4px", width: "fit-content",
              }}>
                {[
                  { id: "verify", label: "Verify Proof" },
                  { id: "submit", label: "Submit Proof" },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    style={{
                      padding: "8px 20px", borderRadius: "9px", border: "none",
                      background: tab === id ? "var(--bg-surface)" : "transparent",
                      color: tab === id ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight: tab === id ? 600 : 400, fontSize: "13px",
                      cursor: "pointer", transition: "all 0.15s ease",
                      fontFamily: "DM Sans, sans-serif",
                      boxShadow: tab === id ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Verify tab ── */}
              {tab === "verify" && (
                <div style={{
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "24px",
                }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", margin: "0 0 8px", color: "var(--text-primary)" }}>
                    Verify an Asset Proof
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                    Select any marketplace asset to auto-fill its details, then verify the proof on-chain.
                  </p>

                  {/* Dropdown — ALL marketplace assets */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{
                      fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                      display: "block", marginBottom: "6px",
                    }}>
                      Select Marketplace Asset
                    </label>
                    <select
                      className="input"
                      onChange={(e) => {
                        const asset = allAssets.find((a) => a.id === e.target.value);
                        if (asset) {
                          setVerifyAsset(asset.owner || asset.id);
                          setVerifyHash(asset.zkpHash || "");
                          setVerifyResult(null);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="">-- Select any listed asset --</option>
                      {allAssets.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{
                      fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                      display: "block", marginBottom: "6px",
                    }}>
                      Asset Contract Address
                    </label>
                    <input
                      type="text"
                      placeholder="5Grwva... (auto-filled when you select above)"
                      value={verifyAsset}
                      onChange={(e) => { setVerifyAsset(e.target.value); setVerifyResult(null); }}
                      className="input"
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                      display: "block", marginBottom: "6px",
                    }}>
                      Document Hash (SHA-256)
                    </label>
                    <input
                      type="text"
                      placeholder="a3f8e9b2c1d4... (auto-filled when you select above)"
                      value={verifyHash}
                      onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null); }}
                      className="input"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    />
                  </div>

                  <Button variant="primary" fullWidth loading={verifying} icon={ShieldCheck} onClick={handleVerify}>
                    {verifying ? "Verifying on-chain..." : "Verify Proof"}
                  </Button>

                  {/* Result */}
                  {verifyResult !== null && (
                    <div style={{
                      marginTop: "16px", padding: "16px", borderRadius: "12px",
                      background: verifyResult ? "rgba(0,229,160,0.08)" : "rgba(255,107,107,0.08)",
                      border: `1px solid ${verifyResult ? "rgba(0,229,160,0.3)" : "rgba(255,107,107,0.3)"}`,
                      display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      {verifyResult
                        ? <CheckCircle2 size={24} color="var(--accent-green)" />
                        : <XCircle      size={24} color="var(--accent-coral)" />
                      }
                      <div>
                        <p style={{
                          fontSize: "14px", fontWeight: 700, margin: "0 0 2px",
                          color: verifyResult ? "var(--accent-green)" : "var(--accent-coral)",
                        }}>
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

              {/* ── Submit tab ── */}
              {tab === "submit" && (
                <div style={{
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", padding: "24px",
                }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", margin: "0 0 16px", color: "var(--text-primary)" }}>
                    Submit Asset Proof
                  </h2>

                  {submitted ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <CheckCircle2 size={48} color="var(--accent-green)" style={{ marginBottom: "12px" }} />
                      <h3 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: "0 0 8px" }}>
                        Proof Submitted!
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
                        Your proof is pending verification by an authorized verifier.
                      </p>
                      <Button variant="ghost" onClick={() => { setSubmitted(false); setSubmitAsset(""); setSubmitHash(""); setSubmitCid(""); }}>
                        Submit Another
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Dropdown — ALL marketplace assets */}
                      <div style={{ marginBottom: "14px" }}>
                        <label style={{
                          fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                          display: "block", marginBottom: "6px",
                        }}>
                          Select Asset
                        </label>
                        <select
                          className="input"
                          onChange={(e) => {
                            const asset = allAssets.find((a) => a.id === e.target.value);
                            if (asset) {
                              setSubmitAsset(asset.owner || asset.id);
                              setSubmitCid(asset.ipfsCid || "");
                              setSubmitHash(asset.zkpHash || "");
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <option value="">-- Select any listed asset --</option>
                          {allAssets.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>

                      {[
                        { label: "Asset Contract Address", value: submitAsset, set: setSubmitAsset, placeholder: "5Grwva...",    mono: false },
                        { label: "IPFS CID",               value: submitCid,   set: setSubmitCid,   placeholder: "QmXabc...",    mono: false },
                        { label: "Document Hash (SHA-256)",value: submitHash,  set: setSubmitHash,  placeholder: "a3f8e9b2...", mono: true  },
                      ].map(({ label, value, set, placeholder, mono }) => (
                        <div key={label} style={{ marginBottom: "14px" }}>
                          <label style={{
                            fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)",
                            display: "block", marginBottom: "6px",
                          }}>
                            {label}
                          </label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            className="input"
                            style={mono ? { fontFamily: "JetBrains Mono, monospace" } : {}}
                          />
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

            {/* ── Right: Proof Registry ── */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "14px", padding: "18px",
            }}>
              <h3 style={{
                fontFamily: "Syne, sans-serif", fontSize: "15px", fontWeight: 700,
                color: "var(--text-primary)", margin: "0 0 4px",
              }}>
                Proof Registry
              </h3>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 14px" }}>
                All proofs submitted on-chain — visible to everyone
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {MOCK_PROOFS.map((proof, i) => {
                  const { color, bg } = statusColors[proof.status] || statusColors.Pending;
                  return (
                    <div key={i} style={{
                      padding: "12px", borderRadius: "10px",
                      background: "var(--bg-muted)", border: "1px solid var(--border)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", margin: 0, flex: 1, paddingRight: "8px" }}>
                          {proof.assetName}
                        </p>
                        <span style={{
                          fontSize: "10px", fontWeight: 600, padding: "2px 7px",
                          borderRadius: "20px", background: bg, color, flexShrink: 0,
                        }}>
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
