//! # PortalRWA Marketplace Contract
//!
//! This contract handles fractional trading of tokenized real-world assets.
//! It is the iSwap DEX integration layer for PortalRWA.
//!
//! ## How trading works
//! 1. Asset owner calls `list_asset()` — specifies token contract address,
//!    number of fractions to sell, and price per fraction in POT (planck units)
//! 2. Contract holds the listing on-chain
//! 3. Buyer calls `buy_fraction()` with payment attached
//! 4. Contract calls `transfer_from` on the RWA token contract
//!    to move fractions from seller to buyer
//! 5. Payment (minus platform fee) is sent to seller
//!
//! ## Fee model
//! Platform takes a 1% fee on every trade.
//! Fee accumulates in the contract and owner can withdraw it.

#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod marketplace {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    use scale::{Decode, Encode};

    // ─── Listing struct ───────────────────────────────────────
    // One entry per asset listed for fractional sale
    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Listing {
        pub id:                u64,          // Unique listing ID
        pub seller:            AccountId,    // Who listed it
        pub token_contract:    AccountId,    // Address of the RWA token contract
        pub asset_name:        String,       // Human-readable name for the UI
        pub asset_type:        u8,           // 0=Property 1=Commodity 2=Invoice
        pub fractions_listed:  Balance,      // How many fractions are for sale
        pub fractions_sold:    Balance,      // How many have been sold so far
        pub price_per_fraction: Balance,     // Price in planck (smallest POT unit)
        pub is_active:         bool,         // False when fully sold or cancelled
        pub created_at:        u64,          // Block timestamp
    }

    // ─── Trade record ─────────────────────────────────────────
    // Stored for every successful purchase — used by dashboard
    #[derive(Debug, Clone, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Trade {
        pub listing_id: u64,
        pub buyer:      AccountId,
        pub fractions:  Balance,
        pub total_paid: Balance,
        pub timestamp:  u64,
    }

    // ─── Events ───────────────────────────────────────────────

    #[ink(event)]
    pub struct AssetListed {
        #[ink(topic)]
        listing_id:     u64,
        #[ink(topic)]
        seller:         AccountId,
        token_contract: AccountId,
        fractions:      Balance,
        price:          Balance,
    }

    #[ink(event)]
    pub struct FractionBought {
        #[ink(topic)]
        listing_id: u64,
        #[ink(topic)]
        buyer:      AccountId,
        fractions:  Balance,
        total_paid: Balance,
    }

    #[ink(event)]
    pub struct ListingCancelled {
        #[ink(topic)]
        listing_id: u64,
    }

    // ─── Errors ───────────────────────────────────────────────
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        ListingNotFound,         // No listing with this ID
        ListingNotActive,        // Listing is cancelled or sold out
        InsufficientFractions,   // Requested more than available
        InsufficientPayment,     // Sent less POT than required
        NotSeller,               // Only seller can cancel their listing
        NotOwner,                // Only contract owner can withdraw fees
        TransferFailed,          // Token transfer_from call failed
        ZeroFractions,           // Cannot list 0 fractions
        ZeroPrice,               // Price cannot be zero
        WithdrawFailed,          // Fee withdrawal failed
    }

    pub type Result<T> = core::result::Result<T, Error>;

    // ─── Storage ──────────────────────────────────────────────
    #[ink(storage)]
    pub struct Marketplace {
        owner:           AccountId,          // Contract deployer — collects fees
        listings:        Mapping<u64, Listing>,
        listing_count:   u64,                // Auto-increment ID counter
        platform_fee_bp: u32,               // Fee in basis points (100 = 1%)
        accumulated_fees: Balance,           // Fees waiting to be withdrawn
        // Track which listings each seller has
        seller_listings: Mapping<AccountId, Vec<u64>>,
        // Track which listings each buyer has purchased from
        buyer_trades:    Mapping<AccountId, Vec<Trade>>,
    }

    impl Marketplace {
        // ─── Constructor ──────────────────────────────────────
        /// Deploy the marketplace.
        /// `platform_fee_bp` — fee in basis points. 100 = 1%, 50 = 0.5%
        #[ink(constructor)]
        pub fn new(platform_fee_bp: u32) -> Self {
            Self {
                owner:            Self::env().caller(),
                listings:         Mapping::default(),
                listing_count:    0,
                platform_fee_bp,
                accumulated_fees: 0,
                seller_listings:  Mapping::default(),
                buyer_trades:     Mapping::default(),
            }
        }

        // ─── List an asset for fractional sale ────────────────
        /// Called by asset owner to list fractions for sale.
        ///
        /// IMPORTANT: Before calling this, the seller must call
        /// `approve(marketplace_address, fractions_to_list)` on the
        /// RWA token contract — otherwise transfer_from will fail.
        #[ink(message)]
        pub fn list_asset(
            &mut self,
            token_contract:     AccountId,
            asset_name:         String,
            asset_type:         u8,
            fractions_to_list:  Balance,
            price_per_fraction: Balance,
        ) -> Result<u64> {
            if fractions_to_list == 0 { return Err(Error::ZeroFractions); }
            if price_per_fraction == 0 { return Err(Error::ZeroPrice); }

            let seller = self.env().caller();
            let id     = self.listing_count;

            let listing = Listing {
                id,
                seller,
                token_contract,
                asset_name,
                asset_type,
                fractions_listed:   fractions_to_list,
                fractions_sold:     0,
                price_per_fraction,
                is_active:          true,
                created_at:         self.env().block_timestamp(),
            };

            self.listings.insert(id, &listing);

            // Track this listing under the seller's account
            let mut seller_list = self.seller_listings
                .get(seller)
                .unwrap_or_default();
            seller_list.push(id);
            self.seller_listings.insert(seller, &seller_list);

            self.listing_count += 1;

            self.env().emit_event(AssetListed {
                listing_id: id,
                seller,
                token_contract,
                fractions:  fractions_to_list,
                price:      price_per_fraction,
            });

            Ok(id)
        }

        // ─── Buy fractions ────────────────────────────────────
        /// Called by buyer to purchase fractions of a listed asset.
        /// Buyer must attach exact payment: fractions * price_per_fraction
        #[ink(message, payable)]
        pub fn buy_fraction(
            &mut self,
            listing_id: u64,
            fractions:  Balance,
        ) -> Result<()> {
            let mut listing = self.listings
                .get(listing_id)
                .ok_or(Error::ListingNotFound)?;

            if !listing.is_active           { return Err(Error::ListingNotActive); }
            if fractions == 0               { return Err(Error::ZeroFractions); }

            let available = listing.fractions_listed - listing.fractions_sold;
            if fractions > available        { return Err(Error::InsufficientFractions); }

            // Check payment
            let total_cost    = fractions * listing.price_per_fraction;
            let payment_sent  = self.env().transferred_value();
            if payment_sent < total_cost   { return Err(Error::InsufficientPayment); }

            // Calculate platform fee (e.g. 1%)
            let fee            = (total_cost * self.platform_fee_bp as u128) / 10_000;
            let seller_payout  = total_cost - fee;
            self.accumulated_fees += fee;

            let buyer  = self.env().caller();
            let seller = listing.seller;

            // Call transfer_from on the token contract
            // This moves fractions from seller → buyer on-chain
            // Requires seller to have called approve() first
            use ink::env::call::{build_call, ExecutionInput, Selector};

            // PSP22 transfer_from selector
            let transfer_result = build_call::<ink::env::DefaultEnvironment>()
                .call(listing.token_contract)
                .exec_input(
                    ExecutionInput::new(Selector::new(ink::selector_bytes!("transfer_from")))
                        .push_arg(seller)
                        .push_arg(buyer)
                        .push_arg(fractions)
                )
                .returns::<core::result::Result<(), u8>>()
                .try_invoke();

            if transfer_result.is_err() {
                return Err(Error::TransferFailed);
            }

            // Pay seller (minus fee)
            if self.env().transfer(seller, seller_payout).is_err() {
                return Err(Error::TransferFailed);
            }

            // Update listing state
            listing.fractions_sold += fractions;
            if listing.fractions_sold >= listing.fractions_listed {
                listing.is_active = false;  // Fully sold out
            }
            self.listings.insert(listing_id, &listing);

            // Record trade for buyer's portfolio dashboard
            let trade = Trade {
                listing_id,
                buyer,
                fractions,
                total_paid: total_cost,
                timestamp:  self.env().block_timestamp(),
            };
            let mut buyer_trade_list = self.buyer_trades
                .get(buyer)
                .unwrap_or_default();
            buyer_trade_list.push(trade);
            self.buyer_trades.insert(buyer, &buyer_trade_list);

            self.env().emit_event(FractionBought {
                listing_id,
                buyer,
                fractions,
                total_paid: total_cost,
            });

            Ok(())
        }

        // ─── Cancel a listing ─────────────────────────────────
        /// Seller can cancel their listing at any time (unsold fractions only)
        #[ink(message)]
        pub fn cancel_listing(&mut self, listing_id: u64) -> Result<()> {
            let mut listing = self.listings
                .get(listing_id)
                .ok_or(Error::ListingNotFound)?;

            if listing.seller != self.env().caller() { return Err(Error::NotSeller); }
            if !listing.is_active { return Err(Error::ListingNotActive); }

            listing.is_active = false;
            self.listings.insert(listing_id, &listing);

            self.env().emit_event(ListingCancelled { listing_id });
            Ok(())
        }

        // ─── Read functions ───────────────────────────────────

        /// Get a single listing by ID
        #[ink(message)]
        pub fn get_listing(&self, listing_id: u64) -> Option<Listing> {
            self.listings.get(listing_id)
        }

        /// Get total number of listings ever created
        #[ink(message)]
        pub fn listing_count(&self) -> u64 {
            self.listing_count
        }

        /// Get all listing IDs for a seller
        #[ink(message)]
        pub fn get_seller_listings(&self, seller: AccountId) -> Vec<u64> {
            self.seller_listings.get(seller).unwrap_or_default()
        }

        /// Get all trades for a buyer — used by the portfolio dashboard
        #[ink(message)]
        pub fn get_buyer_trades(&self, buyer: AccountId) -> Vec<Trade> {
            self.buyer_trades.get(buyer).unwrap_or_default()
        }

        /// Get current platform fee in basis points
        #[ink(message)]
        pub fn platform_fee_bp(&self) -> u32 {
            self.platform_fee_bp
        }

        /// Get accumulated fees waiting to be withdrawn
        #[ink(message)]
        pub fn accumulated_fees(&self) -> Balance {
            self.accumulated_fees
        }

        // ─── Owner functions ──────────────────────────────────

        /// Withdraw accumulated platform fees (owner only)
        #[ink(message)]
        pub fn withdraw_fees(&mut self) -> Result<()> {
            if self.env().caller() != self.owner { return Err(Error::NotOwner); }
            let amount = self.accumulated_fees;
            self.accumulated_fees = 0;
            self.env()
                .transfer(self.owner, amount)
                .map_err(|_| Error::WithdrawFailed)
        }

        /// Update platform fee (owner only)
        #[ink(message)]
        pub fn set_platform_fee(&mut self, new_fee_bp: u32) -> Result<()> {
            if self.env().caller() != self.owner { return Err(Error::NotOwner); }
            self.platform_fee_bp = new_fee_bp;
            Ok(())
        }
    }
}
