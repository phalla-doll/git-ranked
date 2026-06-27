import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { analytics } from "@/lib/analytics";

interface PageFooterProps {
    location: string;
    onOpenSearch: () => void;
}

export function PageFooter({ location, onOpenSearch }: PageFooterProps) {
    return (
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="md:max-w-lg">
                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Image
                                src="/favicon-32x32.png"
                                alt="GitRanked"
                                width={24}
                                height={24}
                            />
                            GitRanked {location}
                        </p>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Discover the most active developers in
                            {` ${location}'s`} open source community. This
                            leaderboard highlights local talent to inspire and
                            connect fellow developers.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-start shrink-0 space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                            Don&apos;t see yourself listed?
                        </p>
                        <p className="text-xs text-gray-500">
                            Try searching for your exact username to verify your
                            stats.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onOpenSearch}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/70 rounded-full px-4 py-2.5 ring-1 ring-gray-200 transition-all w-full md:w-64 text-left cursor-pointer"
                        aria-label="Search for a user"
                    >
                        <HugeiconsIcon
                            icon={Search01Icon}
                            size={16}
                            color="currentColor"
                            className="text-gray-400 shrink-0"
                            strokeWidth={1.5}
                        />
                        <span className="text-sm text-gray-400 font-medium">
                            Find user…
                        </span>
                    </button>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    Created and maintained by{" "}
                    <a
                        href="https://manthaa.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => analytics.externalLinkClick("mantha")}
                        className="font-medium text-gray-900 hover:underline transition-colors"
                    >
                        Mantha
                    </a>
                </p>
            </div>
        </footer>
    );
}
