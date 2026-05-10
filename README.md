# PortalRWA — Real-World Asset Tokenization on Portaldot

> **Portaldot Online Mini Hackathon S1 Submission**
> Built natively on the Portaldot Layer 0 blockchain using ink! smart contracts.

---

## 🌍 The Problem

Trillions of dollars in real-world assets — property, commodities, and invoices — remain illiquid, inaccessible, and siloed in emerging markets like Africa. Small investors cannot participate. Asset owners cannot unlock capital. There is no trusted, transparent infrastructure to bridge physical assets and global liquidity.

## ⚡ The Solution

**PortalRWA** is a no-code platform that lets anyone tokenize a real-world asset on Portaldot in under 5 minutes:

- Upload legal document to **IPFS**
- Generate a **ZKP proof** (proves document exists without revealing it)
- Mint an **ink! token** on the Portaldot chain
- Trade fractions via **iSwap DEX** integration
- Bridge cross-chain via **iBridge**
- Verify ownership privately via **ZKP proofs**

---

## 🎥 Demo Video

> **[Watch Demo Video](https://youtube.com/YOUR_DEMO_LINK)**

---

## 🔴 Live Demo

> **[https://portaldot.vercel.app](https://portaldot.vercel.app)**

---

## 🚀 Run Locally (For Judges)

### Step 1 — Clone the repo

```bash
git clone https://github.com/Sharif899/portaldot.git
cd portaldot
```

### Step 2 — Install frontend dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
NEXT_PUBLIC_PORTALDOT_WS=ws://127.0.0.1:9944
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET=your_pinata_secret
NEXT_PUBLIC_ZKP_VERIFIER=5PLACEHOLDER
NEXT_PUBLIC_MARKETPLACE=5PLACEHOLDER
```

> Get free Pinata keys at [pinata.cloud](https://pinata.cloud) — needed for IPFS document uploads.

### Step 4 — Start the Portaldot local node

Download the Portaldot dev node from the official docs:
> https://portaldot-dev.readthedocs.io/en/latest/chain-info.html

Then run:

```bash
# Ubuntu/Linux
./portaldot_dev --dev --tmp --ws-external --rpc-external --rpc-cors all

# Windows (WSL recommended)
./portaldot_dev --dev --tmp --ws-external --rpc-external --rpc-cors all
```

Wait until you see `Imported #1` — node is running.

### Step 5 — Deploy the ink! contracts

```bash
cd contracts

# Install dependencies
npm install @polkadot/api @polkadot/api-contract @polkadot/keyring dotenv

# Build contracts (requires cargo-contract)
# Windows:
build-contracts.bat
# Linux/Mac:
chmod +x build-contracts.sh && ./build-contracts.sh

# Deploy to local node
node deploy.js
```

> **Note:** Contracts use Alice's account (pre-funded on dev node) for deployment. No tokens needed.

After deployment, copy the printed contract addresses into your `.env.local`.

### Step 6 — Run the frontend

```bash
# Go back to root
cd ..

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
portaldot/
├── components/
│   ├── layout/         Navbar, Sidebar, Footer
│   └── ui/             Button, Modal, AssetCard, ThemeToggle, WalletButton
├── context/
│   ├── ThemeContext     Dark/light mode
│   └── WalletContext    Polkadot wallet connection
├── contracts/
│   ├── rwa_token/       PSP22 RWA token contract (ink!)
│   ├── marketplace/     Fractional trading contract (ink!)
│   ├── zkp_verifier/    ZKP proof verification contract (ink!)
│   ├── deploy.js        Deployment script
│   └── build-contracts.bat
├── hooks/               React hooks for blockchain interaction
├── pages/               6 pages — home, tokenize, dashboard, marketplace, bridge, privacy
├── public/
│   └── mock-data.json   Demo data
├── styles/
│   └── globals.css      Design system
└── utils/               Constants, formatters, IPFS utilities
```

---

## 🏗️ Architecture

```
PortalRWA
├── Frontend     Next.js 14 + React + Tailwind CSS
├── Wallet       Polkadot{.js} extension
├── Contracts    ink! 4.x on Portaldot chain
│   ├── rwa_token      — PSP22 token + RWA metadata
│   ├── marketplace    — Fractional trading + escrow
│   └── zkp_verifier   — Privacy-preserving proof verification
├── Storage      IPFS via Pinata
└── Chain        Portaldot Layer 0 (LAO NPoS consensus)
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

## 💡 Key Features

| Feature | Description |
|---|---|
| 🏠 **Tokenize** | Upload document to IPFS, generate ZKP hash, mint RWA token on Portaldot |
| 📊 **Dashboard** | Portfolio overview — values, fractions, activity feed |
| 🛒 **Marketplace** | Buy and sell fractions via iSwap DEX integration |
| 🌉 **Bridge** | Cross-chain transfers via Portaldot iBridge |
| 🔒 **ZKP Privacy** | Prove asset is real without revealing legal documents |

---

## 🌍 Why Portaldot

Portaldot is the only L0 chain with a **native RWA platform, DEX, cross-chain bridge, and privacy layer** in one ecosystem. PortalRWA uses all four natively.

The **LAO NPoS consensus** with hot-upgrade capability means PortalRWA can evolve without hard forks.

---

## 🗺️ Roadmap

- **Q1 2026** — MVP on Portaldot testnet ✅
- **Q2 2026** — Mainnet deployment + KYC verifier onboarding
- **Q3 2026** — Mobile app + institutional integrations
- **Q4 2026** — Quantum-resistant proof upgrade

---

## 👤 Builder

Built by **Sharif899** for **Portaldot Online Mini Hackathon S1**
Category: Builder / Product

---

## 📄 License

MIT — built for the Portaldot ecosystem.
