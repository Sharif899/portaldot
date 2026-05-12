cat > /mnt/c/Users/Administrator/Downloads/portalrwa/context/WalletContext.jsx << 'EOF'
import { createContext, useContext, useEffect, useState, useCallback } from "react";

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
  const [accounts, setAccounts]               = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isConnecting, setIsConnecting]       = useState(false);
  const [isConnected, setIsConnected]         = useState(false);
  const [error, setError]                     = useState(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // ── NO silent reconnect on mount ──────────────────────────
  // User must always manually click "Connect Wallet"
  // This prevents auto-connecting without user's knowledge

  // Manual connect — always triggers wallet extension popup
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");

      // Always triggers the extension permission popup
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
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect — asks for confirmation first
  const disconnect = useCallback(() => {
    setShowDisconnectConfirm(true);
  }, []);

  // Confirmed disconnect
  const confirmDisconnect = useCallback(() => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setError(null);
    setShowDisconnectConfirm(false);
    // Clear any saved state
    localStorage.removeItem("portalrwa-account");
  }, []);

  // Cancel disconnect
  const cancelDisconnect = useCallback(() => {
    setShowDisconnectConfirm(false);
  }, []);

  const selectAccount = useCallback(
    (address) => {
      const found = accounts.find((a) => a.address === address);
      if (found) {
        setSelectedAccount(found);
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
        confirmDisconnect,
        cancelDisconnect,
        showDisconnectConfirm,
        selectAccount,
        shortAddress,
      }}
    >
      {children}

      {/* ── Disconnect Confirmation Modal ── */}
      {showDisconnectConfirm && (
        <div style={{
          position:        "fixed",
          inset:           0,
          background:      "rgba(0,0,0,0.6)",
          backdropFilter:  "blur(4px)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          zIndex:          9999,
        }}>
          <div style={{
            background:   "#1a1a2e",
            border:       "1px solid #6152f8",
            borderRadius: "16px",
            padding:      "32px",
            maxWidth:     "380px",
            width:        "90%",
            textAlign:    "center",
            boxShadow:    "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Icon */}
            <div style={{
              width:        "56px",
              height:       "56px",
              borderRadius: "50%",
              background:   "rgba(255,100,100,0.15)",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              margin:       "0 auto 16px",
              fontSize:     "24px",
            }}>
              🔌
            </div>

            <h3 style={{
              color:         "#ffffff",
              fontFamily:    "Syne, sans-serif",
              fontSize:      "18px",
              fontWeight:    700,
              margin:        "0 0 8px",
            }}>
              Disconnect Wallet?
            </h3>

            <p style={{
              color:       "#aaaaaa",
              fontSize:    "13px",
              lineHeight:  1.6,
              margin:      "0 0 24px",
            }}>
              You will be disconnected from PortalRWA. To reconnect, you will need to approve the connection again in your wallet extension.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={cancelDisconnect}
                style={{
                  padding:      "10px 24px",
                  borderRadius: "8px",
                  border:       "1px solid #444",
                  background:   "transparent",
                  color:        "#ffffff",
                  fontSize:     "14px",
                  fontWeight:   600,
                  cursor:       "pointer",
                  flex:         1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                style={{
                  padding:      "10px 24px",
                  borderRadius: "8px",
                  border:       "none",
                  background:   "linear-gradient(135deg, #ff4444, #cc2222)",
                  color:        "#ffffff",
                  fontSize:     "14px",
                  fontWeight:   600,
                  cursor:       "pointer",
                  flex:         1,
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}
EOF
