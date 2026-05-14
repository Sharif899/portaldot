require("dotenv").config();
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { CodePromise } = require("@polkadot/api-contract");
const fs = require("fs");
const path = require("path");

const PORTALDOT_WS = process.env.PORTALDOT_WS || "ws://127.0.0.1:9944";

function loadArtifact(contractName) {
  const artifactPath = path.join(__dirname, contractName, "target", "ink", `${contractName}.contract`);
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

async function deployContract(api, deployer, artifact, constructorArgs = []) {
  const code = new CodePromise(api, artifact, artifact.source.wasm);
  const gasLimit = 30000000000n;

  return new Promise((resolve, reject) => {
    const tx = api.tx.contracts.instantiateWithCode(
      0,
      gasLimit,
      null,
      Buffer.from(artifact.source.wasm, 'hex'),
      code.abi.constructors[0].toU8a(constructorArgs),
      null
    );

    let unsub;
    tx.signAndSend(deployer, (result) => {
      if (result.status.isInBlock) {
        console.log(`  ✓ In block: ${result.status.asInBlock}`);
      }
      if (result.status.isFinalized) {
        const event = result.events.find(
          ({ event }) => api.events.contracts.Instantiated.is(event)
        );
        if (event) {
          const address = event.event.data[1].toString();
          console.log(`  ✓ Address: ${address}`);
          unsub();
          resolve(address);
        } else {
          unsub();
          reject(new Error("No Instantiated event found"));
        }
      }
      if (result.isError) { unsub(); reject(new Error("TX failed")); }
    }).then(u => { unsub = u; }).catch(reject);
  });
}

async function main() {
  console.log("\n🚀 PortalRWA Deployment\n");
  const api = await ApiPromise.create({ provider: new WsProvider(PORTALDOT_WS) });
  await api.isReady;
  console.log(`✓ Connected: ${await api.rpc.system.chain()}`);
  console.log(`✓ Contracts pallet: ${Object.keys(api.tx.contracts).join(', ')}`);

  const keyring = new Keyring({ type: "sr25519" });
  const deployer = keyring.addFromUri(process.env.DEPLOYER_MNEMONIC);
  console.log(`✓ Deployer: ${deployer.address}\n`);

  console.log("1/2 Deploying ZkpVerifier...");
  const zkp = await deployContract(api, deployer, loadArtifact("zkp_verifier"), []);
  console.log(`✅ ZkpVerifier: ${zkp}\n`);

  console.log("2/2 Deploying Marketplace...");
  const mkt = await deployContract(api, deployer, loadArtifact("marketplace"), [250]);
  console.log(`✅ Marketplace: ${mkt}\n`);

  console.log("🎉 Done!");
  await api.disconnect();
  process.exit(0);
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
