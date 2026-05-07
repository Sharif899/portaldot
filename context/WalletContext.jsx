import { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── Context shape ────────────────────────────────────────────
const WalletContext = createContext({
  accounts: [],
  selectedAccount: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  selectAccount: () => {},
  shortAddress: (addr) => addr,
});

// ─── Helper: shorten a Polkadot address ──────────────────────
// "5GrwvaEF5...qE2C" → shows first 6 and last 4 chars
function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Provider ─────────────────────────────────────────────────
export function WalletProvider({ children }) {
  const [accounts, setAccounts]               = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isConnecting, setIsConnecting]       = useState(false);
  const [isConnected, setIsConnected]         = useState(false);
  const [error, setError]                     = useState(null);

  // On mount: check if user was previously connected
  useEffect(() => {
    const saved = localStorage.getItem("portalrwa-account");
    if (saved) {
      // Try to silently reconnect
      silentReconnect(saved);
    }
  }, []);

  // Silent reconnect — doesn't show the extension popup
  const silentReconnect = async (savedAddress) => {
    try {
      // Dynamic import — Polkadot extension only works in the browser
      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("PortalRWA");
      if (extensions.length === 0) return; // Extension not installed

      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) return;

      setAccounts(allAccounts);
      setIsConnected(true);

      // Restore previously selected account if it still exists
      const found = allAccounts.find((a) => a.address === savedAddress);
      setSelectedAccount(found || allAccounts[0]);
    } catch {
      // Silent fail — user will click connect manually
    }
  };

  // Manual connect — called when user clicks "Connect Wallet"
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");

      // web3Enable registers PortalRWA with the extension
      // This triggers the extension's permission popup
      const extensions = await web3Enable("PortalRWA");

      if (extensions.length === 0) {
        throw new Error(
          "No Polkadot wallet found. Please install the Polkadot{.js} extension."
        );
      }

      const allAccounts = await web3Accounts();

      if (allAccounts.length === 0) {
        throw new Error(
          "No accounts found. Please create an account in your Polkadot{.js} extension."
        );
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      setIsConnected(true);

      // Save address so we can silently reconnect on next visit
      localStorage.setItem("portalrwa-account", allAccounts[0].address);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect — clear all wallet state
  const disconnect = useCallback(() => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem("portalrwa-account");
  }, []);

  // Switch active account (when user has multiple accounts)
  const selectAccount = useCallback(
    (address) => {
      const found = accounts.find((a) => a.address === address);
      if (found) {
        setSelectedAccount(found);
        localStorage.setItem("portalrwa-account", found.address);
      }
    },
    [accounts]
  );

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        isConnecting,
        isConnected,
        error,
        connect,
        disconnect,
        selectAccount,
        shortAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
// Usage: const { connect, isConnected, selectedAccount } = useWallet();
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
