import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";

interface LocationSearchProps {
    location: string;
    suggestions: string[];
    showSuggestions: boolean;
    onLocationChange: (value: string) => void;
    onSearch: () => void;
    onLocationFocus: () => void;
    onSelectSuggestion: (suggestion: string) => void;
}

export function LocationSearch({
    location,
    suggestions,
    showSuggestions,
    onLocationChange,
    onSearch,
    onLocationFocus,
    onSelectSuggestion,
}: LocationSearchProps) {
    const suggestionsRef = useRef<HTMLUListElement>(null);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSearch();
            }}
            className="relative group"
        >
            <div className="relative shadow-soft rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        size={20}
                        color="currentColor"
                        className="text-gray-400"
                        strokeWidth={1.5}
                    />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-0 ring-1 ring-gray-200 text-apple-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-all font-medium text-lg"
                    placeholder="Search by location (e.g. Phnom Penh)..."
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    onFocus={onLocationFocus}
                    autoComplete="off"
                />
                <div className="absolute inset-y-2 right-2">
                    <button
                        type="submit"
                        className="h-full px-6 bg-apple-blue hover:bg-apple-blueHover text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Search
                    </button>
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <ul
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-hover border border-gray-100 z-50 max-h-60 overflow-y-auto py-2"
                    >
                        {suggestions.map((suggestion) => (
                            <li key={suggestion}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onSelectSuggestion(suggestion)
                                    }
                                    className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
                                >
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </form>
    );
}
