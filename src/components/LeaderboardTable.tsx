import {
    AlertDiamondIcon,
    ArrowUpRight01Icon,
    Loading03Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { type CSSProperties, memo, useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

interface LeaderboardTableProps {
    users: GitHubUserDetail[];
    sortBy: SortOption;
    loading: boolean;
    loadingMore?: boolean;
    error?: string | null;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onUserClick: (user: GitHubUserDetail) => void;
}

const rankColorClass = (rank: number) => {
    if (rank === 1) {
        return "text-yellow-600";
    }
    if (rank === 2) {
        return "text-gray-600";
    }
    if (rank === 3) {
        return "text-orange-700";
    }
    return "text-gray-500";
};

const RankBadge = ({ rank }: { rank: number }) => {
    return (
        <div
            className={`flex items-center justify-center gap-1.5 w-8 font-medium ${rankColorClass(rank)}`}
        >
            <span className="w-4 text-center">#{rank}</span>
        </div>
    );
};

const MobileStat = ({
    label,
    value,
    highlighted = false,
}: {
    label: string;
    value: number;
    highlighted?: boolean;
}) => {
    return (
        <div className="flex flex-col items-center text-center gap-0.5 min-w-0">
            <span
                className={`text-sm font-semibold tabular-nums ${
                    highlighted ? "text-apple-blue" : "text-gray-700"
                }`}
            >
                {value.toLocaleString()}
            </span>
            <span className="text-[10px] tracking-wide text-gray-400 uppercase truncate w-full">
                {label}
            </span>
        </div>
    );
};

export const LeaderboardTable = memo(
    ({
        users,
        sortBy,
        loading,
        loadingMore,
        error,
        hasMore,
        onLoadMore,
        onUserClick,
    }: LeaderboardTableProps) => {
        const sentinelRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!hasMore || !onLoadMore) {
                return;
            }

            const sentinel = sentinelRef.current;
            if (!sentinel) {
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        onLoadMore();
                    }
                },
                { rootMargin: "100px" },
            );

            observer.observe(sentinel);

            return () => {
                observer.disconnect();
            };
        }, [hasMore, onLoadMore]);

        // Loading / error / empty are rendered INSIDE the table body and the
        // mobile list so the header (and the container's dimensions) stay
        // mounted at all times — preventing layout shift when switching filters.
        const isEmpty = users.length === 0;
        const showState = loading || !!error || isEmpty;

        const stateContent = (
            <div className="flex flex-col items-center justify-center text-center min-h-100">
                {loading ? (
                    <>
                        <HugeiconsIcon
                            icon={Loading03Icon}
                            size={32}
                            color="currentColor"
                            className="text-gray-400 animate-spin mb-4"
                        />
                        <p className="text-apple-text font-medium text-lg">
                            Loading profiles…
                        </p>
                        <p className="text-apple-gray text-sm mt-1">
                            Analyzing GitHub data…
                        </p>
                    </>
                ) : error ? (
                    <>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <HugeiconsIcon
                                icon={AlertDiamondIcon}
                                size={20}
                                color="#EF4444"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="text-apple-text font-medium text-lg">
                            Connection Issue
                        </h3>
                        <p className="text-apple-gray text-sm text-center max-w-xs mt-2">
                            {error}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={32}
                                color="currentColor"
                                className="text-gray-300"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="text-apple-text font-medium text-lg">
                            No Developers Found
                        </h3>
                        <p className="text-apple-gray mt-2 max-w-sm text-center text-sm">
                            Try adjusting your location or search terms.
                        </p>
                    </>
                )}
            </div>
        );

        return (
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden relative min-h-125">
                {/* Mobile: stacked card layout — shows all fields without horizontal scroll */}
                <ul className="divide-y divide-gray-100 md:hidden">
                    {showState ? (
                        <li>{stateContent}</li>
                    ) : (
                        users.map((user, index) => {
                            return (
                                <li
                                    key={
                                        user.login ||
                                        user.id ||
                                        `user-m-${index}`
                                    }
                                    className="t-row-reveal"
                                    style={
                                        {
                                            "--row-delay": `${Math.min(index, 8) * 40}ms`,
                                        } as CSSProperties
                                    }
                                >
                                    {/* biome-ignore lint/a11y/useSemanticElements: a native <button> can't wrap the nested @username <a>, which broke row clicks; this stays keyboard-accessible. */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => onUserClick(user)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                onUserClick(user);
                                            }
                                        }}
                                        className="group w-full px-4 py-3.5 text-left hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                <Image
                                                    src={
                                                        user.avatar_url ||
                                                        `https://ui-avatars.com/api/?name=${user.login}&background=random`
                                                    }
                                                    alt={
                                                        user.login ||
                                                        "User avatar"
                                                    }
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 object-cover shadow-sm"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-apple-text truncate">
                                                    {user.name || user.login}
                                                </h3>
                                                <a
                                                    href={`https://github.com/${user.login}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        analytics.githubProfileClick(
                                                            user.login,
                                                            "table",
                                                        );
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors truncate block"
                                                >
                                                    @{user.login}
                                                </a>
                                            </div>
                                            <span
                                                aria-hidden="true"
                                                className={`shrink-0 self-start -mt-0.5 text-5xl font-bold tabular-nums leading-none tracking-tight select-none opacity-70 [mask-image:linear-gradient(to_bottom,black_30%,transparent_90%)] ${rankColorClass(index + 1)}`}
                                            >
                                                {index + 1}
                                            </span>
                                            <span className="sr-only">
                                                Rank {index + 1}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1 mt-3 rounded-xl bg-gray-50/60 px-2 py-2.5">
                                            <MobileStat
                                                label="Contributions"
                                                value={
                                                    user.recent_activity_count ??
                                                    0
                                                }
                                                highlighted={
                                                    sortBy ===
                                                    SortOption.CONTRIBUTIONS
                                                }
                                            />
                                            <MobileStat
                                                label="Followers"
                                                value={user.followers}
                                                highlighted={
                                                    sortBy ===
                                                    SortOption.FOLLOWERS
                                                }
                                            />
                                            <MobileStat
                                                label="Repos"
                                                value={user.public_repos}
                                                highlighted={
                                                    sortBy === SortOption.REPOS
                                                }
                                            />
                                            <MobileStat
                                                label="Gists"
                                                value={user.public_gists}
                                            />
                                        </div>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>

                {/* Desktop: full table layout */}
                <div className="overflow-x-auto overflow-y-clip hidden md:block">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200/60">
                                <th className="px-6 py-4 w-20 text-center text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Rank
                                </th>
                                <th className="px-6 py-4  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Developer
                                </th>
                                <th className="px-6 py-4 text-right w-32  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Contributions
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden sm:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Followers
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden md:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Repos
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden lg:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Gists
                                </th>
                                <th className="px-6 py-4 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {showState ? (
                                <tr>
                                    <td colSpan={7} className="px-6">
                                        {stateContent}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => {
                                    return (
                                        <tr
                                            key={
                                                user.login ||
                                                user.id ||
                                                `user-${index}`
                                            }
                                            onClick={() => onUserClick(user)}
                                            className="group t-row-reveal hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer"
                                            style={
                                                {
                                                    "--row-delay": `${Math.min(index, 8) * 40}ms`,
                                                } as CSSProperties
                                            }
                                        >
                                            <td className="px-6 py-4 text-center">
                                                <RankBadge rank={index + 1} />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative shrink-0">
                                                        <Image
                                                            src={
                                                                user.avatar_url ||
                                                                `https://ui-avatars.com/api/?name=${user.login}&background=random`
                                                            }
                                                            alt={
                                                                user.login ||
                                                                "User avatar"
                                                            }
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 object-cover shadow-sm group-hover:scale-105 transition-transform"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-apple-text truncate group-hover:text-apple-blue transition-colors">
                                                                {user.name ||
                                                                    user.login}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <a
                                                                href={`https://github.com/${user.login}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    analytics.githubProfileClick(
                                                                        user.login,
                                                                        "table",
                                                                    );
                                                                }}
                                                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors truncate"
                                                            >
                                                                @{user.login}
                                                            </a>
                                                            {(user.company ||
                                                                user.location) && (
                                                                <>
                                                                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                                                                    <span className="text-[10px] text-gray-400 truncate max-w-37.5 hidden sm:block">
                                                                        {user.company ||
                                                                            user.location}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className={`font-medium ${
                                                            sortBy ===
                                                            SortOption.CONTRIBUTIONS
                                                                ? "text-apple-blue"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {(
                                                            user.recent_activity_count ??
                                                            0
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right hidden sm:table-cell">
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className={`font-medium ${
                                                            sortBy ===
                                                            SortOption.FOLLOWERS
                                                                ? "text-apple-blue"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {user.followers.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right hidden md:table-cell">
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className={`font-medium ${
                                                            sortBy ===
                                                            SortOption.REPOS
                                                                ? "text-apple-blue"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        {user.public_repos.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right hidden lg:table-cell">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-medium text-gray-700">
                                                        {user.public_gists.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`https://github.com/${user.login}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        analytics.githubProfileClick(
                                                            user.login,
                                                            "table",
                                                        );
                                                    }}
                                                    aria-label={`View ${user.login} on GitHub`}
                                                    className="inline-flex p-2.5 text-gray-300 hover:text-apple-blue hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 min-h-11 min-w-11 items-center justify-center sm:opacity-100"
                                                >
                                                    <HugeiconsIcon
                                                        icon={
                                                            ArrowUpRight01Icon
                                                        }
                                                        size={16}
                                                        color="currentColor"
                                                    />
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!showState && hasMore && (
                    <div
                        ref={sentinelRef}
                        className="h-10 py-6 flex items-center justify-center"
                    >
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <HugeiconsIcon
                                    icon={Loading03Icon}
                                    size={16}
                                    className="animate-spin"
                                />
                                Loading more…
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    },
);
