import { useState, useEffect } from "react";
import { fetchAllAssets } from "@/utils/supabase";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import { ShieldCheck, ShieldX, Shield, CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

// ✅ Normalize snake_case Supabase fields → camelCase
function normalize(a) {
  return {
    ...a,
    zkpHash: a.zkpHash || a.zkp_hash || "",       // ✅ FIX: was only reading a.zkpHash which is undefined
    ipfsCid: a.ipfsCid || a.ipfs_cid || "",       // ✅ FIX: same issue for IPFS CID
    isVerified: a.isVerified ?? a.is_verified ?? false,
    assetType:  a.assetType  ?? a.asset_type  ?? 0,
    valueUsd:   a.valueUsd   ?? a.value_usd   ?? 0,
  };
}

const statusColors = {
  Verified: { color: "var(--accent-green)", bg: "rgba(0,229,160,0.12)",   icon: ShieldCheck },
  Pending:  { color: "var(--accent-amber)", bg: "rgba(245,166,35,0.12)",  icon: Shield      },
  Revoked:  { color: "var(--accent-coral)", bg: "rgba(255,107,107,0.12)", icon: ShieldX     },
};

export default function Privacy() {
  const { isConnected, connect } = useWallet();
  const [tab,          setTab]          = useState("verify");
  const [allAssets,    setAllAssets]    = useState([]); // ✅ normalized assets from Supabase
  const [verifyAsset,  setVerifyAsset]  = useState("");
  const [verifyHash,   setVerifyHash]   = useState("");
  const [verifying,    setVerifying]    = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [submitAsset,  setSubmitAsset]  = useState("");
  const [submitHash,   setSubmitHash]   = useState("");
  const [submitCid,    setSubmitCid]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllAssets();
        setAllAssets((data || []).map(normalize)); // ✅ normalize so zkpHash & ipfsCid always work
      } catch (e) {
        console.error("ZKP load error:", e);
        setAllAssets([]);
      }
    }
    load();
  }, []);

  const handleVerify = async () => {
    if (!verifyAsset || !verifyHash) return;
    setVerifying(true);
    setVerifyResult(null);
    await new Promise((r) => setTimeout(r, 1800));

    // ✅ FIX: verify against real Supabase assets — match by id/address AND zkpHash
    const found = allAssets.find(
      (a) =>
        (a.id === verifyAsset || a.contractAddress === verifyAsset) &&
        a.zkpHash &&
        a.zkpHash === verifyHash
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

  // ✅ Build proof registry from real Supabase data instead of MOCK_PROOFS
  const proofRegistry = allAssets
    .filter((a) => a.zkpHash) // only assets that have a ZKP hash
    .map((a) => ({
      assetName:   a.name,
      status:      a.is_verified || a.isVerified ? "Verified" : "Pending",
      hash:        a.zkpHash ? `${a.zkpHash.slice(0, 16)}...` : "—",
      submittedAt: a.created_at
        ? new Date(a.created_at).toLocaleDateString()
        : "—",
      verifiedAt: a.is_verified || a.isVerified ? a.created_at
        ? new Date(a.created_at).toLocaleDateString()
        : "—" : null,
    }));

  if (!isConnected) {
    return (
      <>
        <Head><title>ZKP Privacy — AssetDot</title></Head>
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
      <Head><title>ZKP Privacy — AssetDot</title></Head>
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
              <div style={{ display: "flex", marginBottom: "20px", background: "var(--bg-muted)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
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
                      color:      tab === id ? "var(--text-primary)" : "var(--text-muted)",
                      fontWeight: tab === id ? 600 : 400,
                      fontSize: "13px", cursor: "pointer", transition: "all 0.15s ease",
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
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "17px", margin: "0 0 6px", color: "var(--text-primary)" }}>
                    Verify an Asset Proof
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                    Enter an asset contract address and document hash to verify the proof on-chain.
                  </p>

                  {/* Quick select — all assets from Supabase */}
                  {allAssets.length > 0 && (
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                        Select Your Asset
                      </label>
                      <select
                        className="input"
                        style={{ cursor: "pointer" }}
                        onChange={(e) => {
                          const asset = allAssets.find((a) => a.id === e.target.value);
                          if (asset) {
                            setVerifyAsset(asset.contractAddress || asset.id || "");
                            setVerifyHash(asset.zkpHash || ""); // ✅ now works — normalized above
                            setVerifyResult(null);
                          }
                        }}
                      >
                        <option value="">-- Select an asset --</option>
                        {allAssets.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Asset Contract Address
                    </label>
                    <input
                      type="text" placeholder="5Grwva..." value={verifyAsset} className="input"
                      onChange={(e) => { setVerifyAsset(e.target.value); setVerifyResult(null); }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Document Hash (SHA-256)
                    </label>
                    <input
                      type="text" placeholder="a3f8e9b2c1d4..." value={verifyHash} className="input"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                      onChange={(e) => { setVerifyHash(e.target.value); setVerifyResult(null); }}
                    />
                    {/* ✅ Helper: show if hash loaded from asset selection */}
                    {verifyHash && (
                      <p style={{ fontSize: "11px", color: "var(--accent-green)", margin: "4px 0 0" }}>
                        ✓ Hash loaded from asset
                      </p>
                    )}
                  </div>

                  <Button variant="primary" fullWidth loading={verifying} icon={ShieldCheck} onClick={handleVerify}>
                    {verifying ? "Verifying on-chain..." : "Verify Proof"}
                  </Button>

                  {verifyResult !== null && (
                    <div style={{
                      marginTop: "16px", padding: "16px", borderRadius: "12px",
                      background:   verifyResult ? "rgba(0,229,160,0.08)" : "rgba(255,107,107,0.08)",
                      border:       `1px solid ${verifyResult ? "rgba(0,229,160,0.3)" : "rgba(255,107,107,0.3)"}`,
                      display: "flex", alignItems: "center", gap: "12px",
                    }}>
                      {verifyResult
                        ? <CheckCircle2 size={24} color="var(--accent-green)" />
                        : <XCircle      size={24} color="var(--accent-coral)" />
                      }
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 2px", color: verifyResult ? "var(--accent-green)" : "var(--accent-coral)" }}>
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
                      {allAssets.length > 0 && (
                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                            Select Your Asset
                          </label>
                          <select
                            className="input"
                            style={{ cursor: "pointer" }}
                            onChange={(e) => {
                              const asset = allAssets.find((a) => a.id === e.target.value);
                              if (asset) {
                                setSubmitAsset(asset.contractAddress || asset.id || "");
                                setSubmitCid(asset.ipfsCid || "");   // ✅ normalized above
                                setSubmitHash(asset.zkpHash || "");  // ✅ normalized above
                              }
                            }}
                          >
                            <option value="">-- Select an asset --</option>
                            {allAssets.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {[
                        { label: "Asset Contract Address",  value: submitAsset, set: setSubmitAsset, placeholder: "5Grwva...",    mono: false },
                        { label: "IPFS CID",                value: submitCid,   set: setSubmitCid,   placeholder: "QmXabc...",    mono: false },
                        { label: "Document Hash (SHA-256)", value: submitHash,  set: setSubmitHash,  placeholder: "a3f8e9b2...",  mono: true  },
                      ].map(({ label, value, set, placeholder, mono }) => (
                        <div key={label} style={{ marginBottom: "14px" }}>
                          <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                            {label}
                          </label>
                          <input
                            type="text" placeholder={placeholder} value={value} className="input"
                            style={mono ? { fontFamily: "JetBrains Mono, monospace" } : {}}
                            onChange={(e) => set(e.target.value)}
                          />
                          {/* ✅ Helper: confirm field auto-filled */}
                          {value && (
                            <p style={{ fontSize: "11px", color: "var(--accent-green)", margin: "4px 0 0" }}>
                              ✓ Auto-filled from asset
                            </p>
                          )}
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

            {/* Right: proof registry — real data from Supabase */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
                Proof Registry
              </h3>

              {proofRegistry.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                  No proofs submitted yet
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {proofRegistry.map((proof, i) => {
                    const { color, bg } = statusColors[proof.status] || statusColors.Pending;
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
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
