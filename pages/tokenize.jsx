import { useState } from "react";
import Head from "next/head";
import { saveAsset } from "@/utils/supabase";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import {
  Building2, Package, FileText,
  Upload, ShieldCheck, CheckCircle2,
  AlertCircle, Info,
} from "lucide-react";

const ASSET_TYPES = [
  { value: 0, label: "Property",  icon: Building2, desc: "Real estate, land, buildings",          color: "var(--brand)"       },
  { value: 1, label: "Commodity", icon: Package,   desc: "Gold, oil, grain, agricultural assets", color: "var(--accent-amber)" },
  { value: 2, label: "Invoice",   icon: FileText,  desc: "Trade receivables, unpaid invoices",    color: "var(--accent-green)" },
];

// Steps in the tokenization flow
const STEPS = [
  { id: 1, label: "Asset Details"  },
  { id: 2, label: "Upload Document"},
  { id: 3, label: "ZKP Proof"      },
  { id: 4, label: "Mint Token"     },
];

export default function Tokenize() {
  const { isConnected, connect, selectedAccount } = useWallet();

  // Form state
  const [step,         setStep]        = useState(1);
  const [assetType,    setAssetType]   = useState(0);
  const [assetName,    setAssetName]   = useState("");
  const [assetValue,   setAssetValue]  = useState("");
  const [location,     setLocation]    = useState("");
  const [symbol,       setSymbol]      = useState("");
  const [fractions,    setFractions]   = useState("1000000");
  const [file,         setFile]        = useState(null);
  const [ipfsCid,      setIpfsCid]     = useState("");
  const [zkpHash,      setZkpHash]     = useState("");
  const [uploading,    setUploading]   = useState(false);
  const [minting,      setMinting]     = useState(false);
  const [showSuccess,  setShowSuccess] = useState(false);
  const [txHash,       setTxHash]      = useState("");
  const [errors,       setErrors]      = useState({});

  // ── Step 1 validation ────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!assetName.trim())        e.assetName  = "Asset name is required";
    if (!assetValue || Number(assetValue) <= 0) e.assetValue = "Enter a valid USD value";
    if (!location.trim())         e.location   = "Location is required";
    if (!symbol.trim())           e.symbol     = "Token symbol is required";
    if (symbol.length > 5)        e.symbol     = "Symbol must be 5 chars or less";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Simulate IPFS upload ─────────────────────────────────────
  const handleFileUpload = async () => {
    if (!file) { setErrors({ file: "Please select a document to upload" }); return; }
    setUploading(true);
    setErrors({});
    // Simulate upload delay — replace with real Pinata API call
    await new Promise((r) => setTimeout(r, 2000));
    const mockCid = "QmX" + Math.random().toString(36).slice(2, 18).toUpperCase();
    setIpfsCid(mockCid);
    setUploading(false);
    setStep(3);
  };

  // ── Simulate ZKP hash generation ─────────────────────────────
  const handleGenerateZKP = async () => {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1500));
    // In production: generate real SHA-256 hash of the document
    const mockHash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setZkpHash(mockHash);
    setUploading(false);
    setStep(4);
  };

  // ── Simulate contract deployment ─────────────────────────────
  const handleMint = async () => {
    setMinting(true);
    await new Promise((r) => setTimeout(r, 2500));
    const mockTx = "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    // Save new asset to localStorage so dashboard shows it
    const newAsset = {
      id:                 Date.now().toString(),
      name:               assetName,
      symbol:             symbol,
      assetType:          assetType,
      valueUsd:           Number(assetValue),
      fractions:          Number(fractions),
      fractionsAvailable: Number(fractions),
      pricePerFraction:   0.35,
      owner:              selectedAccount?.address || 'anonymous',
      ipfsCid:            ipfsCid,
      zkpHash:            zkpHash,
      isVerified:         false,
      status:             "Active",
      location:           location,
      createdAt:          new Date().toISOString(),
      txHash:             mockTx,
    };
    try {
      // Save to localStorage for immediate personal view
      const existing = JSON.parse(localStorage.getItem("assetdot-assets") || "[]");
      existing.unshift(newAsset);
      localStorage.setItem("assetdot-assets", JSON.stringify(existing));
    } catch(e) { console.error("localStorage error:", e); }

    // Save to Supabase so ALL users can see it on marketplace
    try {
      await saveAsset(newAsset);
    } catch(e) { console.error("Supabase save error:", e); }

    setTxHash(mockTx);
    setMinting(false);
    setShowSuccess(true);
  };

  // ── Not connected state ───────────────────────────────────────
  if (!isConnected) {
    return (
      <>
        <Head><title>Tokenize Asset — AssetDot</title></Head>
        <Navbar />
        <div style={{
          minHeight:      "80vh",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "16px",
          padding:        "40px",
          textAlign:      "center",
        }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h2 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: 0 }}>
            Wallet not connected
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Connect your Polkadot wallet to tokenize assets
          </p>
          <Button variant="primary" size="lg" onClick={connect}>
            Connect Wallet
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Tokenize Asset — AssetDot</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{
              fontFamily:    "Syne, sans-serif",
              fontSize:      "28px",
              fontWeight:    700,
              color:         "var(--text-primary)",
              margin:        "0 0 6px",
              letterSpacing: "-0.02em",
            }}>
              Tokenize an Asset
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
              Turn a real-world asset into an on-chain token in 4 steps
            </p>
          </div>

          {/* Progress steps */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            marginBottom: "32px",
            gap:          "0",
          }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width:        "32px",
                    height:       "32px",
                    borderRadius: "50%",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    fontSize:     "13px",
                    fontWeight:   600,
                    background:   step > s.id
                      ? "var(--accent-green)"
                      : step === s.id
                        ? "var(--brand)"
                        : "var(--bg-muted)",
                    color:        step >= s.id ? "#fff" : "var(--text-muted)",
                    border:       step === s.id ? "2px solid var(--brand-light)" : "2px solid transparent",
                    transition:   "all 0.3s ease",
                  }}>
                    {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                  </div>
                  <span style={{
                    fontSize:   "11px",
                    fontWeight: step === s.id ? 600 : 400,
                    color:      step === s.id ? "var(--brand)" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex:       1,
                    height:     "2px",
                    background: step > s.id ? "var(--accent-green)" : "var(--border)",
                    marginBottom: "22px",
                    transition: "background 0.3s ease",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: Asset Details ── */}
          {step === 1 && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{
                background:   "var(--bg-surface)",
                border:       "1px solid var(--border)",
                borderRadius: "16px",
                padding:      "24px",
              }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", margin: "0 0 20px", color: "var(--text-primary)" }}>
                  Asset Details
                </h2>

                {/* Asset type selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                    Asset Type
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {ASSET_TYPES.map(({ value, label, icon: Icon, desc, color }) => (
                      <div
                        key={value}
                        onClick={() => setAssetType(value)}
                        style={{
                          padding:      "12px",
                          borderRadius: "12px",
                          border:       `2px solid ${assetType === value ? color : "var(--border)"}`,
                          background:   assetType === value ? `${color}15` : "var(--bg-muted)",
                          cursor:       "pointer",
                          textAlign:    "center",
                          transition:   "all 0.15s ease",
                        }}
                      >
                        <Icon size={20} color={assetType === value ? color : "var(--text-muted)"} style={{ marginBottom: "6px" }} />
                        <p style={{ fontSize: "12px", fontWeight: 600, color: assetType === value ? color : "var(--text-primary)", margin: "0 0 2px" }}>{label}</p>
                        <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                {[
                  { label: "Asset Name",       key: "assetName",  value: assetName,  set: setAssetName,  placeholder: "e.g. Lagos Island Apartment Block A",  type: "text"   },
                  { label: "Asset Value (USD)", key: "assetValue", value: assetValue, set: setAssetValue, placeholder: "e.g. 250000",                           type: "number" },
                  { label: "Location",          key: "location",   value: location,   set: setLocation,   placeholder: "e.g. Lagos, Nigeria",                   type: "text"   },
                ].map(({ label, key, value, set, placeholder, type }) => (
                  <div key={key} style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      {label}
                    </label>
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => { set(e.target.value); setErrors((prev) => ({ ...prev, [key]: "" })); }}
                      placeholder={placeholder}
                      className="input"
                    />
                    {errors[key] && (
                      <p style={{ fontSize: "12px", color: "var(--accent-coral)", margin: "4px 0 0" }}>
                        {errors[key]}
                      </p>
                    )}
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Token Symbol
                    </label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => { setSymbol(e.target.value.toUpperCase().slice(0, 5)); setErrors((p) => ({ ...p, symbol: "" })); }}
                      placeholder="e.g. LIAB"
                      className="input"
                    />
                    {errors.symbol && <p style={{ fontSize: "12px", color: "var(--accent-coral)", margin: "4px 0 0" }}>{errors.symbol}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                      Total Fractions
                    </label>
                    <input
                      type="number"
                      value={fractions}
                      onChange={(e) => setFractions(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <Button variant="primary" fullWidth onClick={() => { if (validateStep1()) setStep(2); }} icon={ArrowRight}>
                  Continue to Document Upload
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Upload Document ── */}
          {step === 2 && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", margin: "0 0 8px", color: "var(--text-primary)" }}>
                  Upload Legal Document
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                  Upload your asset's legal document (title deed, certificate, invoice). It will be stored encrypted on IPFS.
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => document.getElementById("fileInput").click()}
                  style={{
                    border:        "2px dashed var(--border)",
                    borderRadius:  "12px",
                    padding:       "40px",
                    textAlign:     "center",
                    cursor:        "pointer",
                    transition:    "all 0.2s ease",
                    marginBottom:  "16px",
                    background:    file ? "var(--brand-dim)" : "var(--bg-muted)",
                    borderColor:   file ? "var(--brand)" : "var(--border)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                  onMouseLeave={(e) => { if (!file) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  <input
                    id="fileInput"
                    type="file"
                    accept=".pdf,.jpg,.png,.doc,.docx"
                    style={{ display: "none" }}
                    onChange={(e) => { setFile(e.target.files[0]); setErrors({}); }}
                  />
                  <Upload size={32} color={file ? "var(--brand)" : "var(--text-muted)"} style={{ marginBottom: "10px" }} />
                  {file ? (
                    <>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--brand)", margin: "0 0 4px" }}>{file.name}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                        {(file.size / 1024).toFixed(1)} KB — click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 4px" }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                        PDF, JPG, PNG, DOC up to 10MB
                      </p>
                    </>
                  )}
                </div>

                {errors.file && <p style={{ fontSize: "12px", color: "var(--accent-coral)", marginBottom: "12px" }}>{errors.file}</p>}

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" fullWidth loading={uploading} icon={Upload} onClick={handleFileUpload}>
                    {uploading ? "Uploading to IPFS..." : "Upload to IPFS"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: ZKP Proof ── */}
          {step === 3 && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", margin: "0 0 8px", color: "var(--text-primary)" }}>
                  Generate ZKP Proof
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 20px" }}>
                  A zero-knowledge proof hash will be generated from your document.
                  This proves the document exists on-chain without revealing its contents.
                </p>

                {/* IPFS success */}
                <div style={{
                  padding:      "14px",
                  borderRadius: "10px",
                  background:   "rgba(0,229,160,0.08)",
                  border:       "1px solid rgba(0,229,160,0.3)",
                  marginBottom: "16px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                }}>
                  <CheckCircle2 size={18} color="var(--accent-green)" />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-green)", margin: 0 }}>Document uploaded to IPFS</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
                      CID: {ipfsCid}
                    </p>
                  </div>
                </div>

                {/* Info box */}
                <div style={{
                  padding:      "14px",
                  borderRadius: "10px",
                  background:   "var(--bg-muted)",
                  border:       "1px solid var(--border)",
                  marginBottom: "20px",
                  display:      "flex",
                  gap:          "10px",
                }}>
                  <Info size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    The ZKP hash is a SHA-256 fingerprint of your document stored on-chain.
                    Investors can verify your asset is backed by a real document without seeing it.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button variant="primary" fullWidth loading={uploading} icon={ShieldCheck} onClick={handleGenerateZKP}>
                    {uploading ? "Generating proof..." : "Generate ZKP Hash"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Mint ── */}
          {step === 4 && (
            <div style={{ maxWidth: "600px" }}>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", margin: "0 0 20px", color: "var(--text-primary)" }}>
                  Review & Mint Token
                </h2>

                {/* Summary */}
                {[
                  { label: "Asset Name",     value: assetName                                },
                  { label: "Asset Type",     value: ASSET_TYPES[assetType]?.label            },
                  { label: "Value (USD)",    value: `$${Number(assetValue).toLocaleString()}` },
                  { label: "Location",       value: location                                 },
                  { label: "Token Symbol",   value: symbol                                   },
                  { label: "Total Fractions",value: Number(fractions).toLocaleString()       },
                  { label: "IPFS CID",       value: ipfsCid, mono: true                      },
                  { label: "ZKP Hash",       value: `${zkpHash.slice(0, 20)}...`, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={{
                    display:        "flex",
                    justifyContent: "space-between",
                    alignItems:     "center",
                    padding:        "10px 0",
                    borderBottom:   "1px solid var(--border)",
                    gap:            "12px",
                  }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)", flexShrink: 0 }}>{label}</span>
                    <span style={{
                      fontSize:   "13px",
                      fontWeight: 600,
                      color:      "var(--text-primary)",
                      fontFamily: mono ? "JetBrains Mono, monospace" : "inherit",
                      textAlign:  "right",
                      wordBreak:  "break-all",
                    }}>
                      {value}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                  <Button variant="primary" fullWidth loading={minting} onClick={handleMint}>
                    {minting ? "Deploying contract..." : "Mint Token on Portaldot"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Success modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="🎉 Asset Tokenized!" size="sm">
        <div style={{ textAlign: "center" }}>
          <div style={{
            width:        "64px",
            height:       "64px",
            borderRadius: "50%",
            background:   "rgba(0,229,160,0.15)",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            margin:       "0 auto 16px",
          }}>
            <CheckCircle2 size={32} color="var(--accent-green)" />
          </div>
          <h3 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: "0 0 8px" }}>
            {assetName} is now on-chain!
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Your asset token has been deployed to the Portaldot chain.
            You can now list fractions on the marketplace.
          </p>
          <div style={{
            padding:      "10px",
            borderRadius: "8px",
            background:   "var(--bg-muted)",
            fontSize:     "11px",
            fontFamily:   "JetBrains Mono, monospace",
            color:        "var(--text-muted)",
            wordBreak:    "break-all",
            marginBottom: "16px",
          }}>
            TX: {txHash}
          </div>
          <Button variant="primary" fullWidth onClick={() => { setShowSuccess(false); window.location.href = "/dashboard"; }}>
            View in Dashboard
          </Button>
        </div>
      </Modal>
    </>
  );
}

// Missing import fix
import { ArrowRight } from "lucide-react";
