/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "res.cloudinary.com" }, { hostname: "www.ughogar.com" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
}

export default nextConfig
