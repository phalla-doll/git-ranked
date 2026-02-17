import { useCallback, useEffect, useState } from "react";
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

    const fetchUsers = useCallback(
        async (loc: string, p: number) => {
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
                } = await searchUsersInLocation(loc, sortBy, p, apiKey);

                if (apiError) {
                    setError(apiError);
                } else {
                    setUsers(fetchedUsers);
                    setTotalCount(total_count);
                    setRateLimitHit(rateLimited);
                }
            } catch (error) {
                console.error(error);
                setError(
                    "An unexpected error occurred while processing your request.",
                );
            } finally {
                setLoading(false);
            }
        },
        [sortBy, apiKey],
    );

    useEffect(() => {
        fetchUsers(location, page);
    }, [fetchUsers, location, page]);

    return {
        users,
        loading,
        error,
        totalCount,
        rateLimitHit,
        fetchUsers,
    };
}
