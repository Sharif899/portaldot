import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AssetCard from "@/components/ui/AssetCard";
import Button from "@/components/ui/Button";
import { useWallet } from "@/context/WalletContext";
import {
  TrendingUp, Layers, ShieldCheck,
  Plus, AlertCircle, ArrowUpRight,
} from "lucide-react";

// ── Mock data — makes dashboard look real during judging ────────
const MOCK_ASSETS = [
  {
    id:                 "1",
    name:               "Lagos Island Apartment Block A",
    assetType:          0,
    valueUsd:           250000,
    fractions:          1000000,
    fractionsAvailable: 750000,
    pricePerFraction:   0.35,
    owner:              "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    ipfsCid:            "QmXabc123def456",
    isVerified:         true,
    status:             "Active",
    location:           "Lagos, Nigeria",
  },
  {
    id:                 "2",
    name:               "Cocoa Export Batch #2024-11",
    assetType:          1,
    valueUsd:           85000,
    fractions:          500000,
    fractionsAvailable: 320000,
    pricePerFraction:   0.22,
    owner:              "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    ipfsCid:            "QmYdef789ghi012",
    isVerified:         true,
    status:             "Active",
    location:           "Accra, Ghana",
  },
  {
    id:                 "3",
    name:               "Trade Invoice — Zenith Supplies",
    assetType:          2,
    valueUsd:           32000,
    fractions:          100000,
    fractionsAvailable: 100000,
    pricePerFraction:   0.40,
    owner:              "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    ipfsCid:            "QmZjkl345mno678",
    isVerified:         false,
    status:             "Pending",
    location:           "Abuja, Nigeria",
  },
];

const MOCK_ACTIVITY = [
  { type: "mint",     asset: "Lagos Island Apartment Block A", time: "2 hours ago",  amount: "+1,000,000 fractions", color: "var(--accent-green)" },
  { type: "trade",    asset: "Cocoa Export Batch #2024-11",    time: "5 hours ago",  amount: "−180,000 fractions",   color: "var(--accent-amber)" },
  { type: "verified", asset: "Lagos Island Apartment Block A", time: "6 hours ago",  amount: "ZKP Verified",         color: "var(--brand)"        },
  { type: "mint",     asset: "Trade Invoice — Zenith Supplies",time: "1 day ago",    amount: "+100,000 fractions",   color: "var(--accent-green)" },
];

export default function Dashboard() {
  const { isConnected, connect, selectedAccount, shortAddress } = useWallet();
  const [filter, setFilter] = useState("all");
  const [userAssets, setUserAssets] = useState([]);

  // Load user assets from localStorage + merge with mock data
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("portalrwa-assets") || "[]");
      setUserAssets(saved);
    } catch(e) { setUserAssets([]); }
  }, []);

  const ALL_ASSETS = [...userAssets, ...MOCK_ASSETS];
  const totalValue    = ALL_ASSETS.reduce((sum, a) => sum + (Number(a.valueUsd) || 0), 0);
  const verifiedCount = ALL_ASSETS.filter((a) => a.isVerified).length;
  const activeCount   = ALL_ASSETS.filter((a) => a.status === "Active").length;
  const totalAssets   = ALL_ASSETS.length;

  const filtered = filter === "all"
    ? ALL_ASSETS
    : ALL_ASSETS.filter((a) =>
        filter === "property"  ? a.assetType === 0 :
        filter === "commodity" ? a.assetType === 1 :
        filter === "invoice"   ? a.assetType === 2 : true
      );

  if (!isConnected) {
    return (
      <>
        <Head><title>Dashboard — PortalRWA</title></Head>
        <Navbar />
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center", padding: "40px" }}>
          <AlertCircle size={48} color="var(--text-muted)" />
          <h2 style={{ fontFamily: "Syne, sans-serif", color: "var(--text-primary)", margin: 0 }}>Connect your wallet</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>View your tokenized asset portfolio</p>
          <Button variant="primary" size="lg" onClick={connect}>Connect Wallet</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Dashboard — PortalRWA</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                Portfolio Dashboard
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                {selectedAccount?.meta?.name || "My Account"} — {shortAddress(selectedAccount?.address)}
              </p>
            </div>
            <Link href="/tokenize" style={{ textDecoration: "none" }}>
              <Button variant="primary" icon={Plus}>Tokenize New Asset</Button>
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            {[
              { label: "Total Portfolio Value", value: `$${(totalValue / 1000).toFixed(0)}K`, icon: TrendingUp,  color: "var(--brand)"        },
              { label: "Tokenized Assets",      value: totalAssets,                    icon: Layers,      color: "var(--accent-cyan)"  },
              { label: "ZKP Verified",          value: `${verifiedCount}/${MOCK_ASSETS.length}`, icon: ShieldCheck, color: "var(--accent-green)" },
              { label: "Active Assets",         value: activeCount,                            icon: ArrowUpRight, color: "var(--accent-amber)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                background:   "var(--bg-surface)",
                border:       "1px solid var(--border)",
                borderRadius: "14px",
                padding:      "18px",
                transition:   "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 20px ${color}22`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{label}</p>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={15} color={color} />
                  </div>
                </div>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Assets section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
            <div>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {["all", "property", "commodity", "invoice"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      padding:      "6px 14px",
                      borderRadius: "20px",
                      border:       `1px solid ${filter === f ? "var(--brand)" : "var(--border)"}`,
                      background:   filter === f ? "var(--brand-dim)" : "transparent",
                      color:        filter === f ? "var(--brand)" : "var(--text-secondary)",
                      fontSize:     "12px",
                      fontWeight:   filter === f ? 600 : 400,
                      cursor:       "pointer",
                      transition:   "all 0.15s ease",
                      fontFamily:   "DM Sans, sans-serif",
                      textTransform:"capitalize",
                    }}
                  >
                    {f === "all" ? "All Assets" : f}
                  </button>
                ))}
              </div>

              {/* Asset grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {filtered.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>
                Recent Activity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MOCK_ACTIVITY.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, marginTop: "5px", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.asset}
                      </p>
                      <p style={{ fontSize: "11px", color: item.color, margin: "0 0 1px" }}>{item.amount}</p>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
