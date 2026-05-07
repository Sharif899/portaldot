/**
 * ipfs.js — Pinata API utility functions
 *
 * These are standalone functions (not hooks) for use in
 * server-side scripts, contract deployment, and testing.
 * For React components, use the useIPFS() hook instead.
 *
 * Setup:
 *   NEXT_PUBLIC_PINATA_API_KEY=your_key
 *   NEXT_PUBLIC_PINATA_SECRET=your_secret
 */

const PINATA_API = "https://api.pinata.cloud";
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

// ── Get auth headers ──────────────────────────────────────────
function getAuthHeaders() {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secret = process.env.NEXT_PUBLIC_PINATA_SECRET;
  if (!apiKey || !secret) {
    throw new Error("Missing Pinata API keys in .env.local");
  }
  return {
    pinata_api_key:        apiKey,
    pinata_secret_api_key: secret,
  };
}

// ── Upload file to IPFS ───────────────────────────────────────
export async function uploadFileToIPFS(file, assetName = "") {
  const headers  = getAuthHeaders();
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `PortalRWA_${assetName || file.name}_${Date.now()}` })
  );
  formData.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method:  "POST",
    headers: {
      pinata_api_key:        headers.pinata_api_key,
      pinata_secret_api_key: headers.pinata_secret_api_key,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.details || `IPFS upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    cid:  data.IpfsHash,
    url:  `${IPFS_GATEWAY}/${data.IpfsHash}`,
    size: data.PinSize,
  };
}

// ── Upload JSON to IPFS ───────────────────────────────────────
export async function uploadJSONToIPFS(jsonData, name = "metadata") {
  const headers = getAuthHeaders();

  const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method:  "POST",
    headers: {
      "Content-Type":         "application/json",
      pinata_api_key:         headers.pinata_api_key,
      pinata_secret_api_key:  headers.pinata_secret_api_key,
    },
    body: JSON.stringify({
      pinataContent:  jsonData,
      pinataMetadata: { name: `PortalRWA_${name}_${Date.now()}` },
      pinataOptions:  { cidVersion: 1 },
    }),
  });

  if (!response.ok) {
    throw new Error(`JSON upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    cid: data.IpfsHash,
    url: `${IPFS_GATEWAY}/${data.IpfsHash}`,
  };
}

// ── Get gateway URL from CID ──────────────────────────────────
export function getIPFSUrl(cid) {
  if (!cid) return null;
  return `${IPFS_GATEWAY}/${cid}`;
}

// ── Test Pinata authentication ────────────────────────────────
export async function testPinataAuth() {
  try {
    const headers  = getAuthHeaders();
    const response = await fetch(`${PINATA_API}/data/testAuthentication`, {
      headers: {
        pinata_api_key:        headers.pinata_api_key,
        pinata_secret_api_key: headers.pinata_secret_api_key,
      },
    });
    const data = await response.json();
    return { ok: response.ok, message: data.message };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ── Unpin a CID from Pinata (cleanup) ────────────────────────
export async function unpinFromIPFS(cid) {
  const headers = getAuthHeaders();
  const response = await fetch(`${PINATA_API}/pinning/unpin/${cid}`, {
    method:  "DELETE",
    headers: {
      pinata_api_key:        headers.pinata_api_key,
      pinata_secret_api_key: headers.pinata_secret_api_key,
    },
  });
  return response.ok;
}

// ── List all pinned files ─────────────────────────────────────
export async function listPinnedFiles() {
  const headers  = getAuthHeaders();
  const response = await fetch(`${PINATA_API}/data/pinList?status=pinned`, {
    headers: {
      pinata_api_key:        headers.pinata_api_key,
      pinata_secret_api_key: headers.pinata_secret_api_key,
    },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.rows || [];
}
