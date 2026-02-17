import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface PaginationControlsProps {
    page: number;
    usersCount: number;
    loading: boolean;
    onPageChange: (page: number) => void;
}

export function PaginationControls({
    page,
    usersCount,
    loading,
    onPageChange,
}: PaginationControlsProps) {
    return (
        <div className="flex justify-center items-center gap-6 mt-8">
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="p-2 text-gray-400 hover:text-apple-text disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
                <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={24}
                    color="currentColor"
                    strokeWidth={1.5}
                />
            </button>
            <span className="text-sm font-medium text-gray-500 tabular-nums">
                Page {page}
            </span>
            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={usersCount < 50 || loading}
                className="p-2 text-gray-400 hover:text-apple-text disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
                <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={24}
                    color="currentColor"
                    strokeWidth={1.5}
                />
            </button>
        </div>
    );
}
