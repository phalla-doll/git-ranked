import type { GitHubUserDetail } from "@/types";
import { StatCard } from "./StatCard";

interface StatsGridProps {
    totalCount: number;
    users: GitHubUserDetail[];
}

export function StatsGrid({ totalCount, users }: StatsGridProps) {
    const maxFollowers =
        users.length > 0 ? Math.max(...users.map((u) => u.followers)) : 0;
    const totalRepos = users.reduce((acc, user) => acc + user.public_repos, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-sm overflow-hidden">
            <div className="p-8">
                <StatCard
                    label="Total Developers"
                    value={totalCount ? totalCount.toLocaleString() : "-"}
                />
            </div>
            <div className="p-8">
                <StatCard
                    label="Top Influence"
                    value={
                        users.length > 0 ? maxFollowers.toLocaleString() : "-"
                    }
                />
            </div>
            <div className="p-8">
                <StatCard
                    label="Total Repositories"
                    value={totalRepos ? totalRepos.toLocaleString() : "-"}
                />
            </div>
        </div>
    );
}
