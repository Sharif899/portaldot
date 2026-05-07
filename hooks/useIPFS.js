import { useState, useCallback } from "react";

/**
 * useIPFS — hook for uploading asset documents to IPFS via Pinata
 *
 * Pinata is a free IPFS pinning service. Files uploaded here are
 * accessible globally via the IPFS gateway.
 *
 * Setup:
 *   1. Create a free account at pinata.cloud
 *   2. Go to API Keys → New Key
 *   3. Add to .env.local:
 *      NEXT_PUBLIC_PINATA_API_KEY=your_key
 *      NEXT_PUBLIC_PINATA_SECRET=your_secret
 *
 * Methods:
 *   uploadFile(file)     → uploads File object, returns { cid, url }
 *   uploadJSON(data)     → uploads JSON metadata, returns { cid, url }
 *   getGatewayUrl(cid)   → returns public IPFS gateway URL for a CID
 *
 * Usage:
 *   const { uploadFile, isUploading, progress } = useIPFS();
 *   const { cid, url } = await uploadFile(selectedFile);
 */

const PINATA_API    = "https://api.pinata.cloud";
const GATEWAY       = "https://gateway.pinata.cloud/ipfs";

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [error,       setError]       = useState(null);

  // ── Get env keys ──────────────────────────────────────────────
  const getHeaders = () => {
    const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const secret = process.env.NEXT_PUBLIC_PINATA_SECRET;

    if (!apiKey || !secret) {
      throw new Error(
        "Pinata API keys not set. Add NEXT_PUBLIC_PINATA_API_KEY and " +
        "NEXT_PUBLIC_PINATA_SECRET to your .env.local file."
      );
    }
    return {
      pinata_api_key:        apiKey,
      pinata_secret_api_key: secret,
    };
  };

  // ── Upload a File object to IPFS ──────────────────────────────
  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const headers = getHeaders();
      const formData = new FormData();
      formData.append("file", file);

      // Pinata metadata — names the file in your Pinata dashboard
      formData.append(
        "pinataMetadata",
        JSON.stringify({ name: `PortalRWA_${file.name}_${Date.now()}` })
      );

      // pinataOptions — makes the file publicly accessible
      formData.append(
        "pinataOptions",
        JSON.stringify({ cidVersion: 1 })
      );

      setProgress(30);

      const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
        method:  "POST",
        headers: {
          pinata_api_key:        headers.pinata_api_key,
          pinata_secret_api_key: headers.pinata_secret_api_key,
          // Note: Do NOT set Content-Type here — browser sets it with boundary
        },
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.details || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      const cid  = data.IpfsHash;

      setProgress(100);

      return {
        cid,
        url:  `${GATEWAY}/${cid}`,
        size: data.PinSize,
        name: file.name,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // ── Upload JSON metadata to IPFS ──────────────────────────────
  // Used for storing asset metadata alongside the document
  const uploadJSON = useCallback(async (jsonData, name = "metadata") => {
    setIsUploading(true);
    setError(null);

    try {
      const headers = getHeaders();

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
      const cid  = data.IpfsHash;

      return {
        cid,
        url: `${GATEWAY}/${cid}`,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // ── Get public gateway URL from CID ───────────────────────────
  const getGatewayUrl = useCallback((cid) => {
    if (!cid) return null;
    return `${GATEWAY}/${cid}`;
  }, []);

  // ── Test Pinata connection ─────────────────────────────────────
  const testConnection = useCallback(async () => {
    try {
      const headers = getHeaders();
      const response = await fetch(`${PINATA_API}/data/testAuthentication`, {
        headers: {
          pinata_api_key:        headers.pinata_api_key,
          pinata_secret_api_key: headers.pinata_secret_api_key,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    uploadFile,
    uploadJSON,
    getGatewayUrl,
    testConnection,
    isUploading,
    progress,
    error,
  };
}
