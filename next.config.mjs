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
        hostname: "raw.githubusercontent.com",
        pathname: "/microsoft/fluentui-emoji/62ecdc0d7ca5c6df32148c169556bc8d3782fca4/**",
      },
    ],
  },
};

export default nextConfig;
