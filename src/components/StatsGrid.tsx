import { StatCard } from "@/components/StatCard";
import type { GitHubUserDetail, SortOption } from "@/types";
import { SortOption as SO } from "@/types";

interface StatsGridProps {
    totalCount: number;
    users: GitHubUserDetail[];
    sortBy: SortOption;
}

function getDynamicStats(
    users: GitHubUserDetail[],
    sortBy: SortOption,
): { label: string; value: string }[] {
    const stats: { label: string; value: string }[] = [];

    const maxFollowers =
        users.length > 0 ? Math.max(...users.map((u) => u.followers)) : 0;
    const totalRepos = users.reduce((acc, user) => acc + user.public_repos, 0);
    const maxRepos =
        users.length > 0 ? Math.max(...users.map((u) => u.public_repos)) : 0;
    const maxContributions =
        users.length > 0
            ? Math.max(...users.map((u) => u.recent_activity_count ?? 0))
            : 0;

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const joinedLast3Months = users.filter(
        (u) => new Date(u.created_at) >= threeMonthsAgo,
    ).length;
    const joinedThisMonth = users.filter(
        (u) => new Date(u.created_at) >= firstDayOfMonth,
    ).length;

    switch (sortBy) {
        case SO.FOLLOWERS:
            stats.push(
                {
                    label: "Most Followers",
                    value:
                        maxFollowers > 0 ? maxFollowers.toLocaleString() : "-",
                },
                {
                    label: "Total Repositories",
                    value: totalRepos > 0 ? totalRepos.toLocaleString() : "-",
                },
            );
            break;
        case SO.REPOS:
            stats.push(
                {
                    label: "Most Repositories",
                    value: maxRepos > 0 ? maxRepos.toLocaleString() : "-",
                },
                {
                    label: "Total Repositories",
                    value: totalRepos > 0 ? totalRepos.toLocaleString() : "-",
                },
            );
            break;
        case SO.JOINED:
            stats.push(
                {
                    label: "Joined Last 3 Months",
                    value:
                        joinedLast3Months > 0
                            ? joinedLast3Months.toLocaleString()
                            : "-",
                },
                {
                    label: "Joined This Month",
                    value:
                        joinedThisMonth > 0
                            ? joinedThisMonth.toLocaleString()
                            : "-",
                },
            );
            break;
        case SO.CONTRIBUTIONS:
            stats.push(
                {
                    label: "Top Contributor",
                    value:
                        maxContributions > 0
                            ? maxContributions.toLocaleString()
                            : "-",
                },
                {
                    label: "Total Repositories",
                    value: totalRepos > 0 ? totalRepos.toLocaleString() : "-",
                },
            );
            break;
        default:
            stats.push(
                {
                    label: "Most Followers",
                    value:
                        maxFollowers > 0 ? maxFollowers.toLocaleString() : "-",
                },
                {
                    label: "Total Repositories",
                    value: totalRepos > 0 ? totalRepos.toLocaleString() : "-",
                },
            );
    }

    return stats;
}

export function StatsGrid({ totalCount, users, sortBy }: StatsGridProps) {
    const [stat2, stat3] = getDynamicStats(users, sortBy);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
                <StatCard
                    label="Total Developers"
                    value={totalCount ? totalCount.toLocaleString() : "-"}
                />
            </div>
            <div className="p-6 md:p-8">
                <StatCard label={stat2.label} value={stat2.value} />
            </div>
            <div className="p-6 md:p-8">
                <StatCard label={stat3.label} value={stat3.value} />
            </div>
        </div>
    );
}
