import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function InfoBanner() {
    return (
        <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100 mt-6">
            <div>
                <h4 className="font-medium text-apple-blue mb-1">
                    Don&apos;t see yourself listed?
                </h4>
                <p className="text-sm text-blue-800/70 max-w-sm">
                    Try searching for your exact username in the search bar
                    above to verify your stats.
                </p>
            </div>
            <div className="hidden sm:block p-3 bg-white rounded-full text-apple-blue shadow-sm">
                <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={20}
                    color="#2563EB"
                    strokeWidth={1.5}
                />
            </div>
        </div>
    );
}
