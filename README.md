# PortalRWA — Real-World Asset Tokenization on Portaldot

> **Portaldot Hackathon 2025 Submission**
> Built natively on the Portaldot Layer 0 blockchain using ink! smart contracts, iSwap DEX integration, iBridge cross-chain, and ZKP privacy.

---

## 🌍 The Problem

Trillions of dollars in real-world assets — property, commodities, and invoices — remain illiquid, inaccessible, and siloed in emerging markets. Small investors cannot participate. Asset owners cannot unlock capital. There is no trusted, transparent infrastructure to bridge physical assets and global liquidity.

## ⚡ The Solution

**PortalRWA** is a no-code platform that lets anyone tokenize a real-world asset on Portaldot in under 5 minutes. Once tokenized:

- Fractions trade on the **iSwap DEX** integration
- Assets bridge cross-chain via **iBridge**
- Ownership is verified privately via **ZKP proofs**
- Everything is governed on-chain via **LAO NPoS**

---

## 🔴 Live Demo

> **[https://portalrwa.vercel.app](https://portalrwa.vercel.app)**

---

## 📸 Features

| Feature | Description |
|---|---|
| 🏠 **Tokenize** | Upload document to IPFS, generate ZKP hash, mint RWA token |
| 📊 **Dashboard** | Portfolio overview — values, fractions, activity feed |
| 🛒 **Marketplace** | Buy and sell fractions via iSwap DEX integration |
| 🌉 **Bridge** | Cross-chain transfers via Portaldot iBridge |
| 🔒 **ZKP Privacy** | Prove asset is real without revealing legal documents |

---

## 🏗️ Architecture

```
PortalRWA
├── Frontend          Next.js 14 + React + Tailwind CSS
├── Wallet            Polkadot{.js} extension
├── Smart Contracts   ink! (Rust) on Portaldot chain
│   ├── rwa_token     PSP22 token + RWA metadata
│   ├── marketplace   Fractional trading + escrow
│   └── zkp_verifier  Privacy-preserving proof verification
├── Storage           IPFS via Pinata
└── Chain             Portaldot Layer 0 (LAO NPoS consensus)
```

---

## 🔗 Deployed Contracts (Portaldot Testnet)

| Contract | Address |
|---|---|
| ZKP Verifier | `5REPLACE_AFTER_DEPLOY` |
| Marketplace  | `5REPLACE_AFTER_DEPLOY` |

> RWA token contracts are deployed per-asset at tokenization time.

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- Rust + cargo-contract v5+
- Polkadot{.js} browser extension

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/portalrwa.git
cd portalrwa
npm install
```

### 2. Set environment variables
```bash
cp .env.local.example .env.local
# Fill in your Pinata API keys and contract addresses
```

### 3. Build smart contracts
```bash
cd contracts
build-contracts.bat        # Windows
# or
chmod +x build-contracts.sh && ./build-contracts.sh  # Mac/Linux
```

### 4. Deploy contracts to testnet
```bash
node deploy.js
# Contract addresses are saved to utils/constants.js automatically
```

### 5. Run the frontend
```bash
cd ..
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
portalrwa/
├── components/
│   ├── layout/         Navbar, Sidebar, Footer
│   └── ui/             Button, Modal, AssetCard, ThemeToggle, WalletButton
├── context/
│   ├── ThemeContext     Dark/light mode (persisted)
│   └── WalletContext    Polkadot wallet connection
├── contracts/
│   ├── rwa_token/       Core RWA PSP22 token contract (ink!)
│   ├── marketplace/     Fractional trading contract (ink!)
│   ├── zkp_verifier/    ZKP proof contract (ink!)
│   ├── deploy.js        Deployment script
│   └── build-contracts.bat
├── hooks/
│   ├── useContract      Generic ink! contract hook
│   ├── useRwaToken      RWA token interactions
│   ├── useMarketplace   Marketplace interactions
│   ├── useIPFS          IPFS upload via Pinata
│   └── useZKP           ZKP hash generation + verification
├── pages/
│   ├── index            Landing page
│   ├── tokenize         4-step asset tokenization wizard
│   ├── dashboard        Portfolio overview
│   ├── marketplace      Browse and trade fractions
│   ├── bridge           Cross-chain via iBridge
│   └── privacy          ZKP proof submission + verification
├── public/
│   └── mock-data.json   Demo data for judging
├── styles/
│   └── globals.css      Design system (dark/light CSS variables)
└── utils/
    ├── constants         Contract addresses, chain config, enums
    ├── formatters        Display formatting functions
    └── ipfs              Pinata API utilities
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Portaldot Layer 0 (LAO NPoS) |
| Smart Contracts | ink! 5.1 (Rust) |
| Frontend | Next.js 14, React 18 |
| Styling | Tailwind CSS + CSS Variables |
| Wallet | Polkadot{.js} extension |
| Storage | IPFS via Pinata |
| Privacy | ZKP (SHA-256 commitment scheme) |
| Deployment | Vercel |

---

## 🌍 Why Portaldot

Portaldot is the only L0 chain with a **native RWA platform, DEX, cross-chain bridge, and privacy layer** in one ecosystem. PortalRWA is the user-facing product that makes all four work together seamlessly.

The **LAO NPoS consensus** with hot-upgrade capability means PortalRWA can evolve without hard forks — critical for a financial product that needs regulatory flexibility.

The **emerging market focus** (Nigeria, Ghana, Kenya) is intentional. Africa holds enormous illiquid wealth in real estate, agricultural commodities, and trade finance. PortalRWA unlocks that wealth on-chain.

---

## 🗺️ Roadmap

- **Q1 2025** — MVP launch on Portaldot testnet ✅
- **Q2 2025** — Mainnet deployment + KYC verifier onboarding
- **Q3 2025** — Mobile app + institutional asset manager integrations
- **Q4 2025** — Quantum-resistant proof upgrade via Portaldot hot-upgrade

---

## 👤 Builder

Built by **Sharif899** for the **Portaldot Hackathon 2025**
Category: Builder / Product
GitHub: [@Sharif899](https://github.com/Sharif899)

---

## 📄 License

MIT — built for the Portaldot ecosystem.

---

*Built with ink!, Next.js, and the belief that real-world assets belong on-chain.*
