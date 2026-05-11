# AssetDot — Real-World Asset Tokenization on Portaldot

> Unlock the value of real-world assets. Tokenize property, commodities, and invoices on the Portaldot Layer 0 blockchain — and trade them globally.

---

## 🎥 Demo Video

> **[Watch Demo](https://youtube.com/DEMO_LINK_HERE)**

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
- Everything is transparent, immutable, and trustless on-chain

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Tokenize** | Upload legal document to IPFS, generate ZKP hash, mint RWA token on Portaldot |
| 📊 **Dashboard** | Portfolio overview — asset values, fractions, ZKP status, activity feed |
| 🛒 **Marketplace** | Buy and sell fractions of real-world assets via iSwap DEX integration |
| 🌉 **Bridge** | Cross-chain transfers via Portaldot iBridge |
| 🔒 **ZKP Privacy** | Prove an asset is real without revealing sensitive legal documents |

---

## 🏗️ Architecture

```
AssetDot
├── Frontend       Next.js 14 + React + Tailwind CSS
├── Wallet         Polkadot{.js} extension
├── Contracts      ink! 4.x on Portaldot chain
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
```

### 3. Start the Portaldot local node

Download the Portaldot dev node:
> https://portaldot-dev.readthedocs.io/en/latest/chain-info.html

```bash
./portaldot_dev --dev --tmp --ws-external --rpc-external --rpc-cors all
```

Wait until you see Imported #1.

### 4. Deploy ink! contracts

```bash
cd contracts
npm install @polkadot/api @polkadot/api-contract @polkadot/keyring dotenv
build-contracts.bat
node deploy.js
```

Copy the printed contract addresses into your .env.local.

### 5. Run the frontend

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
| Smart Contracts | ink! 4.x (Rust) |
| Frontend | Next.js 14, React 18 |
| Styling | Tailwind CSS + CSS Variables |
| Wallet | Polkadot{.js} extension |
| Storage | IPFS via Pinata |
| Privacy | ZKP (SHA-256 commitment scheme) |
| Deployment | Vercel |

---

## 🌍 Why Portaldot

Portaldot is the only Layer 0 chain with a native RWA platform, DEX, cross-chain bridge, and privacy layer built in. AssetDot uses all four natively.

The LAO NPoS consensus with hot-upgrade capability means AssetDot can evolve without hard forks. The Africa-first focus is intentional — the continent holds enormous illiquid wealth in real estate and commodities. AssetDot brings that wealth on-chain.

---

## 🗺️ Roadmap

- Q2 2026 — MVP on Portaldot testnet
- Q3 2026 — Mainnet deployment + KYC verifier onboarding
- Q4 2026 — Mobile app + institutional integrations
- Q1 2027 — Quantum-resistant proof upgrade

---

## 👤 Builder

Sharif — Builder / Product

---

## 📄 License

MIT
