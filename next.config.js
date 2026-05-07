/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    // Polkadot.js uses WebAssembly — Next.js needs this to handle it
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Prevent Polkadot node-specific modules from breaking the browser build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
      };
    }

    return config;
  },

  // Allow images from IPFS gateways
  images: {
    domains: ["gateway.pinata.cloud", "ipfs.io", "cloudflare-ipfs.com"],
  },
};

module.exports = nextConfig;
