import { useState, useEffect } from "react";
import { fetchMyAssets, fetchMyPurchases } from "@/utils/supabase";
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

// Normalize Supabase snake_case → camelCase
function normalize(a) {
  return {
    ...a,
    assetType:          a.assetType          ?? a.asset_type          ?? 0,
    valueUsd:           a.valueUsd           ?? a.value_usd           ?? 0,
    fractionsAvailable: a.fractionsAvailable ?? a.fractions_available ?? a.fractions ?? 0,
    pricePerFraction:   a.pricePerFraction   ?? a.price_per_fraction  ?? 0,
    isVerified:         a.isVerified         ?? a.is_verified         ?? false,
    ipfsCid:            a.ipfsCid            ?? a.ipfs_cid            ?? "",
  };
}

export default function Dashboard() {
  const { isConnected, connect, selectedAccount, shortAddress } = useWallet();
  const [filter,         setFilter]        = useState("all");
  const [userAssets,     setUserAssets]    = useState([]);
  const [recentActivity, setRecentActivity]= useState([]);
  const [loading,        setLoading]       = useState(false);

  useEffect(() => {
    async function load() {
      if (!selectedAccount?.address) return;
      setLoading(true);
      try {
        // Fetch assets I minted AND assets I bought fractions of — in parallel
        const [owned, purchases] = await Promise.all([
          fetchMyAssets(selectedAccount.address),
          fetchMyPurchases(selectedAccount.address),
        ]);

        // purchases rows look like: { id, buyer, fractions_bought, assetdot: { ...asset } }
        const purchased = purchases.map((p) => ({
          ...p.assetdot,
          _purchasedFractions: p.fractions_bought,
          _isPurchased: true,
        }));

        // Merge — skip duplicates (e.g. if I minted AND bought fractions of the same asset)
        const ownedIds     = new Set(owned.map((a) => a.id));
        const newPurchased = purchased.filter((a) => !ownedIds.has(a.id));
        const merged       = [...owned, ...newPurchased];

        const normalized = merged.map(normalize);
        setUserAssets(normalized);

        // Build activity feed: mints (green) + purchases (cyan)
        const mintActivity = owned.map((a) => ({
          type:   "mint",
          asset:  a.name,
          time:   new Date(a.created_at || Date.now()).toLocaleString(),
          amount: `+${Number(a.fractions).toLocaleString()} fractions minted`,
          color:  "var(--accent-green)",
        }));

        const buyActivity = purchases.map((p) => ({
          type:   "buy",
          asset:  p.assetdot?.name || "Unknown Asset",
          time:   new Date(p.created_at || Date.now()).toLocaleString(),
          amount: `+${Number(p.fractions_bought).toLocaleString()} fractions bought`,
          color:  "var(--accent-cyan)",
        }));

        // Sort newest first
        const allActivity = [...mintActivity, ...buyActivity].sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        setRecentActivity(allActivity);

      } catch (e) {
        console.error("Dashboard load error:", e);
        setUserAssets([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedAccount?.address]);

  const totalValue    = userAssets.reduce((sum, a) => sum + (Number(a.valueUsd) || 0), 0);
  const verifiedCount = userAssets.filter((a) => a.isVerified).length;
  const activeCount   = userAssets.filter((a) => a.status === "Active").length;
  const totalAssets   = userAssets.length;

  const filtered = filter === "all"
    ? userAssets
    : userAssets.filter((a) => {
        const type = a.assetType ?? a.asset_type ?? 0;
        return filter === "property"  ? type === 0 :
               filter === "commodity" ? type === 1 :
               filter === "invoice"   ? type === 2 : true;
      });

  if (!isConnected) {
    return (
      <>
        <Head><title>Dashboard — AssetDot</title></Head>
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
      <Head><title>Dashboard — AssetDot</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "clamp(12px, 3vw, 32px)", overflowY: "auto", background: "var(--bg-base)", minWidth: 0 }}>

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
              { label: "Total Portfolio Value", value: `$${(totalValue / 1000).toFixed(0)}K`, icon: TrendingUp,   color: "var(--brand)"        },
              { label: "Tokenized Assets",      value: totalAssets,                            icon: Layers,       color: "var(--accent-cyan)"  },
              { label: "ZKP Verified",          value: `${verifiedCount}/${totalAssets}`,      icon: ShieldCheck,  color: "var(--accent-green)" },
              { label: "Active Assets",         value: activeCount,                            icon: ArrowUpRight, color: "var(--accent-amber)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "18px", transition: "all 0.2s ease" }}
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

          {/* Assets + Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
            <div>
              {/* Filter tabs */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {["all", "property", "commodity", "invoice"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
                    border: `1px solid ${filter === f ? "var(--brand)" : "var(--border)"}`,
                    background: filter === f ? "var(--brand-dim)" : "transparent",
                    color: filter === f ? "var(--brand)" : "var(--text-secondary)",
                    fontSize: "12px", fontWeight: filter === f ? 600 : 400,
                    transition: "all 0.15s ease", fontFamily: "DM Sans, sans-serif", textTransform: "capitalize",
                  }}>
                    {f === "all" ? "All Assets" : f}
                  </button>
                ))}
              </div>

              {loading && (
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                  Loading your assets...
                </p>
              )}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: "16px", color: "var(--text-muted)",
                }}>
                  <Layers size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 6px" }}>
                    No assets yet
                  </p>
                  <p style={{ fontSize: "13px", margin: "0 0 20px" }}>
                    Tokenize your first real-world asset or buy fractions on the marketplace
                  </p>
                  <Link href="/tokenize" style={{ textDecoration: "none" }}>
                    <Button variant="primary" icon={Plus}>Tokenize New Asset</Button>
                  </Link>
                </div>
              )}

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
              {recentActivity.length === 0 ? (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                  No activity yet
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recentActivity.map((item, i) => (
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
              )}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
