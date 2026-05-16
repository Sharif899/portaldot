import { createContext, useContext, useState, useCallback, useEffect } from "react";

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

function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ✅ Never lets a promise hang forever
function withTimeout(promise, ms = 8000, message = "Connection timed out. Try again.") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export function WalletProvider({ children }) {
  const [accounts,        setAccounts]        = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isConnecting,    setIsConnecting]    = useState(false);
  const [isConnected,     setIsConnected]     = useState(false);
  const [error,           setError]           = useState(null);

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet_connected");
    const savedAddress = localStorage.getItem("wallet_selected");
    if (wasConnected !== "true") return;

    (async () => {
      try {
        const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");
        const extensions = await withTimeout(
          web3Enable("AssetDot"),
          5000,
          "Extension not ready"
        );
        if (!extensions || extensions.length === 0) return;
        const allAccounts = await web3Accounts();
        if (!allAccounts || allAccounts.length === 0) return;
        setAccounts(allAccounts);
        const found = allAccounts.find((a) => a.address === savedAddress);
        setSelectedAccount(found || allAccounts[0]);
        setIsConnected(true);
      } catch {
        // Silent fail — user connects manually
        localStorage.removeItem("wallet_connected");
        localStorage.removeItem("wallet_selected");
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // ✅ Mobile detection — Polkadot extension doesn't exist on mobile browsers
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        throw new Error(
          "On mobile, open this app inside Nova Wallet or SubWallet's built-in browser to connect."
        );
      }

      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");

      // ✅ 8s timeout — web3Enable hangs forever if extension missing or site not authorized
      const extensions = await withTimeout(
        web3Enable("AssetDot"),
        8000,
        "Connection timed out. Make sure the Polkadot{.js} extension is installed and this site is allowed."
      );

      if (!extensions || extensions.length === 0) {
        throw new Error(
          "No Polkadot wallet found. Please install the Polkadot{.js} extension from polkadot.js.org/extension"
        );
      }

      // ✅ Timeout on account fetch too
      const allAccounts = await withTimeout(
        web3Accounts(),
        5000,
        "Could not fetch accounts. Please unlock your extension and try again."
      );

      if (!allAccounts || allAccounts.length === 0) {
        throw new Error(
          "No accounts found. Please create an account in your Polkadot{.js} extension and try again."
        );
      }

      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      setIsConnected(true);
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_selected", allAccounts[0].address);

    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      // ✅ Always runs — isConnecting can NEVER stay true forever
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_selected");
  }, []);

  const selectAccount = useCallback((address) => {
    const found = accounts.find((a) => a.address === address);
    if (found) {
      setSelectedAccount(found);
      localStorage.setItem("wallet_selected", address);
    }
  }, [accounts]);

  return (
    <WalletContext.Provider value={{
      accounts, selectedAccount, isConnecting, isConnected,
      error, connect, disconnect, selectAccount, shortAddress,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
