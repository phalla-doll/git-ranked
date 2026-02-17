import {
    Activity,
    AlertTriangle,
    Building,
    ExternalLink,
    MapPin,
    Medal,
    SearchX,
    Trophy,
} from "lucide-react";
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
    onUserClick: (user: GitHubUserDetail) => void;
}

const RankBadge = ({ rank }: { rank: number }) => {
    let colorClass = "text-gray-500 font-medium";
    let icon = null;

    if (rank === 1) {
        colorClass = "text-yellow-600 font-medium scale-110";
        icon = (
            <Trophy size={16} className="text-yellow-500 fill-yellow-500/20" />
        );
    } else if (rank === 2) {
        colorClass = "text-gray-600 font-medium scale-105";
        icon = <Medal size={16} className="text-gray-400 fill-gray-400/20" />;
    } else if (rank === 3) {
        colorClass = "text-orange-700 font-medium scale-105";
        icon = (
            <Medal size={16} className="text-orange-500 fill-orange-500/20" />
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
        onUserClick,
    }: LeaderboardTableProps) => {
        if (loading && users.length === 0) {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Activity className="text-gray-400" size={20} />
                        </div>
                        <p className="text-apple-text font-medium text-lg">
                            Loading profiles...
                        </p>
                        <p className="text-apple-gray text-sm mt-1">
                            Analyzing GitHub data.
                        </p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={20} />
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
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <SearchX size={32} className="text-gray-300" />
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
            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden relative min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200/60 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                <th className="px-6 py-4 w-20 text-center">
                                    Rank
                                </th>
                                <th className="px-6 py-4">Developer</th>
                                <th className="px-6 py-4 text-right w-32 hidden sm:table-cell">
                                    Followers
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden md:table-cell">
                                    Repos
                                </th>
                                <th className="px-6 py-4 text-right w-32 hidden lg:table-cell">
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
                                        key={user.id}
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
                                                        src={user.avatar_url}
                                                        alt={user.login}
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
                                                                <span className="text-[10px] text-gray-400 truncate max-w-[150px] hidden sm:block">
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
                                                <ExternalLink size={16} />
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
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-apple-blue rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        );
    },
);
