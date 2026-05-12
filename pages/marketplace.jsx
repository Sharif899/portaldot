import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AssetCard from "@/components/ui/AssetCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import { Search, SlidersHorizontal, ShoppingCart, CheckCircle2 } from "lucide-react";

const LISTINGS = [
  { id:"1", name:"Lagos Island Apartment Block A", assetType:0, valueUsd:250000, fractions:1000000, fractionsAvailable:750000, pricePerFraction:0.35, owner:"5Grwva...utQY", ipfsCid:"QmXabc123", isVerified:true,  status:"Active",  location:"Lagos, Nigeria"    },
  { id:"2", name:"Cocoa Export Batch #2024-11",    assetType:1, valueUsd:85000,  fractions:500000,  fractionsAvailable:320000, pricePerFraction:0.22, owner:"5FHneW...d1Hi", ipfsCid:"QmYdef456", isVerified:true,  status:"Active",  location:"Accra, Ghana"      },
  { id:"4", name:"Palm Oil Futures Q1 2025",       assetType:1, valueUsd:45000,  fractions:200000,  fractionsAvailable:120000, pricePerFraction:0.18, owner:"5HGjYb...9eVX", ipfsCid:"QmAjkl012", isVerified:false, status:"Active",  location:"Port Harcourt, NG" },
  { id:"5", name:"Logistics Invoice — DHL Africa", assetType:2, valueUsd:28000,  fractions:100000,  fractionsAvailable:80000,  pricePerFraction:0.38, owner:"5CiPPu...dCJu", ipfsCid:"QmBmno345", isVerified:true,  status:"Active",  location:"Nairobi, Kenya"    },
  { id:"6", name:"Nairobi Office Complex Floor 3", assetType:0, valueUsd:320000, fractions:1500000, fractionsAvailable:50000,  pricePerFraction:0.29, owner:"5Grwva...utQY", ipfsCid:"QmCpqr678", isVerified:true,  status:"Active",  location:"Nairobi, Kenya"    },
];

export default function Marketplace() {
  const { isConnected, connect } = useWallet();
  const [search,        setSearch]        = useState("");
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [sortBy,        setSortBy]        = useState("value");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [quantity,      setQuantity]      = useState("");
  const [buying,        setBuying]        = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);

  const filtered = LISTINGS
    .filter((a) => {
      const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.location.toLowerCase().includes(search.toLowerCase());
      const matchType   = typeFilter === "all" ? true :
                          typeFilter === "0"    ? a.assetType === 0 :
                          typeFilter === "1"    ? a.assetType === 1 :
                          typeFilter === "2"    ? a.assetType === 2 : true;
      return matchSearch && matchType;
    })
    .sort((a, b) =>
      sortBy === "value"     ? b.valueUsd - a.valueUsd :
      sortBy === "price"     ? a.pricePerFraction - b.pricePerFraction :
      sortBy === "available" ? b.fractionsAvailable - a.fractionsAvailable : 0
    );

  const handleBuy = async () => {
    if (!quantity || Number(quantity) < 1) return;
    setBuying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setBuying(false);
    setSelectedAsset(null);
    setShowSuccess(true);
  };

  const qty = Number(quantity) || 0;
  const totalCost = selectedAsset ? (qty * selectedAsset.pricePerFraction).toFixed(4) : 0;

  return (
    <>
      <Head><title>Marketplace — PortalRWA</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>

          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Marketplace
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
              {LISTINGS.length} assets listed · Buy fractions of real-world assets
            </p>
          </div>

          {/* Search + filters */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search assets or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: "36px" }}
              />
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input" style={{ width: "auto", paddingRight: "32px", cursor: "pointer" }}>
              <option value="all">All Types</option>
              <option value="0">Property</option>
              <option value="1">Commodity</option>
              <option value="2">Invoice</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input" style={{ width: "auto", paddingRight: "32px", cursor: "pointer" }}>
              <option value="value">Sort: Highest Value</option>
              <option value="price">Sort: Lowest Price</option>
              <option value="available">Sort: Most Available</option>
            </select>
          </div>

          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Showing {filtered.length} of {LISTINGS.length} listings
          </p>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <SlidersHorizontal size={32} style={{ marginBottom: "10px" }} />
              <p>No assets match your filters</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filtered.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  showTradeButton
                  onTrade={(a) => {
                    if (!isConnected) { connect(); return; }
                    setSelectedAsset(a);
                    setQuantity("");
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Buy modal */}
      <Modal isOpen={!!selectedAsset} onClose={() => setSelectedAsset(null)} title="Buy Fractions" size="sm">
        {selectedAsset && (
          <div>
            <div style={{ padding: "12px", borderRadius: "10px", background: "var(--bg-muted)", marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{selectedAsset.name}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{selectedAsset.location}</p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Number of Fractions
              </label>
              <input
                type="number"
                min="1"
                max={selectedAsset.fractionsAvailable}
                value={quantity}
                placeholder="Enter amount"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") { setQuantity(""); return; }
                  const num = Number(val);
                  if (num > selectedAsset.fractionsAvailable) return;
                  setQuantity(val);
                }}
                className="input"
              />
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                Max: {selectedAsset.fractionsAvailable.toLocaleString()} available
              </p>
            </div>

            {[
              { label: "Price per fraction", value: `${selectedAsset.pricePerFraction} POT` },
              { label: "Quantity",           value: qty.toLocaleString()                    },
              { label: "Platform fee (1%)",  value: `${(totalCost * 0.01).toFixed(4)} POT` },
              { label: "Total cost",         value: `${totalCost} POT`, bold: true          },
            ].map(({ label, value, bold }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontSize: "13px", fontWeight: bold ? 700 : 500, color: bold ? "var(--brand)" : "var(--text-primary)" }}>{value}</span>
              </div>
            ))}

            <Button
              variant="primary" fullWidth loading={buying} icon={ShoppingCart}
              style={{ marginTop: "16px" }}
              onClick={handleBuy}
              disabled={!quantity || qty < 1}
            >
              {buying ? "Processing..." : `Buy ${qty.toLocaleString() || 0} Fractions`}
            </Button>
          </div>
        )}
      </Modal>

      {/* Success toast */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Purchase Complete" size="sm">
        <div style={{ textAlign: "center" }}>
          <CheckCircle2 size={48} color="var(--accent-green)" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Your fractions have been transferred to your wallet successfully.
          </p>
          <Button variant="primary" fullWidth onClick={() => { setShowSuccess(false); window.location.href="/dashboard"; }}>
            View in Dashboard
          </Button>
        </div>
      </Modal>
    </>
  );
}
