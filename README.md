# AssetDot — Real-World Asset Tokenization on Portaldot

> Unlock the value of real-world assets. Tokenize property, commodities, and invoices on the Portaldot Layer 0 blockchain — and trade them globally.

---

## 🎥 Demo Video

> **[Watch Demo](https://youtu.be/UzxcnDjTbwM)**

## 🔴 Live App

> **[https://assetdot.vercel.app](https://assetdot.vercel.app)**

---

## 🌍 The Problem

Trillions of dollars in real-world assets — property, farmland, commodities, and trade invoices — remain illiquid and inaccessible, especially across emerging markets in Africa. Asset owners cannot unlock capital. Investors cannot access these markets. The infrastructure to connect physical assets to global liquidity simply does not exist.

## ⚡ The Solution

**AssetDot** is a no-code platform that lets anyone tokenize a real-world asset on the Portaldot blockchain in under 5 minutes.

Once tokenized:
- Fractions can be traded on the **iSwap DEX** integration
- Assets can be bridged cross-chain via **iBridge**
- Ownership is verified privately via **ZKP proofs**
- Tokenized assets are stored in a **shared Supabase database** — visible to all users on the marketplace instantly
- Everything is transparent, immutable, and trustless on-chain

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Tokenize** | Upload legal document to IPFS, generate ZKP hash, mint RWA token on Portaldot — saved to shared database instantly |
| 📊 **Dashboard** | Portfolio overview — asset values, fractions, ZKP status, activity feed |
| 🛒 **Marketplace** | Buy and sell fractions of real-world assets — all tokenized assets from any user appear here automatically |
| 🌉 **Bridge** | Cross-chain transfers via Portaldot iBridge |
| 🔒 **ZKP Privacy** | Verify any listed asset's proof — not just your own. Select any marketplace asset from the dropdown and auto-fill its document hash |

---

## ⛓️ Native Portaldot Deployment

AssetDot was deployed and tested on a **live Portaldot local dev node** — using the real PortalDot runtime and POT token flow — confirming native chain compatibility.

| Field | Value |
|---|---|
| **Network** | Portaldot Local Dev Node (portaldot/1002) |
| **Block** | #1974 |
| **Extrinsic** | `contracts.instantiateWithCode` |
| **Signer** | ALICE (`5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`) |
| **Transaction Hash** | `0x055609c22998c5085eeffde25e4071eb0e3f9b28d064a6de7fc2077cb738447a` |
| **Gas Limit** | 25,000,000,000 |
| **Status** | ✅ In Block — Success |

**What this proves:**
- The PortalDot runtime accepted and processed our contract transaction
- POT token flow was used in the transaction (ALICE account, dev chain)
- The Portaldot contracts pallet is live and functional on the node
- AssetDot is built natively for Portaldot — not just as a concept

**On contract compatibility:**
The Portaldot v2.0.0 dev node ships with a contracts pallet that predates ink! 5.x. A compatible ink! wasm binary was used to demonstrate the live on-chain deployment. Our full RWA contracts — `rwa_token` (PSP22), `marketplace` (fractional trading + escrow), and `zkp_verifier` (privacy proofs) — are fully written, compiled with ink! 5.x, and available in the `contracts/` folder of this repo. They are ready for deployment on an upgraded Portaldot node or the Portaldot testnet.

---

## 🏗️ Architecture

```
AssetDot
├── Frontend       Next.js 14 + React + Tailwind CSS
├── Wallet         Polkadot{.js} extension
├── Database       Supabase (PostgreSQL) — shared asset registry
├── Contracts      ink! 5.x on Portaldot chain
│   ├── rwa_token      PSP22 token + RWA metadata
│   ├── marketplace    Fractional trading + escrow + 1% fee
│   └── zkp_verifier   Privacy-preserving proof verification
├── Storage        IPFS via Pinata
└── Chain          Portaldot Layer 0 (LAO NPoS consensus)
```

---

## 🚀 Run Locally

### Requirements
- Node.js v18+
- Rust + cargo-contract
- Polkadot{.js} browser extension
- Portaldot dev node
- Supabase account

### 1. Clone the repo

```bash
git clone https://github.com/Sharif899/portaldot.git
cd portaldot
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_PORTALDOT_WS=ws://127.0.0.1:9944
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET=your_pinata_secret
NEXT_PUBLIC_ZKP_VERIFIER=5PLACEHOLDER
NEXT_PUBLIC_MARKETPLACE=5PLACEHOLDER
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Supabase

Create a free project at [supabase.com](https://supabase.com) and create a table called `assetdot` with these columns:

| Column | Type | Default |
|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` |
| `created_at` | `timestamptz` | `now()` |
| `name` | `text` | |
| `location` | `text` | |
| `asset_type` | `int4` | |
| `value_usd` | `float8` | |
| `fractions` | `int8` | |
| `fractions_available` | `int8` | |
| `price_per_fraction` | `float8` | |
| `owner` | `text` | |
| `ipfs_cid` | `text` | |
| `is_verified` | `bool` | `false` |
| `status` | `text` | `'Active'` |

Disable RLS for development. Add your Supabase URL and anon key to `lib/supabaseClient.js`.

### 4. Start the Portaldot local node

Download the Portaldot dev node binary:
> https://portaldot-dev.readthedocs.io/en/latest/chain-info.html

```bash
./portaldot_dev --dev --tmp
```

Wait until you see `Imported #1`.

### 5. Deploy ink! contracts

```bash
cd contracts
npm install @polkadot/api @polkadot/api-contract @polkadot/keyring dotenv
node deploy.js
```

Copy the printed contract addresses into your `.env.local`.

### 6. Run the frontend

```bash
cd ..
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
portaldot/
├── components/layout/     Navbar, Sidebar, Footer
├── components/ui/         Button, Modal, AssetCard, ThemeToggle, WalletButton
├── context/               ThemeContext, WalletContext
├── contracts/             rwa_token, marketplace, zkp_verifier (ink!)
├── hooks/                 useContract, useRwaToken, useMarketplace, useIPFS, useZKP
├── lib/                   supabaseClient.js — shared database client
├── pages/                 home, tokenize, dashboard, marketplace, bridge, privacy
├── public/                Static assets
├── styles/                Global CSS design system
└── utils/                 Constants, formatters, IPFS utilities
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Portaldot Layer 0 (LAO NPoS) |
| Smart Contracts | ink! 5.x (Rust) |
| Frontend | Next.js 14, React 18 |
| Styling | Tailwind CSS + CSS Variables |
| Wallet | Polkadot{.js} extension |
| Storage | IPFS via Pinata |
| Database | Supabase (PostgreSQL) |
| Privacy | ZKP (SHA-256 commitment scheme) |
| Deployment | Vercel |

---

## 🌍 Why Portaldot

Portaldot is the only Layer 0 chain with a native RWA platform, DEX, cross-chain bridge, and privacy layer built in. AssetDot uses all four natively.

The LAO NPoS consensus with hot-upgrade capability means AssetDot can evolve without hard forks. The Africa-first focus is intentional — the continent holds enormous illiquid wealth in real estate and commodities. AssetDot brings that wealth on-chain.

---

## 🗺️ Roadmap

- Q2 2026 — MVP on Portaldot testnet + Supabase shared asset registry
- Q3 2026 — Mainnet deployment + KYC verifier onboarding
- Q4 2026 — Mobile app + institutional integrations
- Q1 2027 — Quantum-resistant proof upgrade

---

## 👤 Builder

Sharif899 — Builder / Product

---

## 📄 License

MIT
