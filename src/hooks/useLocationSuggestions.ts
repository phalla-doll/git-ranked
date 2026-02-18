import { useCallback, useRef, useState } from "react";
import {
    formatLocationName,
    type LocationResult,
    resolveLocation as resolveLocationService,
    searchLocations,
} from "@/lib/services/locationService";

const DEBOUNCE_MS = 1500;

export function useLocationSuggestions() {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleLocationChange = useCallback((value: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setShowSuggestions(true);
        setIsLoading(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchLocations(value);

                const uniqueLocations = new Set<string>();
                const formattedSuggestions: string[] = [];

                for (const location of results) {
                    const formatted = formatLocationName(location);
                    if (!uniqueLocations.has(formatted)) {
                        uniqueLocations.add(formatted);
                        formattedSuggestions.push(formatted);
                    }
                }

                setSuggestions(formattedSuggestions.slice(0, 6));
            } catch (error) {
                console.error("Error fetching location suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, DEBOUNCE_MS);
    }, []);

    const resolveLocation = useCallback(
        async (input: string): Promise<LocationResult | null> => {
            return resolveLocationService(input);
        },
        [],
    );

    return {
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleLocationChange,
        isLoading,
        resolveLocation,
    };
}

export type { LocationResult };
