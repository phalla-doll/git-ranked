import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://git-ranked-cambodia.vercel.app/"),
    title: "GitRanked Cambodia - Developer Leaderboard",
    description:
        "Discover top GitHub developers in Cambodia and beyond. Rank by followers, contributions, and repositories in a modern, minimalist interface.",
    openGraph: {
        title: "GitRanked Cambodia - Developer Leaderboard",
        description:
            "Discover top GitHub developers in Cambodia and beyond. Rank by followers, contributions, and repositories in a modern, minimalist interface.",
        url: "https://git-ranked-cambodia.vercel.app/",
        images: [
            {
                url: "https://git-ranked-cambodia.vercel.app/gitranked-og-main.png",
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
