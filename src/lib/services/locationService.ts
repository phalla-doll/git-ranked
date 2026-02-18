export interface LocationResult {
    id: number;
    name: string;
    displayName: string;
    type: "city" | "country" | "state" | "town" | "village";
    country: string;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    type: string;
    address: {
        city?: string;
        town?: string;
        village?: string;
        country?: string;
        state?: string;
        country_code?: string;
    };
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: LocationResult[]; timestamp: number }>();

export async function searchLocations(
    query: string,
): Promise<LocationResult[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cached = cache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const params = new URLSearchParams({
        format: "json",
        q: query.trim(),
        addressdetails: "1",
        limit: "10",
        "accept-language": "en",
    });

    try {
        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: {
                "User-Agent": "GitRanked/1.0 (https://github.com/git-ranked)",
            },
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const results: NominatimResult[] = await response.json();

        const locations: LocationResult[] = results.map((result) => {
            const name =
                result.address.city ||
                result.address.town ||
                result.address.village ||
                result.address.state ||
                result.display_name.split(",")[0];

            const type = getLocationType(result.type);

            return {
                id: result.place_id,
                name,
                displayName: result.display_name,
                type,
                country: result.address.country || "",
            };
        });

        cache.set(normalizedQuery, { data: locations, timestamp: Date.now() });

        return locations;
    } catch (error) {
        console.error("Failed to fetch locations:", error);
        return [];
    }
}

function getLocationType(type: string): LocationResult["type"] {
    if (type === "city" || type === "administrative") return "city";
    if (type === "country") return "country";
    if (type === "state") return "state";
    if (type === "town") return "town";
    if (type === "village") return "village";
    return "city";
}

export function formatLocationName(location: LocationResult): string {
    if (location.type === "country") {
        return location.name;
    }
    if (location.country) {
        return `${location.name}, ${location.country}`;
    }
    return location.name;
}

export async function resolveLocation(
    input: string,
): Promise<LocationResult | null> {
    if (!input || input.trim().length < 2) {
        return null;
    }

    const normalizedInput = input.trim().toLowerCase();
    const cached = cache.get(normalizedInput);
    if (cached && cached.data.length > 0) {
        return cached.data[0];
    }

    const params = new URLSearchParams({
        format: "json",
        q: input.trim(),
        addressdetails: "1",
        limit: "1",
        "accept-language": "en",
    });

    try {
        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: {
                "User-Agent": "GitRanked/1.0 (https://github.com/git-ranked)",
            },
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const results: NominatimResult[] = await response.json();

        if (results.length === 0) {
            return null;
        }

        const result = results[0];
        const name =
            result.address.city ||
            result.address.town ||
            result.address.village ||
            result.address.state ||
            result.display_name.split(",")[0];

        const location: LocationResult = {
            id: result.place_id,
            name,
            displayName: result.display_name,
            type: getLocationType(result.type),
            country: result.address.country || "",
        };

        return location;
    } catch (error) {
        console.error("Failed to resolve location:", error);
        return null;
    }
}
