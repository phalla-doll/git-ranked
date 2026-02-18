import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    title: {
        default: "GitRanked Cambodia - Developer Leaderboard",
        template: "%s | GitRanked",
    },
    description: "Find the most cracked devs in your local dev community.",
    keywords: [
        "github",
        "leaderboard",
        "developers",
        "ranking",
        "cambodia",
        "open source",
    ],
    authors: [{ name: "GitRanked" }],
    creator: "GitRanked",
    publisher: "GitRanked",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://git-ranked-cambodia.vercel.app/",
    },
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    openGraph: {
        type: "website",
        siteName: "GitRanked",
        title: "GitRanked Cambodia - Developer Leaderboard",
        description: "Find the most cracked devs in your local dev community.",
        url: "https://git-ranked-cambodia.vercel.app/",
        locale: "en_US",
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
        images: [
            "https://git-ranked-cambodia.vercel.app/gitranked-og-main.png",
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "GitRanked",
    },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            {
                url: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
