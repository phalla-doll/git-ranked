import { useEffect, useState } from "react";
import { searchUsersInLocation } from "@/lib/services/githubService";
import type { GitHubUserDetail, SortOption } from "@/types";

export function useUsers(
    location: string,
    sortBy: SortOption,
    page: number,
    apiKey: string,
) {
    const [users, setUsers] = useState<GitHubUserDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [rateLimitHit, setRateLimitHit] = useState(false);
    const [cursors, setCursors] = useState<Record<number, string>>({});
    const [hasNextPage, setHasNextPage] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setUsers([]);
            setError(null);
            setRateLimitHit(false);
            try {
                const {
                    users: fetchedUsers,
                    total_count,
                    rateLimited,
                    error: apiError,
                    hasNextPage: hasNext,
                    endCursor,
                } = await searchUsersInLocation(
                    location,
                    sortBy,
                    page,
                    apiKey,
                    cursors[page - 1],
                );

                if (apiError) {
                    setError(apiError);
                } else {
                    setUsers(fetchedUsers);
                    setTotalCount(total_count);
                    setRateLimitHit(rateLimited);
                    setHasNextPage(hasNext);

                    if (endCursor && hasNext) {
                        setCursors((prev) => ({
                            ...prev,
                            [page]: endCursor,
                        }));
                    }
                }
            } catch (error) {
                console.error(error);
                setError(
                    "An unexpected error occurred while processing your request.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [location, page, sortBy, apiKey, cursors]);

    return {
        users,
        loading,
        error,
        totalCount,
        rateLimitHit,
        hasNextPage,
    };
}
