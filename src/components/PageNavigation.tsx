import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";

interface PageNavigationProps {
    onOpenSearch: () => void;
}

export function PageNavigation({ onOpenSearch }: PageNavigationProps) {
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
                        <button
                            type="button"
                            onClick={onOpenSearch}
                            className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200/70 rounded-full px-4 py-2 transition-all w-64 text-left cursor-pointer"
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

                        <button
                            type="button"
                            className="md:hidden p-2.5 rounded-full transition-all text-gray-500 hover:bg-gray-100 min-h-11 min-w-11 flex items-center justify-center"
                            onClick={onOpenSearch}
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
