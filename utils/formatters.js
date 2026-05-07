/**
 * formatters.js — display formatting utilities for PortalRWA
 *
 * All the small formatting functions used across every page.
 * Import what you need:
 *   import { formatUsd, formatAddress, formatBalance } from "@/utils/formatters";
 */

// ── USD value formatting ───────────────────────────────────────
// formatUsd(250000)  → "$250,000"
// formatUsd(1500000) → "$1.5M"
// formatUsd(85000)   → "$85K"
export function formatUsd(value, compact = true) {
  if (value == null || isNaN(value)) return "$0";

  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)         return `$${(value / 1_000).toFixed(0)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Polkadot address formatting ────────────────────────────────
// formatAddress("5GrwvaEF5...qE2C")        → "5Grwva...E2C"
// formatAddress("5GrwvaEF5...qE2C", 8, 6)  → "5Grwvaef...QpDWS"
export function formatAddress(address, prefixLen = 6, suffixLen = 4) {
  if (!address || address.length < prefixLen + suffixLen + 3) return address || "";
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

// ── Token balance formatting ───────────────────────────────────
// formatBalance("1000000000000000000") → "1.0"  (18 decimals)
// formatBalance(750000, 0)             → "750,000" (no decimals)
export function formatBalance(raw, decimals = 18) {
  if (raw == null) return "0";
  try {
    const num = BigInt(raw.toString());
    if (decimals === 0) return Number(num).toLocaleString();
    const divisor  = BigInt(10 ** decimals);
    const whole    = num / divisor;
    const fraction = num % divisor;
    const fracStr  = fraction.toString().padStart(decimals, "0").slice(0, 4);
    return `${whole.toLocaleString()}.${fracStr}`;
  } catch {
    return raw.toString();
  }
}

// ── POT planck → human readable ───────────────────────────────
// Portaldot uses 12 decimal places (like Polkadot)
// formatPOT("1000000000000") → "1.0000 POT"
export function formatPOT(planck, showSymbol = true) {
  if (planck == null) return showSymbol ? "0 POT" : "0";
  try {
    const num      = BigInt(planck.toString());
    const DECIMALS = 12n;
    const UNIT     = 10n ** DECIMALS;
    const whole    = num / UNIT;
    const fraction = num % UNIT;
    const fracStr  = fraction.toString().padStart(12, "0").slice(0, 4);
    const formatted = `${whole.toLocaleString()}.${fracStr}`;
    return showSymbol ? `${formatted} POT` : formatted;
  } catch {
    return showSymbol ? `${planck} POT` : planck.toString();
  }
}

// ── Human POT → planck ────────────────────────────────────────
// potToPlanck(1.5) → "1500000000000"
export function potToPlanck(pot) {
  try {
    const [whole, fraction = ""] = pot.toString().split(".");
    const paddedFraction = fraction.slice(0, 12).padEnd(12, "0");
    return BigInt(whole) * BigInt(10 ** 12) + BigInt(paddedFraction);
  } catch {
    return 0n;
  }
}

// ── Fraction count formatting ──────────────────────────────────
// formatFractions(1000000)  → "1,000,000"
// formatFractions(1000000, true) → "1M"
export function formatFractions(count, compact = false) {
  if (count == null) return "0";
  if (compact) {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000)     return `${(count / 1_000).toFixed(0)}K`;
    return count.toString();
  }
  return Number(count).toLocaleString();
}

// ── Asset type label ──────────────────────────────────────────
// assetTypeLabel(0) → "Property"
// assetTypeLabel(1) → "Commodity"
// assetTypeLabel(2) → "Invoice"
export function assetTypeLabel(typeId) {
  const types = { 0: "Property", 1: "Commodity", 2: "Invoice" };
  return types[typeId] ?? "Unknown";
}

// ── Asset status label ────────────────────────────────────────
export function assetStatusLabel(status) {
  if (typeof status === "object") {
    // ink! returns enum variants as objects: { active: null }
    if (status.active   != null) return "Active";
    if (status.pending  != null) return "Pending";
    if (status.frozen   != null) return "Frozen";
  }
  return status?.toString() ?? "Unknown";
}

// ── Timestamp formatting ──────────────────────────────────────
// formatTimestamp(1705000000000) → "Jan 12, 2025"
export function formatTimestamp(ms, includeTime = false) {
  if (!ms) return "—";
  const date = new Date(Number(ms));
  const opts = {
    year:  "numeric",
    month: "short",
    day:   "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  };
  return date.toLocaleDateString("en-US", opts);
}

// ── Relative time ─────────────────────────────────────────────
// timeAgo(Date.now() - 3600000) → "1 hour ago"
export function timeAgo(ms) {
  if (!ms) return "—";
  const seconds = Math.floor((Date.now() - Number(ms)) / 1000);
  if (seconds < 60)   return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400)return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// ── IPFS CID shortener ────────────────────────────────────────
// shortenCid("QmXabc123def456ghi789") → "QmXabc...i789"
export function shortenCid(cid, prefixLen = 6, suffixLen = 4) {
  if (!cid || cid.length <= prefixLen + suffixLen + 3) return cid || "";
  return `${cid.slice(0, prefixLen)}...${cid.slice(-suffixLen)}`;
}

// ── ZKP hash shortener ────────────────────────────────────────
// shortenHash("a3f8e9b2c1d4...") → "a3f8e9...c1d4"
export function shortenHash(hash, len = 8) {
  if (!hash) return "";
  return `${hash.slice(0, len)}...${hash.slice(-4)}`;
}

// ── Percentage formatting ─────────────────────────────────────
// formatPct(0.753) → "75.3%"
export function formatPct(ratio, decimals = 1) {
  if (ratio == null) return "0%";
  return `${(ratio * 100).toFixed(decimals)}%`;
}

// ── Availability percentage ───────────────────────────────────
// availabilityPct(750000, 1000000) → 75
export function availabilityPct(available, total) {
  if (!total || total === 0) return 0;
  return Math.round((available / total) * 100);
}
