import { SortOption } from "@/types";

interface SortOptionsProps {
    sortBy: SortOption;
    onSortChange: (option: SortOption) => void;
}

export function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
    const options = [
        { id: SortOption.FOLLOWERS, label: "Followers" },
        { id: SortOption.REPOS, label: "Repositories" },
        { id: SortOption.JOINED, label: "Newest" },
    ] as const;

    return (
        <div className="flex overflow-x-auto custom-scrollbar bg-gray-200/50 p-1 rounded-xl w-full sm:w-auto">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onSortChange(option.id)}
                    className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ease-out whitespace-nowrap ${
                        sortBy === option.id
                            ? "bg-white text-apple-text shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
