import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Next 16 defaults this to [75] and coerces anything else down to it.
    // The hero photo is the one place that earns a higher setting.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
}

export default nextConfig
