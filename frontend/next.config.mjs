/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reliefweb.int",
      },
    ],
  },
};

export default nextConfig;
