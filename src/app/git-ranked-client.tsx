"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LocationSearch } from "@/components/LocationSearch";
import { PageFooter } from "@/components/PageFooter";
import { PageNavigation } from "@/components/PageNavigation";
import { SortOptions } from "@/components/SortOptions";
import { UserModal } from "@/components/UserModal";
import { useUsers } from "@/hooks/useUsers";
import { analytics } from "@/lib/analytics";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

interface GitRankedClientProps {
    initialLocation: string;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return "recently";
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return "today";
    } else if (diffDays === 1) {
        return "yesterday";
    } else if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }
}

export function GitRankedClient({ initialLocation }: GitRankedClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [location, setLocation] = useState(initialLocation);
    const [inputValue, setInputValue] = useState(initialLocation);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.CONTRIBUTIONS);
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
        dataAsof,
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
                const response = await fetch(
                    `/api/github/users/${searchUsername}`,
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch user");
                }

                const user = await response.json();

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
            case SortOption.CONTRIBUTIONS:
                return "Top Contributors";
            default:
                return "Top Profiles";
        }
    };

    const displayLocation = location || "Cambodia";

    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white">
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

                    <div
                        aria-hidden="true"
                        className="hidden md:flex shrink-0 self-center pr-4 select-none pointer-events-none"
                    >
                        <svg
                            viewBox="0 0 1024 1024"
                            fill="none"
                            aria-hidden="true"
                            role="presentation"
                            className="t-float w-40 h-40 lg:w-48 lg:h-48 text-gray-900/10"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                                transform="scale(64)"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                </div>

                {/*<StatsGrid
                    totalCount={totalCount}
                    users={users}
                    sortBy={sortBy}
                />*/}

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-4">
                        <div>
                            <h2 className="text-xl font-medium text-apple-text">
                                {getListTitle()}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Rankings last updated:{" "}
                                {dataAsof
                                    ? formatRelativeTime(dataAsof)
                                    : "recently"}
                                . Click on a user to see their latest data.
                            </p>
                        </div>

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
                                const response = await fetch(
                                    `/api/github/users/${user.login}`,
                                );

                                if (!response.ok) {
                                    console.error(
                                        "Failed to fetch user details",
                                    );
                                    return;
                                }

                                const fullUser = await response.json();
                                if (fullUser) {
                                    setModalUser(fullUser);
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
