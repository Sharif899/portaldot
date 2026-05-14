require("dotenv").config();
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { CodePromise } = require("@polkadot/api-contract");
const fs = require("fs");
const path = require("path");

const PORTALDOT_WS = process.env.PORTALDOT_WS || "ws://127.0.0.1:9944";

async function main() {
  console.log("\n🚀 PortalRWA Contract Deployment");
  console.log("================================\n");
  console.log(`Connecting to ${PORTALDOT_WS}...`);
  const provider = new WsProvider(PORTALDOT_WS);
  const api = await ApiPromise.create({ provider });
  const chain = await api.rpc.system.chain();
  console.log("✓ Connected to: " + chain + "\n");
  const keyring = new Keyring({ type: "sr25519" });
  const deployer = keyring.addFromUri("//Alice");
  console.log("Using Alice: " + deployer.address);
  const { data: balance } = await api.query.system.account(deployer.address);
  console.log("Balance: " + balance.free.toString() + "\n");
  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
