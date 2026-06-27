import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const sunghyunSans = localFont({
    variable: "--font-sunghyun",
    display: "swap",
    src: [
        {
            path: "./fonts/SunghyunSans-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/SunghyunSans-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/SunghyunSans-SemiBold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "./fonts/SunghyunSans-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://gitranked.manthaa.dev/"),
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
        canonical: "https://gitranked.manthaa.dev/",
    },
    openGraph: {
        type: "website",
        siteName: "GitRanked",
        title: "GitRanked Cambodia - Developer Leaderboard",
        description: "Find the most cracked devs in your local dev community.",
        url: "https://gitranked.manthaa.dev/",
        locale: "en_US",
        images: [
            {
                url: "https://gitranked.manthaa.dev/gitranked-og-main.png",
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: ["https://gitranked.manthaa.dev/gitranked-og-main.png"],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "GitRanked",
    },
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
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
            <body className={`${sunghyunSans.variable} antialiased`}>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
            <GoogleAnalytics gaId="G-NZDXR4KL29" />
        </html>
    );
}
