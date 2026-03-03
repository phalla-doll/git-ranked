"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LocationSearch } from "@/components/LocationSearch";
import { PageFooter } from "@/components/PageFooter";
import { PageNavigation } from "@/components/PageNavigation";
import { SortOptions } from "@/components/SortOptions";
import { StatsGrid } from "@/components/StatsGrid";
import { UserModal } from "@/components/UserModal";
import { useUsers } from "@/hooks/useUsers";
import { analytics } from "@/lib/analytics";
import { getUserByName } from "@/lib/services/githubService";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

interface GitRankedClientProps {
    initialLocation: string;
}

export function GitRankedClient({ initialLocation }: GitRankedClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [location, setLocation] = useState(initialLocation);
    const [inputValue, setInputValue] = useState(initialLocation);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
    const [refreshKey, _setRefreshKey] = useState(0);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
    const [modalRank, setModalRank] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
    const [isPending, _startTransition] = useTransition();
    const modalOpenTimeRef = useRef<number | null>(null);

    const {
        users,
        loading,
        loadingMore,
        error,
        totalCount,
        hasMore,
        loadMore,
    } = useUsers(location, sortBy, refreshKey);

    useEffect(() => {
        if (!searchParams.get("location")) {
            router.replace("?location=Cambodia");
        }
    }, [searchParams, router]);

    const handleSearch = useCallback(() => {
        const sanitized = inputValue
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .replace(/\s+/g, " ");
        if (!sanitized) {
            return;
        }
        setLocation(sanitized);
        router.push(`?location=${encodeURIComponent(sanitized)}`);
        analytics.locationSearch(sanitized, totalCount);
    }, [inputValue, router, totalCount]);

    const handleUserSearchKeyDown = async (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Enter" && userSearchQuery.trim()) {
            const searchUsername = userSearchQuery.trim();
            setIsSearchingUser(true);
            try {
                const user = await getUserByName(searchUsername);
                if (user) {
                    analytics.userSearch(searchUsername, true);
                    setModalUser(user);
                    setIsModalOpen(true);
                    modalOpenTimeRef.current = Date.now();
                    analytics.userModalOpen(searchUsername);
                    setUserSearchQuery("");
                } else {
                    analytics.userSearch(searchUsername, false);
                    analytics.userNotFound(searchUsername);
                    alert("User not found!");
                }
            } catch (err) {
                console.error(err);
                analytics.userSearch(searchUsername, false);
                alert("Error searching for user.");
            } finally {
                setIsSearchingUser(false);
            }
        }
    };

    const handleSortChange = useCallback((sort: SortOption) => {
        analytics.sortChange(sort);
        setSortBy(sort);
    }, []);

    const getListTitle = () => {
        switch (sortBy) {
            case SortOption.FOLLOWERS:
                return "Top Profiles by Followers";
            case SortOption.REPOS:
                return "Top Profiles by Repositories";
            case SortOption.JOINED:
                return "Newest Members";
            default:
                return "Top Profiles";
        }
    };

    const displayLocation = location || "Cambodia";

    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white pb-20">
            <PageNavigation
                userSearchQuery={userSearchQuery}
                onUserSearchChange={setUserSearchQuery}
                isSearchingUser={isSearchingUser}
                onUserSearchKeyDown={handleUserSearchKeyDown}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
                    <div className="w-full md:max-w-lg">
                        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-apple-text mb-3">
                            {displayLocation}&apos;s GitHub
                            <br />
                            Leaderboard
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Find most cracked devs in your local dev community.
                        </p>
                        <LocationSearch
                            location={inputValue}
                            onLocationChange={setInputValue}
                            onSearch={handleSearch}
                        />
                    </div>
                </div>

                <StatsGrid
                    totalCount={totalCount}
                    users={users}
                    sortBy={sortBy}
                />

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-4">
                        <h2 className="text-lg font-medium text-apple-text">
                            {getListTitle()}
                        </h2>

                        <SortOptions
                            sortBy={sortBy}
                            onSortChange={handleSortChange}
                        />
                    </div>

                    <LeaderboardTable
                        users={users}
                        sortBy={sortBy}
                        loading={isPending || loading}
                        loadingMore={loadingMore}
                        error={error}
                        hasMore={hasMore}
                        onLoadMore={loadMore}
                        onUserClick={async (user) => {
                            const rank = users.indexOf(user) + 1;
                            analytics.userRowClick(user.login, rank);
                            analytics.userModalOpen(user.login);
                            modalOpenTimeRef.current = Date.now();
                            setModalUser(user);
                            setModalRank(rank);
                            setIsModalOpen(true);
                            setIsLoadingUserDetail(true);
                            try {
                                const fullUser = await getUserByName(
                                    user.login,
                                );
                                if (fullUser) {
                                    setModalUser({
                                        ...user,
                                        total_stars: fullUser.total_stars,
                                    });
                                }
                            } catch (err) {
                                console.error(
                                    "Failed to fetch user details:",
                                    err,
                                );
                            } finally {
                                setIsLoadingUserDetail(false);
                            }
                        }}
                    />
                </div>
            </main>

            <UserModal
                user={modalUser}
                rank={modalRank ?? undefined}
                isOpen={isModalOpen}
                isLoading={isLoadingUserDetail}
                onClose={() => {
                    if (modalUser && modalOpenTimeRef.current) {
                        const duration = Date.now() - modalOpenTimeRef.current;
                        analytics.userModalClose(modalUser.login, duration);
                    }
                    setIsModalOpen(false);
                    setModalRank(null);
                    modalOpenTimeRef.current = null;
                }}
            />

            <PageFooter
                location={displayLocation}
                userSearchQuery={userSearchQuery}
                onUserSearchChange={setUserSearchQuery}
                isSearchingUser={isSearchingUser}
                onUserSearchKeyDown={handleUserSearchKeyDown}
            />
        </div>
    );
}

export function LoadingFallback() {
    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading…</div>
        </div>
    );
}
