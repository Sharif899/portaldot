import { useState } from "react";
import { Wallet, ChevronDown, LogOut, Copy, Check } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import Modal from "@/components/ui/Modal";

/**
 * WalletButton component
 *
 * States:
 *   1. Not connected → shows "Connect Wallet" button
 *   2. Connecting    → shows loading spinner
 *   3. Connected     → shows truncated address + dropdown menu
 *
 * Dropdown menu (when connected):
 *   - Copy full address
 *   - Switch account (if multiple)
 *   - Disconnect
 */
export default function WalletButton() {
  const {
    isConnected,
    isConnecting,
    selectedAccount,
    accounts,
    connect,
    disconnect,
    selectAccount,
    shortAddress,
    error,
  } = useWallet();

  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [showAccounts,  setShowAccounts]  = useState(false);

  // Copy address to clipboard
  const handleCopy = () => {
    if (!selectedAccount) return;
    navigator.clipboard.writeText(selectedAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not connected ─────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={connect}
          disabled={isConnecting}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          "8px",
            padding:      "8px 16px",
            borderRadius: "10px",
            border:       "1px solid var(--brand)",
            background:   isConnecting ? "var(--brand-dim)" : "var(--brand)",
            color:        "#fff",
            fontSize:     "13px",
            fontWeight:   500,
            fontFamily:   "DM Sans, sans-serif",
            cursor:       isConnecting ? "not-allowed" : "pointer",
            transition:   "all 0.2s ease",
            whiteSpace:   "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!isConnecting) {
              e.currentTarget.style.background = "var(--brand-light)";
              e.currentTarget.style.boxShadow  = "var(--glow)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isConnecting
              ? "var(--brand-dim)"
              : "var(--brand)";
            e.currentTarget.style.boxShadow  = "none";
          }}
        >
          {isConnecting ? (
            <>
              <div style={{
                width:  "14px", height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={15} />
              Connect Wallet
            </>
          )}
        </button>

        {/* Error tooltip */}
        {error && (
          <div style={{
            position:     "absolute",
            top:          "calc(100% + 8px)",
            right:        0,
            background:   "var(--accent-coral)",
            color:        "#fff",
            fontSize:     "12px",
            padding:      "8px 12px",
            borderRadius: "8px",
            whiteSpace:   "nowrap",
            maxWidth:     "260px",
            zIndex:       300,
            boxShadow:    "var(--shadow-md)",
          }}>
            {error}
          </div>
        )}

        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Connected ─────────────────────────────────────────────────
  return (
    <>
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          "8px",
            padding:      "6px 12px 6px 8px",
            borderRadius: "10px",
            border:       "1px solid var(--border)",
            background:   dropdownOpen ? "var(--bg-muted)" : "var(--bg-surface)",
            color:        "var(--text-primary)",
            fontSize:     "13px",
            fontWeight:   500,
            fontFamily:   "DM Sans, sans-serif",
            cursor:       "pointer",
            transition:   "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--brand)";
            e.currentTarget.style.background  = "var(--bg-muted)";
          }}
          onMouseLeave={(e) => {
            if (!dropdownOpen) {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background  = "var(--bg-surface)";
            }
          }}
        >
          {/* Green dot */}
          <div style={{
            width:        "8px",
            height:       "8px",
            borderRadius: "50%",
            background:   "var(--accent-green)",
            boxShadow:    "0 0 6px var(--accent-green)",
            flexShrink:   0,
          }} />

          {/* Address */}
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize:   "12px",
            color:      "var(--text-primary)",
          }}>
            {shortAddress(selectedAccount?.address)}
          </span>

          <ChevronDown
            size={13}
            color="var(--text-muted)"
            style={{
              transform:  dropdownOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {/* ── Dropdown ── */}
        {dropdownOpen && (
          <>
            {/* Click outside to close */}
            <div
              onClick={() => setDropdownOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 149 }}
            />
            <div style={{
              position:     "absolute",
              top:          "calc(100% + 6px)",
              right:        0,
              zIndex:       150,
              background:   "var(--bg-surface)",
              border:       "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow:    "var(--shadow-lg)",
              minWidth:     "220px",
              overflow:     "hidden",
              animation:    "slideUp 0.15s ease",
            }}>
              {/* Account name */}
              <div style={{
                padding:    "12px 14px",
                borderBottom: "1px solid var(--border)",
              }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 2px" }}>
                  Connected as
                </p>
                <p style={{
                  fontSize:   "13px",
                  fontWeight: 600,
                  color:      "var(--text-primary)",
                  margin:     0,
                }}>
                  {selectedAccount?.meta?.name || "My Account"}
                </p>
                <p style={{
                  fontSize:   "11px",
                  color:      "var(--text-muted)",
                  fontFamily: "JetBrains Mono, monospace",
                  margin:     "2px 0 0",
                }}>
                  {shortAddress(selectedAccount?.address)}
                </p>
              </div>

              {/* Copy address */}
              <button
                onClick={handleCopy}
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:        "10px",
                  width:      "100%",
                  padding:    "10px 14px",
                  background: "transparent",
                  border:     "none",
                  cursor:     "pointer",
                  fontSize:   "13px",
                  color:      "var(--text-secondary)",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "background 0.15s",
                  textAlign:  "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-muted)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy address"}
              </button>

              {/* Switch account (if multiple) */}
              {accounts.length > 1 && (
                <button
                  onClick={() => { setShowAccounts(true); setDropdownOpen(false); }}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        "10px",
                    width:      "100%",
                    padding:    "10px 14px",
                    background: "transparent",
                    border:     "none",
                    cursor:     "pointer",
                    fontSize:   "13px",
                    color:      "var(--text-secondary)",
                    fontFamily: "DM Sans, sans-serif",
                    transition: "background 0.15s",
                    textAlign:  "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-muted)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <Wallet size={14} />
                  Switch account ({accounts.length})
                </button>
              )}

              {/* Disconnect */}
              <button
                onClick={() => { disconnect(); setDropdownOpen(false); }}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                  width:        "100%",
                  padding:      "10px 14px",
                  background:   "transparent",
                  border:       "none",
                  borderTop:    "1px solid var(--border)",
                  cursor:       "pointer",
                  fontSize:     "13px",
                  color:        "var(--accent-coral)",
                  fontFamily:   "DM Sans, sans-serif",
                  transition:   "background 0.15s",
                  textAlign:    "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,107,107,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>

      {/* Account switcher modal */}
      <Modal
        isOpen={showAccounts}
        onClose={() => setShowAccounts(false)}
        title="Switch Account"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {accounts.map((account) => (
            <button
              key={account.address}
              onClick={() => {
                selectAccount(account.address);
                setShowAccounts(false);
              }}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "10px",
                padding:      "10px 12px",
                borderRadius: "10px",
                border:       account.address === selectedAccount?.address
                  ? "1px solid var(--brand)"
                  : "1px solid var(--border)",
                background:   account.address === selectedAccount?.address
                  ? "var(--brand-dim)"
                  : "var(--bg-muted)",
                cursor:       "pointer",
                textAlign:    "left",
                width:        "100%",
                transition:   "all 0.15s",
              }}
            >
              <div style={{
                width:        "32px",
                height:       "32px",
                borderRadius: "50%",
                background:   "linear-gradient(135deg, var(--brand) 0%, var(--accent-cyan) 100%)",
                flexShrink:   0,
              }} />
              <div>
                <p style={{
                  fontSize:   "13px",
                  fontWeight: 600,
                  color:      "var(--text-primary)",
                  margin:     0,
                }}>
                  {account.meta?.name || "Account"}
                </p>
                <p style={{
                  fontSize:   "11px",
                  color:      "var(--text-muted)",
                  fontFamily: "JetBrains Mono, monospace",
                  margin:     "2px 0 0",
                }}>
                  {shortAddress(account.address)}
                </p>
              </div>
              {account.address === selectedAccount?.address && (
                <Check size={14} color="var(--brand)" style={{ marginLeft: "auto" }} />
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
