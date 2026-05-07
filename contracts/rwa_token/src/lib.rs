//! # PortalRWA Token Contract
//!
//! This is the core contract for PortalRWA. It does two things:
//!
//! 1. **PSP22 token** — the Polkadot equivalent of ERC-20. Every tokenized
//!    real-world asset gets its own instance of this contract deployed on-chain.
//!
//! 2. **RWA metadata** — stores asset type (Property/Commodity/Invoice),
//!    asset value in USD, IPFS document CID, ZKP proof hash, and owner info.
//!
//! ## How it works in PortalRWA
//! When a user tokenizes an asset on the frontend:
//!   1. Their document is uploaded to IPFS → returns a CID
//!   2. A ZKP hash is generated from the document
//!   3. This contract is deployed with the metadata + initial token supply
//!   4. The owner receives all tokens representing fractional ownership
//!   5. They can then list fractions on the Marketplace contract

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod rwa_token {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    // ─── Asset type enum ──────────────────────────────────────
    // Represents the three supported real-world asset categories
    #[derive(Debug, Clone, PartialEq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum AssetType {
        Property,   // Real estate — land, buildings, apartments
        Commodity,  // Physical goods — gold, oil, grain, timber
        Invoice,    // Receivables — unpaid invoices, trade finance
    }

    // ─── Asset status enum ────────────────────────────────────
    #[derive(Debug, Clone, PartialEq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub enum AssetStatus {
        Active,   // Fully tokenized and tradeable
        Pending,  // Awaiting verification
        Frozen,   // Temporarily locked (dispute, compliance)
    }

    // ─── RWA Metadata struct ──────────────────────────────────
    // Stored on-chain for every tokenized asset
    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct AssetMetadata {
        pub asset_type:    AssetType,    // Property | Commodity | Invoice
        pub asset_name:    String,       // e.g. "Lagos Island Apartment Block A"
        pub asset_value:   u128,         // USD value in cents (avoid floats)
        pub ipfs_cid:      String,       // IPFS content ID of the legal document
        pub zkp_hash:      [u8; 32],     // ZKP proof hash — proves doc exists without revealing it
        pub location:      String,       // Physical location or jurisdiction
        pub status:        AssetStatus,  // Current status of the asset
        pub created_at:    u64,          // Block timestamp of tokenization
        pub total_fractions: u128,       // Total token supply = total fractions
    }

    // ─── Events ───────────────────────────────────────────────
    // Events are emitted to the chain log — frontends listen for these

    /// Emitted when tokens are transferred between accounts
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from:  Option<AccountId>,
        #[ink(topic)]
        to:    Option<AccountId>,
        value: Balance,
    }

    /// Emitted when an account approves another to spend on its behalf
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner:   AccountId,
        #[ink(topic)]
        spender: AccountId,
        value:   Balance,
    }

    /// Emitted when asset status changes
    #[ink(event)]
    pub struct StatusChanged {
        #[ink(topic)]
        asset:      AccountId,  // This contract's address
        new_status: AssetStatus,
    }

    // ─── Error types ──────────────────────────────────────────
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InsufficientBalance,     // Not enough tokens to transfer
        InsufficientAllowance,   // Spender not approved for this amount
        ZeroRecipient,           // Cannot transfer to zero address
        NotOwner,                // Caller is not the contract owner
        AssetFrozen,             // Asset is frozen — no transfers allowed
        InvalidValue,            // Asset value cannot be zero
        InvalidSupply,           // Token supply cannot be zero
    }

    pub type Result<T> = core::result::Result<T, Error>;

    // ─── Contract storage ─────────────────────────────────────
    #[ink(storage)]
    pub struct RwaToken {
        // Token name and symbol (e.g. "Lagos Apartment A", "LAA")
        name:     String,
        symbol:   String,
        decimals: u8,

        // PSP22 core storage
        total_supply: Balance,
        balances:     Mapping<AccountId, Balance>,
        allowances:   Mapping<(AccountId, AccountId), Balance>,

        // RWA-specific
        metadata: AssetMetadata,
        owner:    AccountId,  // Original asset tokenizer — has admin rights
    }

    impl RwaToken {
        // ─── Constructor ──────────────────────────────────────
        /// Deploy a new RWA token contract.
        /// Called once per asset when user clicks "Tokenize" on the frontend.
        ///
        /// # Arguments
        /// * `name`           - Token name (asset name)
        /// * `symbol`         - Short ticker symbol (3-5 chars)
        /// * `initial_supply` - Total fractions to mint (e.g. 1_000_000)
        /// * `asset_type`     - Property | Commodity | Invoice
        /// * `asset_value`    - USD value in cents
        /// * `ipfs_cid`       - IPFS CID of the uploaded legal document
        /// * `zkp_hash`       - 32-byte ZKP proof hash
        /// * `location`       - Physical location string
        #[ink(constructor)]
        pub fn new(
            name:           String,
            symbol:         String,
            initial_supply: Balance,
            asset_type:     AssetType,
            asset_name:     String,
            asset_value:    u128,
            ipfs_cid:       String,
            zkp_hash:       [u8; 32],
            location:       String,
        ) -> Self {
            let caller = Self::env().caller();
            let mut balances = Mapping::default();

            // All tokens start with the deployer (asset owner)
            balances.insert(caller, &initial_supply);

            // Emit mint event (transfer from zero address)
            Self::env().emit_event(Transfer {
                from:  None,
                to:    Some(caller),
                value: initial_supply,
            });

            Self {
                name,
                symbol,
                decimals: 18,
                total_supply: initial_supply,
                balances,
                allowances: Mapping::default(),
                owner: caller,
                metadata: AssetMetadata {
                    asset_type,
                    asset_name,
                    asset_value,
                    ipfs_cid,
                    zkp_hash,
                    location,
                    status:          AssetStatus::Active,
                    created_at:      Self::env().block_timestamp(),
                    total_fractions: initial_supply,
                },
            }
        }

        // ─── PSP22 standard reads ─────────────────────────────

        /// Total token supply
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Token balance of an account
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balances.get(owner).unwrap_or(0)
        }

        /// How many tokens `spender` is allowed to use from `owner`
        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowances.get((owner, spender)).unwrap_or(0)
        }

        /// Token name
        #[ink(message)]
        pub fn name(&self) -> String { self.name.clone() }

        /// Token symbol
        #[ink(message)]
        pub fn symbol(&self) -> String { self.symbol.clone() }

        /// Decimal places
        #[ink(message)]
        pub fn decimals(&self) -> u8 { self.decimals }

        // ─── RWA metadata reads ───────────────────────────────

        /// Get the full asset metadata struct
        #[ink(message)]
        pub fn get_metadata(&self) -> AssetMetadata {
            self.metadata.clone()
        }

        /// Get asset type only
        #[ink(message)]
        pub fn asset_type(&self) -> AssetType {
            self.metadata.asset_type.clone()
        }

        /// Get asset USD value (in cents)
        #[ink(message)]
        pub fn asset_value(&self) -> u128 {
            self.metadata.asset_value
        }

        /// Get IPFS CID of the legal document
        #[ink(message)]
        pub fn ipfs_cid(&self) -> String {
            self.metadata.ipfs_cid.clone()
        }

        /// Get ZKP hash — proves document exists without revealing it
        #[ink(message)]
        pub fn zkp_hash(&self) -> [u8; 32] {
            self.metadata.zkp_hash
        }

        /// Get current asset status
        #[ink(message)]
        pub fn status(&self) -> AssetStatus {
            self.metadata.status.clone()
        }

        /// Get contract owner
        #[ink(message)]
        pub fn owner(&self) -> AccountId {
            self.owner
        }

        // ─── PSP22 standard writes ────────────────────────────

        /// Transfer tokens from caller to `to`
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> Result<()> {
            // Block transfers if asset is frozen
            if self.metadata.status == AssetStatus::Frozen {
                return Err(Error::AssetFrozen);
            }
            let from = self.env().caller();
            self.transfer_from_to(from, to, value)
        }

        /// Approve `spender` to use up to `value` tokens on caller's behalf
        /// Used by the Marketplace contract to move tokens when a sale happens
        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: Balance) -> Result<()> {
            let owner = self.env().caller();
            self.allowances.insert((owner, spender), &value);
            self.env().emit_event(Approval { owner, spender, value });
            Ok(())
        }

        /// Transfer tokens on behalf of `from` (requires prior approval)
        /// Called by the Marketplace contract when executing a trade
        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from:  AccountId,
            to:    AccountId,
            value: Balance,
        ) -> Result<()> {
            if self.metadata.status == AssetStatus::Frozen {
                return Err(Error::AssetFrozen);
            }
            let caller = self.env().caller();
            let allowance = self.allowance(from, caller);
            if allowance < value {
                return Err(Error::InsufficientAllowance);
            }
            // Reduce allowance
            self.allowances.insert((from, caller), &(allowance - value));
            self.transfer_from_to(from, to, value)
        }

        // ─── Owner-only admin functions ───────────────────────

        /// Update asset status (owner only)
        /// e.g. freeze an asset during a legal dispute
        #[ink(message)]
        pub fn set_status(&mut self, new_status: AssetStatus) -> Result<()> {
            self.ensure_owner()?;
            self.metadata.status = new_status.clone();
            self.env().emit_event(StatusChanged {
                asset:      self.env().account_id(),
                new_status,
            });
            Ok(())
        }

        /// Update asset value (owner only)
        /// e.g. after a new property appraisal
        #[ink(message)]
        pub fn update_value(&mut self, new_value: u128) -> Result<()> {
            self.ensure_owner()?;
            if new_value == 0 { return Err(Error::InvalidValue); }
            self.metadata.asset_value = new_value;
            Ok(())
        }

        /// Update IPFS CID (owner only)
        /// e.g. after uploading updated legal documents
        #[ink(message)]
        pub fn update_ipfs_cid(&mut self, new_cid: String) -> Result<()> {
            self.ensure_owner()?;
            self.metadata.ipfs_cid = new_cid;
            Ok(())
        }

        // ─── Internal helpers ─────────────────────────────────

        /// Core transfer logic — used by both transfer() and transfer_from()
        fn transfer_from_to(
            &mut self,
            from:  AccountId,
            to:    AccountId,
            value: Balance,
        ) -> Result<()> {
            let from_balance = self.balance_of(from);
            if from_balance < value {
                return Err(Error::InsufficientBalance);
            }
            // Deduct from sender
            self.balances.insert(from, &(from_balance - value));
            // Add to recipient
            let to_balance = self.balance_of(to);
            self.balances.insert(to, &(to_balance + value));

            self.env().emit_event(Transfer {
                from:  Some(from),
                to:    Some(to),
                value,
            });
            Ok(())
        }

        /// Ensure caller is the contract owner
        fn ensure_owner(&self) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }
            Ok(())
        }
    }
}
