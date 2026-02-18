import { Loading03Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { analytics } from "@/lib/analytics";

interface PageFooterProps {
    location: string;
    userSearchQuery: string;
    onUserSearchChange: (query: string) => void;
    isSearchingUser: boolean;
    onUserSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PageFooter({
    location,
    userSearchQuery,
    onUserSearchChange,
    isSearchingUser,
    onUserSearchKeyDown,
}: PageFooterProps) {
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
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-apple-blue/50 transition-all w-full md:w-64">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            size={16}
                            color="currentColor"
                            className="text-gray-400"
                            strokeWidth={1.5}
                        />
                        <input
                            type="text"
                            placeholder="Find user…"
                            className="bg-transparent border-none focus:outline-none text-sm w-full text-apple-text placeholder-gray-400 font-medium"
                            value={userSearchQuery}
                            onChange={(e) => onUserSearchChange(e.target.value)}
                            onKeyDown={onUserSearchKeyDown}
                            disabled={isSearchingUser}
                            aria-label="Search for a user"
                        />
                        {isSearchingUser && (
                            <HugeiconsIcon
                                icon={Loading03Icon}
                                size={22}
                                color="#2563EB"
                                className="animate-spin"
                                strokeWidth={1.5}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    Crafted for fun and kept alive by{" "}
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
