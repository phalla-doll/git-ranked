import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
        ],
    },
    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
};

export default nextConfig;
