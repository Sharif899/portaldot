import { useState, useCallback } from "react";
import { useContract } from "@/hooks/useContract";
import { CONTRACT_ADDRESSES } from "@/utils/constants";

/**
 * useZKP — hook for generating and verifying zero-knowledge proofs
 *
 * How it works:
 *   1. User uploads document to IPFS (handled by useIPFS)
 *   2. This hook reads the file and generates a SHA-256 hash
 *   3. That hash is submitted to the zkp_verifier contract on-chain
 *   4. Anyone can later call verifyProof() to confirm the asset
 *      is backed by a real document — without seeing the document
 *
 * Methods:
 *   generateHash(file)           → SHA-256 hash of a File object
 *   submitProof(params)          → store hash on-chain
 *   verifyProof(assetId, hash)   → check if proof is valid on-chain
 *   getProof(assetId)            → get full proof record
 *   getProofStatus(assetId)      → Pending | Verified | Revoked
 *
 * Usage:
 *   const { generateHash, submitProof, verifyProof } = useZKP();
 *   const hash = await generateHash(file);
 *   await submitProof({ assetId, hash, ipfsCid, assetType });
 */

const ZKP_VERIFIER_ABI = {
  source: {},
  contract: { name: "zkp_verifier", version: "0.1.0" },
  spec: {
    messages: [
      { label: "submit_proof",      selector: "0x1a2b3c4d", args: [{ type: "AccountId" }, { type: "[u8;32]" }, { type: "String" }, { type: "u8" }, { type: "String" }], returnType: { type: "Result" } },
      { label: "verify_proof",      selector: "0x2b3c4d5e", args: [{ type: "AccountId" }, { type: "String" }], returnType: { type: "Result" } },
      { label: "check_proof",       selector: "0x3c4d5e6f", args: [{ type: "AccountId" }, { type: "[u8;32]" }], returnType: { type: "Result<bool>" } },
      { label: "revoke_proof",      selector: "0x4d5e6f7a", args: [{ type: "AccountId" }, { type: "String" }], returnType: { type: "Result" } },
      { label: "get_proof",         selector: "0x5e6f7a8b", args: [{ type: "AccountId" }], returnType: { type: "Option<ProofRecord>" } },
      { label: "get_proof_status",  selector: "0x6f7a8b9c", args: [{ type: "AccountId" }], returnType: { type: "Option<ProofStatus>" } },
      { label: "is_verifier",       selector: "0x7a8b9c0d", args: [{ type: "AccountId" }], returnType: { type: "bool" } },
      { label: "proof_count",       selector: "0x8b9c0d1e", args: [],                       returnType: { type: "u64" } },
    ],
  },
};

export function useZKP() {
  const { query, tx, isReady, error } = useContract(
    CONTRACT_ADDRESSES.zkpVerifier,
    ZKP_VERIFIER_ABI
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying,  setIsVerifying]  = useState(false);
  const [txError,      setTxError]      = useState(null);

  // ── Generate SHA-256 hash from a File ─────────────────────────
  // This runs entirely in the browser — no server needed
  // Web Crypto API is available in all modern browsers
  const generateHash = useCallback(async (file) => {
    setIsGenerating(true);
    setTxError(null);

    try {
      // Read file as ArrayBuffer
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsArrayBuffer(file);
      });

      // SHA-256 via Web Crypto API (built into all browsers)
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

      // Convert ArrayBuffer → Uint8Array → hex string
      const hashArray  = Array.from(new Uint8Array(hashBuffer));
      const hashHex    = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      // Also return as [u8; 32] array for the ink! contract
      const hashBytes  = new Uint8Array(hashBuffer);

      return {
        hex:   hashHex,           // "a3f8e9b2c1d4..." — for display
        bytes: Array.from(hashBytes), // [163, 248, ...] — for contract call
      };
    } catch (err) {
      setTxError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // ── Generate hash from text (for testing) ─────────────────────
  const generateHashFromText = useCallback(async (text) => {
    const encoder = new TextEncoder();
    const data    = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    return {
      hex:   hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""),
      bytes: hashArray,
    };
  }, []);

  // ── Submit proof to zkp_verifier contract ─────────────────────
  const submitProof = useCallback(async ({
    assetId,    // AccountId — the RWA token contract address
    hashBytes,  // [u8; 32] — from generateHash()
    ipfsCid,    // string   — IPFS CID of the document
    assetType,  // u8       — 0=Property 1=Commodity 2=Invoice
    notes = "", // string   — optional notes
  }) => {
    setIsSubmitting(true);
    setTxError(null);

    try {
      const result = await tx("submit_proof", [
        assetId,
        hashBytes,
        ipfsCid,
        assetType,
        notes,
      ]);
      return result;
    } catch (err) {
      setTxError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [tx]);

  // ── Check if a proof is valid (anyone can call this) ──────────
  // Returns true if hash matches AND status is Verified
  const checkProof = useCallback(async (assetId, hashBytes) => {
    setIsVerifying(true);
    setTxError(null);

    try {
      const result = await query("check_proof", [assetId, hashBytes]);
      return result === true || result?.ok === true;
    } catch (err) {
      setTxError(err.message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [query]);

  // ── Get full proof record for an asset ────────────────────────
  const getProof = useCallback(async (assetId) => {
    try {
      return await query("get_proof", [assetId]);
    } catch (err) {
      console.error("[useZKP] getProof:", err);
      return null;
    }
  }, [query]);

  // ── Get just the proof status ──────────────────────────────────
  // Returns: "Pending" | "Verified" | "Revoked" | null
  const getProofStatus = useCallback(async (assetId) => {
    try {
      return await query("get_proof_status", [assetId]);
    } catch (err) {
      console.error("[useZKP] getProofStatus:", err);
      return null;
    }
  }, [query]);

  // ── Get total proof count ─────────────────────────────────────
  const getProofCount = useCallback(async () => {
    try {
      return await query("proof_count", []);
    } catch (err) {
      return 0;
    }
  }, [query]);

  // ── Check if an address is an authorized verifier ─────────────
  const isVerifier = useCallback(async (address) => {
    try {
      return await query("is_verifier", [address]);
    } catch (err) {
      return false;
    }
  }, [query]);

  return {
    isReady,
    isGenerating,
    isSubmitting,
    isVerifying,
    error: error || txError,
    // Hash generation (browser-side, no chain needed)
    generateHash,
    generateHashFromText,
    // On-chain interactions
    submitProof,
    checkProof,
    getProof,
    getProofStatus,
    getProofCount,
    isVerifier,
  };
}
