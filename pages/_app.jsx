import { ThemeProvider } from "@/context/ThemeContext";
import { WalletProvider } from "@/context/WalletContext";
import "@/styles/globals.css";

/**
 * _app.jsx — the root of every page in PortalRWA
 *
 * Provider order matters:
 * ThemeProvider (outermost) — applies dark/light class to <html>
 *   WalletProvider — manages Polkadot.js wallet connection
 *     Component — the actual page being rendered
 *
 * Any component anywhere in the app can now call:
 *   useTheme()  → theme, toggleTheme, isDark
 *   useWallet() → connect, disconnect, selectedAccount, isConnected
 */
export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </ThemeProvider>
  );
}
