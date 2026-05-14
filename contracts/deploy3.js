require("dotenv").config();
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { cryptoWaitReady } = require("@polkadot/util-crypto");
const fs = require("fs");
const path = require("path");

const PORTALDOT_WS = process.env.PORTALDOT_WS || "ws://127.0.0.1:9944";

async function main() {
  await cryptoWaitReady();
  console.log("\n🚀 PortalRWA Deployment\n");
  const api = await ApiPromise.create({ provider: new WsProvider(PORTALDOT_WS) });
  await api.isReady;
  console.log(`✓ Connected: ${await api.rpc.system.chain()}`);

  const keyring = new Keyring({ type: "sr25519" });
  const deployer = keyring.addFromUri(process.env.DEPLOYER_MNEMONIC);
  console.log(`✓ Deployer: ${deployer.address}\n`);

  const zkpContract = JSON.parse(fs.readFileSync(path.join(__dirname, "zkp_verifier/target/ink/zkp_verifier.contract")));
  const wasm = zkpContract.source.wasm;

  // Find the new() constructor selector
  const constructor = zkpContract.spec.constructors.find(c => c.label === "new");
  const selector = constructor.selector;
  console.log(`Constructor selector: ${selector}`);

  console.log("Deploying ZkpVerifier...");

  await new Promise((resolve, reject) => {
    let unsub;
    api.tx.contracts.instantiateWithCode(
      0,
      50000000000,
      wasm,
      selector,
      "0x"
    ).signAndSend(deployer, (result) => {
      console.log(`  Status: ${result.status.type}`);
      if (result.status.isInBlock) {
        result.events.forEach(({ event }) => {
          console.log(`  Event: ${event.section}.${event.method}`);
          if (event.data) console.log(`  Data: ${event.data.toString()}`);
        });
        unsub();
        resolve();
      }
      if (result.isError) { unsub(); reject(new Error("Failed")); }
    }).then(u => unsub = u).catch(reject);
  });

  await api.disconnect();
  process.exit(0);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
