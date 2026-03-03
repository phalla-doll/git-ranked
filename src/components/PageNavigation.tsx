import { Loading03Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

interface PageNavigationProps {
    userSearchQuery: string;
    onUserSearchChange: (query: string) => void;
    isSearchingUser: boolean;
    onUserSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PageNavigation({
    userSearchQuery,
    onUserSearchChange,
    isSearchingUser,
    onUserSearchKeyDown,
}: PageNavigationProps) {
    return (
        <nav className="glass-panel sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/favicon-32x32.png"
                            alt="GitRanked"
                            width={28}
                            height={28}
                            className="size-7"
                        />
                        <div className="flex flex-col">
                            <span className="font-medium text-lg text-apple-text leading-none tracking-tight">
                                GitRanked
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-apple-blue/20 transition-all w-64">
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
                                onChange={(e) =>
                                    onUserSearchChange(e.target.value)
                                }
                                onKeyDown={onUserSearchKeyDown}
                                disabled={isSearchingUser}
                                aria-label="Search for a user"
                            />
                            {isSearchingUser && (
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    size={20}
                                    color="#2563EB"
                                    className="animate-spin"
                                    strokeWidth={1.5}
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            className="md:hidden p-2.5 rounded-full transition-all text-gray-500 hover:bg-gray-100 min-h-11 min-w-11 flex items-center justify-center"
                            onClick={() => {
                                const query = prompt(
                                    "Search for a GitHub user:",
                                );
                                if (query?.trim()) {
                                    onUserSearchChange(query.trim());
                                    onUserSearchKeyDown({
                                        key: "Enter",
                                        preventDefault: () => {},
                                    } as React.KeyboardEvent<HTMLInputElement>);
                                }
                            }}
                            aria-label="Search for a user"
                        >
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={20}
                                color="currentColor"
                                strokeWidth={1.5}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
