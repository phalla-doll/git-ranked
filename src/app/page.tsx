import type { Metadata } from "next";
import { Suspense } from "react";
import { GitRankedClient, LoadingFallback } from "./git-ranked-client";

interface PageProps {
    searchParams: Promise<{ location?: string }>;
}

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const params = await searchParams;
    const location = params.location || "Cambodia";
    const formattedLocation =
        location.charAt(0).toUpperCase() + location.slice(1);

    const title = `GitRanked ${formattedLocation} - Developer Leaderboard`;
    const description = `Find the most cracked devs in ${formattedLocation}'s dev community.`;
    const url = `https://git-ranked-cambodia.vercel.app/?location=${encodeURIComponent(location)}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
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
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const initialLocation = params.location || "Cambodia";

    return (
        <Suspense fallback={<LoadingFallback />}>
            <GitRankedClient initialLocation={initialLocation} />
        </Suspense>
    );
}
