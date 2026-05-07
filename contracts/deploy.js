/**
 * PortalRWA Contract Deployment Script
 *
 * Deploys all 3 contracts to the Portaldot testnet in order:
 * 1. ZkpVerifier  — deployed first (no dependencies)
 * 2. Marketplace  — deployed second (no dependencies)
 * 3. RwaToken     — deployed per-asset (depends on above two addresses)
 *
 * Usage:
 *   node deploy.js
 *
 * Requirements:
 *   npm install @polkadot/api @polkadot/api-contract @polkadot/keyring
 *
 * Before running:
 *   1. Compile contracts: run build-contracts.bat (Windows) or build-contracts.sh
 *   2. Set your DEPLOYER_MNEMONIC in a .env file (NEVER commit this)
 *   3. Make sure your account has testnet POT tokens
 */

require("dotenv").config();
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { CodePromise, ContractPromise }    = require("@polkadot/api-contract");
const fs   = require("fs");
const path = require("path");

// ─── Config ───────────────────────────────────────────────────
// Replace with Portaldot's actual testnet WebSocket endpoint
const PORTALDOT_WS = process.env.PORTALDOT_WS || "wss://testnet.portaldot.world";

// ─── Load contract artifacts ──────────────────────────────────
// After running cargo contract build, these files appear in target/ink/
function loadArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    contractName,
    "target",
    "ink",
    `${contractName}.contract`
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found: ${artifactPath}\n` +
      `Run: cd contracts/${contractName} && cargo contract build`
    );
  }
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

// ─── Deploy a single contract ─────────────────────────────────
async function deployContract(api, deployer, artifact, constructorArgs = []) {
  const code = new CodePromise(api, artifact, artifact.source.wasm);

  return new Promise((resolve, reject) => {
    // gasLimit — adjust based on contract complexity
    const gasLimit = api.registry.createType("WeightV2", {
      refTime:   30_000_000_000n,
      proofSize: 1_000_000n,
    });

    // storageDepositLimit — null means use chain default
    const tx = code.tx.new(
      { gasLimit, storageDepositLimit: null },
      ...constructorArgs
    );

    let unsub;
    tx.signAndSend(deployer, (result) => {
      if (result.status.isInBlock) {
        console.log(`  ✓ In block: ${result.status.asInBlock.toString()}`);
      }
      if (result.status.isFinalized) {
        // Find the instantiation event to get the contract address
        const instantiateEvent = result.events.find(
          ({ event }) => api.events.contracts.Instantiated.is(event)
        );
        if (instantiateEvent) {
          const contractAddress = instantiateEvent.event.data[1].toString();
          console.log(`  ✓ Contract address: ${contractAddress}`);
          unsub();
          resolve(contractAddress);
        } else {
          unsub();
          reject(new Error("Instantiation event not found"));
        }
      }
      if (result.isError) {
        unsub();
        reject(new Error("Transaction failed"));
      }
    }).then((u) => { unsub = u; }).catch(reject);
  });
}

// ─── Main deployment ──────────────────────────────────────────
async function main() {
  console.log("\n🚀 PortalRWA Contract Deployment");
  console.log("================================\n");

  // Connect to Portaldot node
  console.log(`Connecting to ${PORTALDOT_WS}...`);
  const provider = new WsProvider(PORTALDOT_WS);
  const api      = await ApiPromise.create({ provider });
  const chain    = await api.rpc.system.chain();
  console.log(`✓ Connected to: ${chain}\n`);

  // Load deployer account from mnemonic
  const keyring  = new Keyring({ type: "sr25519" });
  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) {
    throw new Error(
      "DEPLOYER_MNEMONIC not set in .env file.\n" +
      "Create a .env file with: DEPLOYER_MNEMONIC=your twelve word phrase here"
    );
  }
  const deployer = keyring.addFromMnemonic(mnemonic);
  console.log(`Deployer: ${deployer.address}\n`);

  const addresses = {};

  // ── 1. Deploy ZKP Verifier ─────────────────────────────────
  console.log("1/2 Deploying ZkpVerifier...");
  try {
    const zkpArtifact = loadArtifact("zkp_verifier");
    // Constructor: new() — no arguments
    addresses.zkpVerifier = await deployContract(api, deployer, zkpArtifact, []);
    console.log(`  ZkpVerifier deployed!\n`);
  } catch (err) {
    console.error("  ZkpVerifier deployment failed:", err.message);
    process.exit(1);
  }

  // ── 2. Deploy Marketplace ──────────────────────────────────
  console.log("2/2 Deploying Marketplace...");
  try {
    const marketArtifact = loadArtifact("marketplace");
    // Constructor: new(platform_fee_bp: u32)
    // 100 basis points = 1% platform fee
    addresses.marketplace = await deployContract(
      api, deployer, marketArtifact, [100]
    );
    console.log(`  Marketplace deployed!\n`);
  } catch (err) {
    console.error("  Marketplace deployment failed:", err.message);
    process.exit(1);
  }

  // ── Save addresses ─────────────────────────────────────────
  const outputPath = path.join(__dirname, "..", "utils", "constants.js");
  const output = `// AUTO-GENERATED by deploy.js — do not edit manually
// Last deployed: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  zkpVerifier: "${addresses.zkpVerifier}",
  marketplace:  "${addresses.marketplace}",
  // RWA token contracts are deployed dynamically per asset
};

export const PORTALDOT_WS = "${PORTALDOT_WS}";
`;

  // Make sure utils directory exists
  const utilsDir = path.join(__dirname, "..", "utils");
  if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir, { recursive: true });
  fs.writeFileSync(outputPath, output);

  console.log("✅ Deployment complete!");
  console.log("─────────────────────────────────");
  console.log("Contract addresses:");
  console.log(`  ZKP Verifier: ${addresses.zkpVerifier}`);
  console.log(`  Marketplace:  ${addresses.marketplace}`);
  console.log(`\nAddresses saved to: utils/constants.js`);
  console.log("\nNext step: Update your .env.local with these addresses");
  console.log("Then run: npm run dev\n");

  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Deployment failed:", err.message);
  process.exit(1);
});
