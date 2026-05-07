import { useState } from "react";
import { Building2, Package, FileText, ShieldCheck, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * AssetCard component
 * Displays a single tokenized real-world asset with all key info.
 *
 * Props:
 *   asset — object with:
 *     name           string   "Lagos Apartment Block A"
 *     assetType      number   0=Property 1=Commodity 2=Invoice
 *     valueUsd       number   USD value in dollars
 *     fractions      number   Total token supply
 *     pricePerFraction number Price in POT per fraction
 *     owner          string   Polkadot address
 *     ipfsCid        string   IPFS CID of document
 *     isVerified     boolean  Has ZKP proof been verified?
 *     status         string   "Active" | "Pending" | "Frozen"
 *     location       string   "Lagos, Nigeria"
 *     fractionsAvailable number For marketplace listings
 *
 *   onTrade  — called when user clicks "Buy Fraction"
 *   showTradeButton — show the buy button (marketplace mode)
 *   compact  — smaller card for dashboard list views
 */

const ASSET_TYPES = {
  0: { label: "Property",  icon: Building2, color: "var(--brand)",        bg: "var(--brand-dim)"             },
  1: { label: "Commodity", icon: Package,   color: "var(--accent-amber)",  bg: "rgba(245,166,35,0.12)"        },
  2: { label: "Invoice",   icon: FileText,  color: "var(--accent-green)",  bg: "rgba(0,229,160,0.12)"         },
};

const STATUS_COLORS = {
  Active:  { color: "var(--accent-green)", bg: "rgba(0,229,160,0.12)"  },
  Pending: { color: "var(--accent-amber)", bg: "rgba(245,166,35,0.12)" },
  Frozen:  { color: "var(--accent-coral)", bg: "rgba(255,107,107,0.12)"},
};

function formatUsd(value) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function AssetCard({
  asset,
  onTrade,
  showTradeButton = false,
  compact         = false,
}) {
  const [hovered, setHovered] = useState(false);

  if (!asset) return null;

  const typeInfo   = ASSET_TYPES[asset.assetType]  || ASSET_TYPES[0];
  const statusInfo = STATUS_COLORS[asset.status]   || STATUS_COLORS.Active;
  const TypeIcon   = typeInfo.icon;

  const availablePct = asset.fractions > 0
    ? Math.round(((asset.fractionsAvailable || 0) / asset.fractions) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   "var(--bg-surface)",
        border:       `1px solid ${hovered ? "var(--brand)" : "var(--border)"}`,
        borderRadius: "16px",
        overflow:     "hidden",
        transition:   "all 0.2s ease",
        boxShadow:    hovered ? "var(--glow)" : "var(--shadow-sm)",
        cursor:       showTradeButton ? "default" : "pointer",
      }}
    >
      {/* ── Top color bar ── */}
      <div style={{
        height:     "4px",
        background: `linear-gradient(90deg, ${typeInfo.color} 0%, transparent 100%)`,
      }} />

      <div style={{ padding: compact ? "14px" : "18px" }}>

        {/* ── Header row ── */}
        <div style={{
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          marginBottom:   "12px",
          gap:            "8px",
        }}>
          {/* Asset type icon + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
            <div style={{
              width:        compact ? "32px" : "38px",
              height:       compact ? "32px" : "38px",
              borderRadius: "10px",
              background:   typeInfo.bg,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              flexShrink:   0,
            }}>
              <TypeIcon size={compact ? 15 : 18} color={typeInfo.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{
                fontFamily:   "Syne, sans-serif",
                fontSize:     compact ? "13px" : "15px",
                fontWeight:   700,
                color:        "var(--text-primary)",
                margin:       0,
                whiteSpace:   "nowrap",
                overflow:     "hidden",
                textOverflow: "ellipsis",
              }}>
                {asset.name}
              </h3>
              {asset.location && (
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  📍 {asset.location}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
            {/* Type badge */}
            <span style={{
              fontSize:     "10px",
              fontWeight:   600,
              padding:      "2px 8px",
              borderRadius: "20px",
              background:   typeInfo.bg,
              color:        typeInfo.color,
              textAlign:    "center",
            }}>
              {typeInfo.label}
            </span>
            {/* Status badge */}
            <span style={{
              fontSize:     "10px",
              fontWeight:   600,
              padding:      "2px 8px",
              borderRadius: "20px",
              background:   statusInfo.bg,
              color:        statusInfo.color,
              textAlign:    "center",
            }}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* ── Value + fractions row ── */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:                 "10px",
          marginBottom:        "12px",
        }}>
          <div style={{
            padding:      "10px",
            borderRadius: "10px",
            background:   "var(--bg-muted)",
          }}>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "0 0 2px" }}>
              Asset Value
            </p>
            <p style={{
              fontSize:   compact ? "16px" : "18px",
              fontWeight: 700,
              color:      "var(--text-primary)",
              margin:     0,
              fontFamily: "Syne, sans-serif",
            }}>
              {formatUsd(asset.valueUsd)}
            </p>
          </div>
          <div style={{
            padding:      "10px",
            borderRadius: "10px",
            background:   "var(--bg-muted)",
          }}>
            <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: "0 0 2px" }}>
              Price / Fraction
            </p>
            <p style={{
              fontSize:   compact ? "16px" : "18px",
              fontWeight: 700,
              color:      "var(--brand)",
              margin:     0,
              fontFamily: "Syne, sans-serif",
            }}>
              {asset.pricePerFraction} POT
            </p>
          </div>
        </div>

        {/* ── Availability bar (marketplace mode) ── */}
        {showTradeButton && asset.fractions > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{
              display:        "flex",
              justifyContent: "space-between",
              fontSize:       "11px",
              color:          "var(--text-muted)",
              marginBottom:   "4px",
            }}>
              <span>{asset.fractionsAvailable?.toLocaleString()} fractions left</span>
              <span>{availablePct}% available</span>
            </div>
            <div style={{
              height:       "4px",
              borderRadius: "2px",
              background:   "var(--bg-muted)",
              overflow:     "hidden",
            }}>
              <div style={{
                height:     "100%",
                width:      `${availablePct}%`,
                background: availablePct > 50
                  ? "var(--accent-green)"
                  : availablePct > 20
                    ? "var(--accent-amber)"
                    : "var(--accent-coral)",
                borderRadius: "2px",
                transition:  "width 0.5s ease",
              }} />
            </div>
          </div>
        )}

        {/* ── Footer row ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          gap:            "8px",
        }}>
          {/* ZKP verification status */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck
              size={13}
              color={asset.isVerified ? "var(--accent-green)" : "var(--text-muted)"}
            />
            <span style={{
              fontSize: "11px",
              color:    asset.isVerified ? "var(--accent-green)" : "var(--text-muted)",
            }}>
              {asset.isVerified ? "ZKP Verified" : "Unverified"}
            </span>
          </div>

          {/* IPFS link */}
          {asset.ipfsCid && (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${asset.ipfsCid}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display:    "flex",
                alignItems: "center",
                gap:        "3px",
                fontSize:   "11px",
                color:      "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--brand)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <ExternalLink size={11} />
              Docs
            </a>
          )}

          {/* Trade button */}
          {showTradeButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onTrade?.(asset)}
              disabled={asset.status !== "Active" || availablePct === 0}
            >
              {availablePct === 0 ? "Sold Out" : "Buy Fraction"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
