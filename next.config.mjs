/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/jonaslacandola0617/learning-platform/**",
      },
      {
        protocol: "https",
        hostname: "emoji.fluent-cdn.com",
        pathname: "/1.0.0/100x100/**",
      },
    ],
  },
};

export default nextConfig;
