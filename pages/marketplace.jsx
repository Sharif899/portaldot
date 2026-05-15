import { useState, useEffect } from "react";
import { fetchAllAssets, supabase } from "@/utils/supabase";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import AssetCard from "@/components/ui/AssetCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/router";
import { Search, SlidersHorizontal, ShoppingCart, CheckCircle2 } from "lucide-react";

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
    location:           a.location           ?? "",
    status:             a.status             ?? "Active",
  };
}

export default function Marketplace() {
  const { isConnected, connect }         = useWallet();
  const router                           = useRouter();
  const [search,        setSearch]       = useState("");
  const [allListings,   setAllListings]  = useState([]);
  const [typeFilter,    setTypeFilter]   = useState("all");
  const [sortBy,        setSortBy]       = useState("value");
  const [selectedAsset, setSelectedAsset]= useState(null);
  const [quantity,      setQuantity]     = useState(0);
  const [buying,        setBuying]       = useState(false);
  const [showSuccess,   setShowSuccess]  = useState(false);
  const [loading,       setLoading]      = useState(true);
  const [buyError,      setBuyError]     = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllAssets();
        setAllListings((data || []).map(normalize));
      } catch (e) {
        console.error("Marketplace load error:", e);
        setAllListings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = allListings
    .filter((a) => {
      const name     = (a.name     || "").toLowerCase();
      const location = (a.location || "").toLowerCase();
      const term     = search.toLowerCase();
      const matchSearch = !term || name.includes(term) || location.includes(term);
      const type        = a.assetType ?? a.asset_type ?? 0;
      const matchType   =
        typeFilter === "all" ? true :
        typeFilter === "0"   ? type === 0 :
        typeFilter === "1"   ? type === 1 :
        typeFilter === "2"   ? type === 2 : true;
      return matchSearch && matchType;
    })
    .sort((a, b) =>
      sortBy === "value"     ? (b.valueUsd           || 0) - (a.valueUsd           || 0) :
      sortBy === "price"     ? (a.pricePerFraction   || 0) - (b.pricePerFraction   || 0) :
      sortBy === "available" ? (b.fractionsAvailable || 0) - (a.fractionsAvailable || 0) : 0
    );

  const handleBuy = async () => {
    if (!quantity || quantity <= 0) return;
    if (quantity > selectedAsset.fractionsAvailable) {
      setBuyError("Quantity exceeds available fractions.");
      return;
    }

    setBuying(true);
    setBuyError("");

    try {
      const newAvailable = selectedAsset.fractionsAvailable - quantity;

      const { error } = await supabase
        .from("assetdot")
        .update({ fractions_available: newAvailable })
        .eq("id", selectedAsset.id);

      if (error) throw error;

      // Update local state immediately so UI reflects the change without a reload
      setAllListings((prev) =>
        prev.map((a) =>
          a.id === selectedAsset.id
            ? { ...a, fractionsAvailable: newAvailable }
            : a
        )
      );

      setSelectedAsset(null);
      setQuantity(0);
      setShowSuccess(true);
    } catch (e) {
      console.error("Buy failed:", e);
      setBuyError("Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const totalCost = selectedAsset
    ? (quantity * (selectedAsset.pricePerFraction || 0)).toFixed(4)
    : 0;

  return (
    <>
      <Head><title>Marketplace — AssetDot</title></Head>
      <Navbar />

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        <Sidebar />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto", background: "var(--bg-base)" }}>

          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700,
              color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em",
            }}>
              Marketplace
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
              {loading
                ? "Loading listings..."
                : `${allListings.length} asset${allListings.length !== 1 ? "s" : ""} listed · Buy fractions of real-world assets`}
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

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
              style={{ width: "auto", paddingRight: "32px", cursor: "pointer" }}
            >
              <option value="all">All Types</option>
              <option value="0">Property</option>
              <option value="1">Commodity</option>
              <option value="2">Invoice</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
              style={{ width: "auto", paddingRight: "32px", cursor: "pointer" }}
            >
              <option value="value">Sort: Highest Value</option>
              <option value="price">Sort: Lowest Price</option>
              <option value="available">Sort: Most Available</option>
            </select>
          </div>

          {!loading && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Showing {filtered.length} of {allListings.length} listings
            </p>
          )}

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "14px" }}>Loading marketplace...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && allListings.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "16px", color: "var(--text-muted)",
            }}>
              <SlidersHorizontal size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 6px" }}>
                No listings yet
              </p>
              <p style={{ fontSize: "13px", margin: 0 }}>
                Be the first to tokenize a real-world asset
              </p>
            </div>
          )}

          {/* No filter match */}
          {!loading && allListings.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <SlidersHorizontal size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
              <p>No assets match your filters</p>
            </div>
          )}

          {/* Listings grid */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {filtered.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  showTradeButton
                  onTrade={(a) => {
                    if (!isConnected) { connect(); return; }
                    setSelectedAsset(a);
                    setQuantity(0);
                    setBuyError("");
                  }}
                />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Buy modal */}
      <Modal isOpen={!!selectedAsset} onClose={() => { setSelectedAsset(null); setBuyError(""); }} title="Buy Fractions" size="sm">
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
                value={quantity === 0 ? "" : quantity}
                onChange={(e) => {
                  setBuyError("");
                  setQuantity(e.target.value === "" ? 0 : Number(e.target.value));
                }}
                className="input"
              />
              <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                Max: {(selectedAsset.fractionsAvailable || 0).toLocaleString()} available
              </p>
            </div>

            {[
              { label: "Price per fraction", value: `${selectedAsset.pricePerFraction} POT`  },
              { label: "Quantity",           value: quantity.toLocaleString()                 },
              { label: "Platform fee (1%)",  value: `${(totalCost * 0.01).toFixed(4)} POT`   },
              { label: "Total cost",         value: `${totalCost} POT`, bold: true            },
            ].map(({ label, value, bold }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontSize: "13px", fontWeight: bold ? 700 : 500, color: bold ? "var(--brand)" : "var(--text-primary)" }}>{value}</span>
              </div>
            ))}

            {/* Error message */}
            {buyError && (
              <p style={{ fontSize: "12px", color: "var(--accent-red, #ef4444)", marginTop: "10px", textAlign: "center" }}>
                {buyError}
              </p>
            )}

            <Button
              variant="primary" fullWidth loading={buying}
              icon={ShoppingCart} style={{ marginTop: "16px" }}
              onClick={handleBuy}
              disabled={buying || quantity <= 0}
            >
              {buying ? "Processing..." : `Buy ${quantity.toLocaleString()} Fractions`}
            </Button>
          </div>
        )}
      </Modal>

      {/* Success modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Purchase Complete" size="sm">
        <div style={{ textAlign: "center" }}>
          <CheckCircle2 size={48} color="var(--accent-green)" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Your fractions have been transferred to your wallet successfully.
          </p>
          <Button variant="primary" fullWidth onClick={() => { setShowSuccess(false); router.push("/dashboard"); }}>
            View in Dashboard
          </Button>
        </div>
      </Modal>
    </>
  );
}
