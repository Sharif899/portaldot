//! # PortalRWA ZKP Verifier Contract
//!
//! This contract implements privacy-preserving asset verification.
//!
//! ## The problem it solves
//! When you tokenize a real-world asset, investors need to know the asset is real.
//! But you don't want to expose sensitive legal documents publicly on-chain.
//!
//! ## How ZKP works here (simplified)
//! 1. User uploads their document to IPFS (stored encrypted)
//! 2. Frontend generates a SHA-256 hash of the document contents
//! 3. That hash is submitted to this contract as a "proof commitment"
//! 4. The hash is stored on-chain — it PROVES the document existed at this moment
//!    without revealing what's inside the document
//! 5. Anyone can verify the asset is backed by a real document by checking
//!    that the hash matches — without seeing the document itself
//!
//! ## Verification flow
//! - Asset owner: submit_proof(asset_id, document_hash)
//! - Verifier/investor: verify_proof(asset_id, document_hash) → true/false
//! - Anyone: get_proof_status(asset_id) → Verified | Pending | Revoked

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod zkp_verifier {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    // ─── Proof status ─────────────────────────────────────────
    #[derive(Debug, Clone, PartialEq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum ProofStatus {
        Pending,   // Submitted but not yet verified by a verifier
        Verified,  // Confirmed valid by an authorized verifier
        Revoked,   // Was valid but has been revoked (document changed, fraud)
    }

    // ─── Proof record ─────────────────────────────────────────
    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct ProofRecord {
        pub asset_id:       AccountId,  // The RWA token contract address
        pub submitter:      AccountId,  // Who submitted the proof
        pub document_hash:  [u8; 32],   // SHA-256 hash of the legal document
        pub ipfs_cid:       String,     // IPFS CID (encrypted doc location)
        pub asset_type:     u8,         // 0=Property 1=Commodity 2=Invoice
        pub status:         ProofStatus,
        pub submitted_at:   u64,        // Block timestamp of submission
        pub verified_at:    Option<u64>,// When it was verified (if ever)
        pub verifier:       Option<AccountId>, // Who verified it
        pub notes:          String,     // Optional verification notes
    }

    // ─── Events ───────────────────────────────────────────────

    #[ink(event)]
    pub struct ProofSubmitted {
        #[ink(topic)]
        asset_id:      AccountId,
        #[ink(topic)]
        submitter:     AccountId,
        document_hash: [u8; 32],
    }

    #[ink(event)]
    pub struct ProofVerified {
        #[ink(topic)]
        asset_id: AccountId,
        #[ink(topic)]
        verifier: AccountId,
    }

    #[ink(event)]
    pub struct ProofRevoked {
        #[ink(topic)]
        asset_id: AccountId,
        reason:   String,
    }

    #[ink(event)]
    pub struct VerifierAdded {
        #[ink(topic)]
        verifier: AccountId,
    }

    // ─── Errors ───────────────────────────────────────────────
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        ProofNotFound,       // No proof submitted for this asset
        ProofAlreadyExists,  // Asset already has a proof — use update
        NotAuthorizedVerifier, // Only whitelisted verifiers can verify
        NotOwner,            // Only contract owner can manage verifiers
        AlreadyVerified,     // Cannot re-verify an already verified proof
        AlreadyRevoked,      // Cannot revoke an already revoked proof
        HashMismatch,        // Submitted hash doesn't match stored hash
        InvalidHash,         // All-zero hash is not valid
    }

    pub type Result<T> = core::result::Result<T, Error>;

    // ─── Storage ──────────────────────────────────────────────
    #[ink(storage)]
    pub struct ZkpVerifier {
        owner:       AccountId,
        // Map: asset_id (token contract address) → proof record
        proofs:      Mapping<AccountId, ProofRecord>,
        // Whitelist of authorized verifiers
        // In production: these would be KYC/legal firms
        verifiers:   Mapping<AccountId, bool>,
        // Count of total proofs submitted
        proof_count: u64,
    }

    impl ZkpVerifier {
        // ─── Constructor ──────────────────────────────────────
        /// Deploy the ZKP verifier.
        /// The deployer (owner) is automatically added as a verifier.
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller = Self::env().caller();
            let mut verifiers = Mapping::default();
            // Owner starts as an authorized verifier
            verifiers.insert(caller, &true);
            Self {
                owner: caller,
                proofs: Mapping::default(),
                verifiers,
                proof_count: 0,
            }
        }

        // ─── Submit a proof ───────────────────────────────────
        /// Asset owner calls this after tokenizing an asset.
        /// Stores the document hash on-chain without revealing the document.
        ///
        /// # Arguments
        /// * `asset_id`      — The RWA token contract address
        /// * `document_hash` — SHA-256 hash of the legal document (32 bytes)
        /// * `ipfs_cid`      — IPFS location of the encrypted document
        /// * `asset_type`    — 0=Property 1=Commodity 2=Invoice
        #[ink(message)]
        pub fn submit_proof(
            &mut self,
            asset_id:      AccountId,
            document_hash: [u8; 32],
            ipfs_cid:      String,
            asset_type:    u8,
            notes:         String,
        ) -> Result<()> {
            // Reject all-zero hash — meaningless proof
            if document_hash == [0u8; 32] {
                return Err(Error::InvalidHash);
            }
            // One proof per asset
            if self.proofs.contains(asset_id) {
                return Err(Error::ProofAlreadyExists);
            }

            let submitter = self.env().caller();
            let record = ProofRecord {
                asset_id,
                submitter,
                document_hash,
                ipfs_cid,
                asset_type,
                status:       ProofStatus::Pending,
                submitted_at: self.env().block_timestamp(),
                verified_at:  None,
                verifier:     None,
                notes,
            };

            self.proofs.insert(asset_id, &record);
            self.proof_count += 1;

            self.env().emit_event(ProofSubmitted {
                asset_id,
                submitter,
                document_hash,
            });

            Ok(())
        }

        // ─── Verify a proof ───────────────────────────────────
        /// Called by an authorized verifier to confirm a proof is valid.
        /// In production: a legal firm checks the real document matches the hash.
        #[ink(message)]
        pub fn verify_proof(
            &mut self,
            asset_id: AccountId,
            notes:    String,
        ) -> Result<()> {
            let verifier = self.env().caller();

            // Only whitelisted verifiers
            if !self.verifiers.get(verifier).unwrap_or(false) {
                return Err(Error::NotAuthorizedVerifier);
            }

            let mut record = self.proofs
                .get(asset_id)
                .ok_or(Error::ProofNotFound)?;

            if record.status == ProofStatus::Verified {
                return Err(Error::AlreadyVerified);
            }
            if record.status == ProofStatus::Revoked {
                return Err(Error::AlreadyRevoked);
            }

            record.status      = ProofStatus::Verified;
            record.verified_at = Some(self.env().block_timestamp());
            record.verifier    = Some(verifier);
            record.notes       = notes;

            self.proofs.insert(asset_id, &record);

            self.env().emit_event(ProofVerified { asset_id, verifier });

            Ok(())
        }

        // ─── Check a proof ────────────────────────────────────
        /// Anyone can call this to verify an asset's proof.
        /// Returns true if the hash matches AND status is Verified.
        /// This is what investors call before buying fractions.
        #[ink(message)]
        pub fn check_proof(
            &self,
            asset_id:      AccountId,
            document_hash: [u8; 32],
        ) -> Result<bool> {
            let record = self.proofs
                .get(asset_id)
                .ok_or(Error::ProofNotFound)?;

            // Hash must match AND be verified
            Ok(record.document_hash == document_hash
                && record.status == ProofStatus::Verified)
        }

        // ─── Revoke a proof ───────────────────────────────────
        /// Verifier can revoke a proof (e.g. document found to be fraudulent)
        #[ink(message)]
        pub fn revoke_proof(
            &mut self,
            asset_id: AccountId,
            reason:   String,
        ) -> Result<()> {
            if !self.verifiers.get(self.env().caller()).unwrap_or(false) {
                return Err(Error::NotAuthorizedVerifier);
            }

            let mut record = self.proofs
                .get(asset_id)
                .ok_or(Error::ProofNotFound)?;

            if record.status == ProofStatus::Revoked {
                return Err(Error::AlreadyRevoked);
            }

            record.status = ProofStatus::Revoked;
            self.proofs.insert(asset_id, &record);

            self.env().emit_event(ProofRevoked {
                asset_id,
                reason,
            });

            Ok(())
        }

        // ─── Read functions ───────────────────────────────────

        /// Get the full proof record for an asset
        #[ink(message)]
        pub fn get_proof(&self, asset_id: AccountId) -> Option<ProofRecord> {
            self.proofs.get(asset_id)
        }

        /// Get just the status of a proof
        #[ink(message)]
        pub fn get_proof_status(&self, asset_id: AccountId) -> Option<ProofStatus> {
            self.proofs.get(asset_id).map(|r| r.status)
        }

        /// Check if an account is an authorized verifier
        #[ink(message)]
        pub fn is_verifier(&self, account: AccountId) -> bool {
            self.verifiers.get(account).unwrap_or(false)
        }

        /// Total number of proofs submitted
        #[ink(message)]
        pub fn proof_count(&self) -> u64 {
            self.proof_count
        }

        // ─── Owner: manage verifiers ──────────────────────────

        /// Add an authorized verifier (owner only)
        /// e.g. add a KYC firm's wallet address
        #[ink(message)]
        pub fn add_verifier(&mut self, verifier: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }
            self.verifiers.insert(verifier, &true);
            self.env().emit_event(VerifierAdded { verifier });
            Ok(())
        }

        /// Remove a verifier (owner only)
        #[ink(message)]
        pub fn remove_verifier(&mut self, verifier: AccountId) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }
            self.verifiers.insert(verifier, &false);
            Ok(())
        }
    }
}
