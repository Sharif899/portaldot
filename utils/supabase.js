import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://owqgfinzprlofvirutom.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWdmaW56cHJsb2Z2aXJ1dG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTMwNjEsImV4cCI6MjA5NDI4OTA2MX0.oVg101PchX0gVMD2XuknOLXAbDYsVKrZ1rLxJhk1RAI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Save a newly tokenized asset to Supabase ──────────────────
export async function saveAsset(asset) {
  const { data, error } = await supabase
    .from('assetdot')
    .insert([{
      name:                asset.name,
      location:            asset.location,
      asset_type:          Number(asset.assetType),
      value_usd:           Number(asset.valueUsd),
      fractions:           Number(asset.fractions),
      fractions_available: Number(asset.fractions),
      price_per_fraction:  Number(asset.pricePerFraction) || 0.35,
      owner:               asset.owner || 'anonymous',
      ipfs_cid:            asset.ipfsCid  || '',
      zkp_hash:            asset.zkpHash  || '',
      is_verified:         false,
      status:              'Active',
    }])
    .select();

  if (error) {
    console.error('Supabase save error:', error);
    return null;
  }
  return data?.[0];
}

// ── Fetch ALL assets from Supabase ────────────────────────────
export async function fetchAllAssets() {
  const { data, error } = await supabase
    .from('assetdot')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data || [];
}

// ── Fetch assets owned/minted by a specific wallet ────────────
export async function fetchMyAssets(ownerAddress) {
  if (!ownerAddress) return [];

  const { data, error } = await supabase
    .from('assetdot')
    .select('*')
    .eq('owner', ownerAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return [];
  }
  return data || [];
}

// ── Record a fraction purchase ────────────────────────────────
export async function buyFraction({ assetId, buyer, fractionsBought }) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{
      asset_id:         assetId,
      buyer:            buyer,
      fractions_bought: fractionsBought,
    }])
    .select();

  if (error) {
    console.error('Purchase save error:', error);
    return null;
  }
  return data?.[0];
}

// ── Fetch all assets a wallet has bought fractions of ─────────
export async function fetchMyPurchases(buyerAddress) {
  if (!buyerAddress) return [];

  const { data, error } = await supabase
    .from('purchases')
    .select('*, assetdot(*)')
    .eq('buyer', buyerAddress)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Purchases fetch error:', error);
    return [];
  }
  return data || [];
}
