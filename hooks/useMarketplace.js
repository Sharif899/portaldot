import { useState, useCallback } from "react";
import { useContract } from "@/hooks/useContract";
import { useWallet } from "@/context/WalletContext";
import { CONTRACT_ADDRESSES } from "@/utils/constants";

/**
 * useMarketplace — hook for interacting with the marketplace ink! contract
 *
 * Methods:
 *   - getListings()          → fetch all active listings
 *   - getListing(id)         → single listing by ID
 *   - getSellerListings(addr)→ all listings by a seller
 *   - getBuyerTrades(addr)   → all trades by a buyer (for dashboard)
 *   - listAsset(params)      → list fractions for sale
 *   - buyFraction(id, qty)   → buy fractions (sends POT payment)
 *   - cancelListing(id)      → delist an asset
 *
 * Usage:
 *   const { getListings, buyFraction, isLoading } = useMarketplace();
 */

const MARKETPLACE_ABI = {
  source: {},
  contract: { name: "marketplace", version: "0.1.0" },
  spec: {
    messages: [
      { label: "get_listing",         selector: "0x1a2b3c4d", args: [{ type: "u64" }],       returnType: { type: "Option<Listing>" } },
      { label: "listing_count",       selector: "0x2b3c4d5e", args: [],                       returnType: { type: "u64" } },
      { label: "get_seller_listings", selector: "0x3c4d5e6f", args: [{ type: "AccountId" }], returnType: { type: "Vec<u64>" } },
      { label: "get_buyer_trades",    selector: "0x4d5e6f7a", args: [{ type: "AccountId" }], returnType: { type: "Vec<Trade>" } },
      { label: "platform_fee_bp",     selector: "0x5e6f7a8b", args: [],                       returnType: { type: "u32" } },
      { label: "list_asset",          selector: "0x6f7a8b9c", args: [{ type: "AccountId" }, { type: "String" }, { type: "u8" }, { type: "Balance" }, { type: "Balance" }], returnType: { type: "Result<u64>" } },
      { label: "buy_fraction",        selector: "0x7a8b9c0d", args: [{ type: "u64" }, { type: "Balance" }], returnType: { type: "Result" } },
      { label: "cancel_listing",      selector: "0x8b9c0d1e", args: [{ type: "u64" }],       returnType: { type: "Result" } },
    ],
  },
};

export function useMarketplace() {
  const { query, tx, isReady, error } = useContract(
    CONTRACT_ADDRESSES.marketplace,
    MARKETPLACE_ABI
  );
  const { selectedAccount } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [txError,   setTxError]   = useState(null);

  // ── Read: fetch a single listing ──────────────────────────────
  const getListing = useCallback(async (listingId) => {
    try {
      return await query("get_listing", [listingId]);
    } catch (err) {
      console.error("[useMarketplace] getListing:", err);
      return null;
    }
  }, [query]);

  // ── Read: fetch total number of listings ever created ─────────
  const getListingCount = useCallback(async () => {
    try {
      return await query("listing_count", []);
    } catch (err) {
      console.error("[useMarketplace] getListingCount:", err);
      return 0;
    }
  }, [query]);

  // ── Read: fetch all listings (by iterating IDs) ───────────────
  // Note: In production use an indexer (SubQuery/SubSquid) for this
  const getListings = useCallback(async () => {
    try {
      const count = await getListingCount();
      if (!count || count === 0) return [];

      // Fetch all listings in parallel
      const promises = Array.from({ length: Number(count) }, (_, i) =>
        getListing(i)
      );
      const all = await Promise.all(promises);

      // Filter out null (cancelled) listings and inactive ones
      return all.filter((l) => l !== null && l.is_active);
    } catch (err) {
      console.error("[useMarketplace] getListings:", err);
      return [];
    }
  }, [getListing, getListingCount]);

  // ── Read: get all listing IDs for a seller ────────────────────
  const getSellerListings = useCallback(async (sellerAddress) => {
    try {
      const addr = sellerAddress || selectedAccount?.address;
      if (!addr) return [];
      return await query("get_seller_listings", [addr]);
    } catch (err) {
      console.error("[useMarketplace] getSellerListings:", err);
      return [];
    }
  }, [query, selectedAccount]);

  // ── Read: get all trades by a buyer (for portfolio dashboard) ──
  const getBuyerTrades = useCallback(async (buyerAddress) => {
    try {
      const addr = buyerAddress || selectedAccount?.address;
      if (!addr) return [];
      return await query("get_buyer_trades", [addr]);
    } catch (err) {
      console.error("[useMarketplace] getBuyerTrades:", err);
      return [];
    }
  }, [query, selectedAccount]);

  // ── Write: list asset fractions for sale ──────────────────────
  // NOTE: Seller must call approve() on the token contract first!
  // approve(marketplace_address, fractions_to_list)
  const listAsset = useCallback(async ({
    tokenContract,
    assetName,
    assetType,
    fractionsToList,
    pricePerFraction,
  }) => {
    setIsLoading(true);
    setTxError(null);
    try {
      const result = await tx("list_asset", [
        tokenContract,
        assetName,
        assetType,
        fractionsToList,
        pricePerFraction,
      ]);
      return result;
    } catch (err) {
      setTxError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tx]);

  // ── Write: buy fractions of a listed asset ────────────────────
  // `paymentInPlanck` = fractions * pricePerFraction (in chain's smallest unit)
  const buyFraction = useCallback(async (listingId, fractions, paymentInPlanck) => {
    setIsLoading(true);
    setTxError(null);
    try {
      // `value` param sends POT along with the transaction
      const result = await tx("buy_fraction", [listingId, fractions], paymentInPlanck);
      return result;
    } catch (err) {
      setTxError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tx]);

  // ── Write: cancel a listing (seller only) ─────────────────────
  const cancelListing = useCallback(async (listingId) => {
    setIsLoading(true);
    setTxError(null);
    try {
      const result = await tx("cancel_listing", [listingId]);
      return result;
    } catch (err) {
      setTxError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tx]);

  return {
    isReady,
    isLoading,
    error: error || txError,
    // Read
    getListing,
    getListings,
    getListingCount,
    getSellerListings,
    getBuyerTrades,
    // Write
    listAsset,
    buyFraction,
    cancelListing,
  };
}
