import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";

/**
 * useContract — generic hook for connecting to any deployed ink! contract
 *
 * This is the foundation all other contract hooks build on.
 * It handles:
 *   - Connecting to the Portaldot node via WebSocket
 *   - Loading the contract ABI + address
 *   - Providing a `query` function  (read-only, no gas)
 *   - Providing a `tx` function     (write, requires wallet signature)
 *
 * Usage:
 *   const { query, tx, isReady } = useContract(ADDRESS, ABI);
 *   const result = await query("balance_of", [accountId]);
 *   await tx("transfer", [recipient, amount]);
 */

import { PORTALDOT_WS } from "@/utils/constants";

export function useContract(contractAddress, abi) {
  const { selectedAccount } = useWallet();

  const [api,       setApi]       = useState(null);
  const [contract,  setContract]  = useState(null);
  const [isReady,   setIsReady]   = useState(false);
  const [error,     setError]     = useState(null);

  // ── Connect to Portaldot node and instantiate contract ────────
  useEffect(() => {
    if (!contractAddress || !abi) return;

    let isMounted = true;

    async function init() {
      try {
        // Dynamic imports — Polkadot.js only runs in the browser
        const { ApiPromise, WsProvider }      = await import("@polkadot/api");
        const { ContractPromise }             = await import("@polkadot/api-contract");

        const provider    = new WsProvider(PORTALDOT_WS);
        const _api        = await ApiPromise.create({ provider });
        const _contract   = new ContractPromise(_api, abi, contractAddress);

        if (isMounted) {
          setApi(_api);
          setContract(_contract);
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to connect to Portaldot node");
          console.error("[useContract] init error:", err);
        }
      }
    }

    init();

    // Cleanup: disconnect on unmount
    return () => {
      isMounted = false;
      if (api) api.disconnect();
    };
  }, [contractAddress, JSON.stringify(abi)]);

  // ── Query (read-only call) ─────────────────────────────────────
  // Does NOT require a wallet signature or gas
  // Returns the decoded result value
  const query = useCallback(
    async (methodName, args = []) => {
      if (!contract || !selectedAccount) {
        throw new Error("Contract not ready or wallet not connected");
      }

      // gasLimit for dry-run queries — use max available
      const gasLimit = api.registry.createType("WeightV2", {
        refTime:   BigInt("500000000000"),
        proofSize: BigInt("1000000"),
      });

      const { result, output } = await contract.query[methodName](
        selectedAccount.address,  // caller (used for access control checks)
        { gasLimit },
        ...args
      );

      if (result.isErr) {
        throw new Error(`Query failed: ${result.asErr.toString()}`);
      }

      // Decode and return the output value
      return output?.toJSON()?.ok ?? output?.toJSON();
    },
    [contract, api, selectedAccount]
  );

  // ── Transaction (write call) ───────────────────────────────────
  // Requires wallet signature — triggers extension popup
  // Returns a Promise that resolves when the tx is finalized
  const tx = useCallback(
    async (methodName, args = [], value = 0) => {
      if (!contract || !selectedAccount) {
        throw new Error("Contract not ready or wallet not connected");
      }

      const { web3FromAddress } = await import("@polkadot/extension-dapp");
      const injector = await web3FromAddress(selectedAccount.address);

      const gasLimit = api.registry.createType("WeightV2", {
        refTime:   BigInt("30000000000"),
        proofSize: BigInt("1000000"),
      });

      return new Promise((resolve, reject) => {
        contract.tx[methodName](
          { gasLimit, value },
          ...args
        )
          .signAndSend(
            selectedAccount.address,
            { signer: injector.signer },
            (result) => {
              if (result.status.isFinalized) {
                // Check for contract execution errors
                const failed = result.events.find(({ event }) =>
                  api.events.system.ExtrinsicFailed.is(event)
                );
                if (failed) {
                  reject(new Error("Transaction failed on-chain"));
                } else {
                  resolve(result);
                }
              }
              if (result.isError) {
                reject(new Error("Transaction error"));
              }
            }
          )
          .catch(reject);
      });
    },
    [contract, api, selectedAccount]
  );

  return { api, contract, isReady, error, query, tx };
}
