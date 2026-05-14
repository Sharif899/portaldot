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
    if (wasConnected === "true") {
      (async () => {
        try {
          const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");
          const extensions = await web3Enable("AssetDot" + Date.now());
          if (extensions.length === 0) return;
          const allAccounts = await web3Accounts();
          if (allAccounts.length === 0) return;
          setAccounts(allAccounts);
          const found = allAccounts.find((a) => a.address === savedAddress);
          setSelectedAccount(found || allAccounts[0]);
          setIsConnected(true);
        } catch {
          localStorage.removeItem("wallet_connected");
          localStorage.removeItem("wallet_selected");
        }
      })();
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");
      const extensions = await web3Enable("AssetDot");
      if (extensions.length === 0) {
        throw new Error("No Polkadot wallet found. Please install the Polkadot{.js} extension.");
      }
      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error("No accounts found. Please create an account in your Polkadot{.js} extension.");
      }
      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0]);
      setIsConnected(true);
      // Save connection to localStorage
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_selected", allAccounts[0].address);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError(null);
    // Clear localStorage on disconnect
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
    <WalletContext.Provider value={{ accounts, selectedAccount, isConnecting, isConnected, error, connect, disconnect, selectAccount, shortAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
