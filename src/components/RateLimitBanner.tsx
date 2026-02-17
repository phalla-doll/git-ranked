import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface RateLimitBannerProps {
    rateLimitHit: boolean;
    onAddKey: () => void;
}

export function RateLimitBanner({
    rateLimitHit,
    onAddKey,
}: RateLimitBannerProps) {
    if (!rateLimitHit) return null;

    return (
        <div className="bg-orange-50 border-b border-orange-100 relative z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={AlertCircleIcon}
                        size={16}
                        color="#F97316"
                        strokeWidth={1.5}
                    />
                    <span className="text-xs font-medium text-orange-800">
                        Rate limit reached. Showing cached data.
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onAddKey}
                    className="text-[10px] font-medium text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
                >
                    Add Key
                </button>
            </div>
        </div>
    );
}
