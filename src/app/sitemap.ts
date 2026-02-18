import type { MetadataRoute } from "next";

const POPULAR_LOCATIONS = [
    "Cambodia",
    "Singapore",
    "Thailand",
    "Vietnam",
    "Indonesia",
    "Malaysia",
    "Philippines",
    "USA",
    "United Kingdom",
    "Germany",
    "India",
    "Japan",
    "China",
    "Australia",
    "Canada",
    "Brazil",
    "France",
    "Netherlands",
    "South Korea",
    "Taiwan",
];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://git-ranked-cambodia.vercel.app";

    const locationUrls = POPULAR_LOCATIONS.map((location) => ({
        url: `${baseUrl}/?location=${encodeURIComponent(location)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...locationUrls,
    ];
}
