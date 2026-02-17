import { useState } from "react";
import { POPULAR_LOCATIONS } from "@/data/locations";

export function useLocationSuggestions() {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleLocationChange = (value: string) => {
        if (value.trim().length > 0) {
            const filtered = POPULAR_LOCATIONS.filter(
                (loc) =>
                    loc.toLowerCase().includes(value.toLowerCase()) &&
                    loc.toLowerCase() !== value.toLowerCase(),
            ).slice(0, 6);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    return {
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleLocationChange,
    };
}
