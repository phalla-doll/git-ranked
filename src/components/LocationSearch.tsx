import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface LocationSearchProps {
    location: string;
    onLocationChange: (value: string) => void;
    onSearch: () => void;
}

export function LocationSearch({
    location,
    onLocationChange,
    onSearch,
}: LocationSearchProps) {
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
                    className="block w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-0 text-apple-text placeholder-gray-400 focus:outline-none transition-all font-medium text-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-apple-blue/50"
                    placeholder="Search by country (e.g. Cambodia)..."
                    value={location}
                    onChange={(e) => onLocationChange(e.target.value)}
                    autoComplete="off"
                />
                <div className="absolute inset-y-2 right-2">
                    <button
                        type="submit"
                        className="h-full px-6 bg-apple-blue hover:bg-apple-blueHover text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        Search
                    </button>
                </div>
            </div>
        </form>
    );
}
