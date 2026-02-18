import {
    AlertDiamondIcon,
    ArrowUpRight01Icon,
    Award01Icon,
    Loading03Icon,
    Medal01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { memo } from "react";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

interface LeaderboardTableProps {
    users: GitHubUserDetail[];
    sortBy: SortOption;
    loading: boolean;
    error?: string | null;
    page: number;
    loadingProgress?: { current: number; total: number } | null;
    onUserClick: (user: GitHubUserDetail) => void;
}

const RankBadge = ({ rank }: { rank: number }) => {
    let colorClass = "text-gray-500 font-medium";
    let icon = null;

    if (rank === 1) {
        colorClass = "text-yellow-600 font-medium scale-110";
        icon = (
            <HugeiconsIcon
                icon={Award01Icon}
                size={20}
                color="#EAB308"
                strokeWidth={1.5}
                className="fill-yellow-500/20"
            />
        );
    } else if (rank === 2) {
        colorClass = "text-gray-600 font-medium scale-105";
        icon = (
            <HugeiconsIcon
                icon={Medal01Icon}
                size={20}
                color="#9CA3AF"
                strokeWidth={1.5}
                className="fill-gray-400/20"
            />
        );
    } else if (rank === 3) {
        colorClass = "text-orange-700 font-medium scale-105";
        icon = (
            <HugeiconsIcon
                icon={Medal01Icon}
                size={20}
                color="#F97316"
                strokeWidth={1.5}
                className="fill-orange-500/20"
            />
        );
    }

    return (
        <div
            className={`flex items-center justify-center gap-1.5 w-8 ${colorClass}`}
        >
            {icon ? icon : <span className="w-4 text-center">#{rank}</span>}
        </div>
    );
};

export const LeaderboardTable = memo(
    ({
        users,
        sortBy,
        loading,
        error,
        page,
        loadingProgress,
        onUserClick,
    }: LeaderboardTableProps) => {
        if (loading && users.length === 0) {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-100">
                    <div className="flex flex-col items-center">
                        <HugeiconsIcon
                            icon={Loading03Icon}
                            size={32}
                            color="currentColor"
                            className="text-gray-400 animate-spin mb-4"
                        />
                        <p className="text-apple-text font-medium text-lg">
                            {loadingProgress
                                ? `Fetching all users... ${loadingProgress.current?.toLocaleString() || 0}/${loadingProgress.total?.toLocaleString() || 0}`
                                : "Loading profiles..."}
                        </p>
                        <p className="text-apple-gray text-sm mt-1">
                            {loadingProgress
                                ? "Sorting by contributions."
                                : "Analyzing GitHub data."}
                        </p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center min-h-100">
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
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-100">
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
                </div>
            );
        }

        const baseRank = (page - 1) * 100;

        return (
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden relative min-h-125">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200/60">
                                <th className="px-6 py-4 w-20 text-center text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Rank
                                </th>
                                <th className="px-6 py-4  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Developer
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden sm:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Followers
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden md:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Repos
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden lg:table-cell  text-xs font-normal tracking-wide text-gray-500 uppercase">
                                    Contribs
                                </th>
                                <th className="px-6 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user, index) => {
                                const currentRank = baseRank + index + 1;
                                return (
                                    <tr
                                        key={
                                            user.login ||
                                            user.id ||
                                            `user-${index}`
                                        }
                                        onClick={() => onUserClick(user)}
                                        className="group hover:bg-blue-50/30 transition-colors duration-200 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <RankBadge rank={currentRank} />
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
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
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
                                                    {user.recent_activity_count !==
                                                    undefined
                                                        ? user.recent_activity_count.toLocaleString()
                                                        : "-"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`https://github.com/${user.login}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className="inline-flex p-2 text-gray-300 hover:text-apple-blue hover:bg-blue-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <HugeiconsIcon
                                                    icon={ArrowUpRight01Icon}
                                                    size={16}
                                                    color="currentColor"
                                                />
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <HugeiconsIcon
                            icon={Loading03Icon}
                            size={32}
                            color="currentColor"
                            className="text-apple-blue animate-spin"
                        />
                    </div>
                )}
            </div>
        );
    },
);
