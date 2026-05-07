/**
 * constants.js — global constants for PortalRWA
 *
 * CONTRACT_ADDRESSES are auto-updated by contracts/deploy.js
 * after deployment. Until then they are placeholder values.
 *
 * To update after deploying:
 *   cd contracts && node deploy.js
 * This will overwrite the addresses below automatically.
 */

// ── Contract addresses (updated by deploy.js) ─────────────────
export const CONTRACT_ADDRESSES = {
  // Deployed ZKP Verifier contract address on Portaldot testnet
  zkpVerifier: process.env.NEXT_PUBLIC_ZKP_VERIFIER || "5PLACEHOLDER_ZKP_VERIFIER",

  // Deployed Marketplace contract address on Portaldot testnet
  marketplace:  process.env.NEXT_PUBLIC_MARKETPLACE  || "5PLACEHOLDER_MARKETPLACE",

  // RWA token contracts are deployed per-asset — stored in state/DB
  // not here since each asset has its own contract address
};

// ── Portaldot node WebSocket endpoint ─────────────────────────
export const PORTALDOT_WS =
  process.env.NEXT_PUBLIC_PORTALDOT_WS || "wss://testnet.portaldot.world";

// ── IPFS gateway ──────────────────────────────────────────────
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

// ── Asset type enum (mirrors ink! contract) ───────────────────
export const ASSET_TYPES = {
  PROPERTY:  0,
  COMMODITY: 1,
  INVOICE:   2,
};

export const ASSET_TYPE_LABELS = {
  [ASSET_TYPES.PROPERTY]:  "Property",
  [ASSET_TYPES.COMMODITY]: "Commodity",
  [ASSET_TYPES.INVOICE]:   "Invoice",
};

export const ASSET_TYPE_COLORS = {
  [ASSET_TYPES.PROPERTY]:  "var(--brand)",
  [ASSET_TYPES.COMMODITY]: "var(--accent-amber)",
  [ASSET_TYPES.INVOICE]:   "var(--accent-green)",
};

// ── Asset status enum (mirrors ink! contract) ─────────────────
export const ASSET_STATUS = {
  ACTIVE:  "Active",
  PENDING: "Pending",
  FROZEN:  "Frozen",
};

// ── Proof status enum (mirrors zkp_verifier contract) ─────────
export const PROOF_STATUS = {
  PENDING:  "Pending",
  VERIFIED: "Verified",
  REVOKED:  "Revoked",
};

// ── Supported bridge chains ───────────────────────────────────
export const BRIDGE_CHAINS = [
  { id: "portaldot", name: "Portaldot",  logo: "🔮", color: "#6152f8" },
  { id: "polkadot",  name: "Polkadot",   logo: "⭕", color: "#E6007A" },
  { id: "ethereum",  name: "Ethereum",   logo: "⟠",  color: "#627EEA" },
  { id: "bnb",       name: "BNB Chain",  logo: "🟡", color: "#F0B90B" },
  { id: "cosmos",    name: "Cosmos",     logo: "⚛️", color: "#00d4ff" },
];

// ── Platform fee ──────────────────────────────────────────────
// 100 basis points = 1%
export const PLATFORM_FEE_BP = 100;

// ── Portaldot chain decimal places ───────────────────────────
// Used for converting between human-readable and planck units
export const CHAIN_DECIMALS = 12;

// ── Default token fractions for new assets ────────────────────
export const DEFAULT_FRACTIONS = 1_000_000;

// ── Max file size for IPFS uploads (10MB) ────────────────────
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// ── Accepted document file types ─────────────────────────────
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// ── Polkadot{.js} extension app name ─────────────────────────
export const APP_NAME = "PortalRWA";

// ── Social links ──────────────────────────────────────────────
export const SOCIAL_LINKS = {
  github:    "https://github.com/portaldotVolunteer",
  twitter:   "https://x.com/PortaldotL0",
  whitepaper:"https://portaldot-network.gitbook.io/portaldot-network-docs",
};
