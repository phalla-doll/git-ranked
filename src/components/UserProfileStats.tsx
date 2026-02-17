import {
    BookOpen01Icon,
    Calendar01Icon,
    StarIcon,
    UserAdd01Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

interface UserProfileStatsProps {
    user: GitHubUserDetail;
    sortBy: SortOption;
    className?: string;
    flat?: boolean;
}

const StatBox = ({
    label,
    value,
    icon: Icon,
    highlight = false,
}: {
    label: string;
    value: string | number;
    icon?: any;
    highlight?: boolean;
}) => (
    <div
        className={`flex flex-col items-center justify-center py-3 px-1 h-full transition-colors relative ${
            highlight ? "bg-blue-50/50" : ""
        }`}
    >
        <span
            className={`text-sm sm:text-base font-semibold leading-none ${
                highlight ? "text-apple-blue" : "text-apple-text"
            }`}
        >
            {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        <div className="flex items-center gap-1.5 mt-1.5">
            {Icon && (
                <HugeiconsIcon
                    icon={Icon}
                    size={12}
                    color={highlight ? "#2563EB" : "currentColor"}
                    strokeWidth={1.5}
                    className={highlight ? "text-apple-blue" : "text-gray-400"}
                />
            )}
            <span
                className={`text-[10px] uppercase font-medium tracking-wide ${
                    highlight ? "text-apple-blue" : "text-apple-gray"
                }`}
            >
                {label}
            </span>
        </div>
    </div>
);

export const UserProfileStats = ({
    user,
    sortBy,
    className = "",
    flat = false,
}: UserProfileStatsProps) => {
    return (
        <div
            className={`grid grid-cols-5 divide-x divide-gray-100 ${flat ? "" : "bg-gray-50 rounded-xl border border-gray-100"} overflow-hidden h-full ${className}`}
        >
            <StatBox
                label="Repos"
                value={user.public_repos}
                icon={BookOpen01Icon}
                highlight={sortBy === SortOption.REPOS}
            />
            <StatBox
                label="Followers"
                value={user.followers}
                icon={UserGroupIcon}
                highlight={sortBy === SortOption.FOLLOWERS}
            />
            <StatBox
                label="Following"
                value={user.following}
                icon={UserAdd01Icon}
            />
            <StatBox
                label="Stars"
                value={user.total_stars !== undefined ? user.total_stars : "-"}
                icon={StarIcon}
            />
            <StatBox
                label="Contribs"
                value={
                    user.recent_activity_count !== undefined
                        ? user.recent_activity_count
                        : "-"
                }
                icon={Calendar01Icon}
            />
        </div>
    );
};
