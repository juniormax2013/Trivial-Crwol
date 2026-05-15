// next.config.mjs
var nextConfig = {
  reactStrictMode: true,
  // Allow access to remote images.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**"
      }
    ]
  },
  transpilePackages: ["motion"],
  eslint: {
    ignoreDuringBuilds: true
  }
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
