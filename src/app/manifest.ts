import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "GitRanked Cambodia - Developer Leaderboard",
        short_name: "GitRanked",
        description: "Find the most cracked devs in your local dev community.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png",
            },
            {
                src: "/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
            {
                src: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
