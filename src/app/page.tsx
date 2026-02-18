"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LocationSearch } from "@/components/LocationSearch";
import { PageFooter } from "@/components/PageFooter";
import { PageNavigation } from "@/components/PageNavigation";
import { PaginationControls } from "@/components/PaginationControls";
import { RateLimitBanner } from "@/components/RateLimitBanner";
import { SortOptions } from "@/components/SortOptions";
import { StatsGrid } from "@/components/StatsGrid";
import { TokenPromoModal } from "@/components/TokenPromoModalWrapper";
import { UserModal } from "@/components/UserModal";
import { useApiKey } from "@/hooks/useApiKey";
import { useUsers } from "@/hooks/useUsers";
import { getUserByName } from "@/lib/services/githubService";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

function GitRankedClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialLocation = searchParams.get("location") || "Cambodia";
    const [location, setLocation] = useState(initialLocation);
    const [inputValue, setInputValue] = useState(initialLocation);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [isPending, _startTransition] = useTransition();

    const { apiKey, setApiKey, saveApiKey } = useApiKey();
    const {
        users,
        loading,
        error,
        totalCount,
        rateLimitHit,
        rateLimitResetAt,
        hasNextPage,
        loadingProgress,
    } = useUsers(location, sortBy, page, apiKey, refreshKey);

    useEffect(() => {
        if (apiKey) return;

        const hideUntil = localStorage.getItem("gitranked_promo_hide_until");
        if (hideUntil) {
            const hideUntilDate = Number.parseInt(hideUntil, 10);
            if (Date.now() < hideUntilDate) {
                return;
            }
        }

        const timer = setTimeout(() => {
            setShowPromoModal(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, [apiKey]);

    useEffect(() => {
        if (!searchParams.get("location")) {
            router.replace("?location=Cambodia");
        }
    }, [searchParams, router]);

    const handleSearch = () => {
        const sanitized = inputValue
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .replace(/\s+/g, " ");
        if (!sanitized) {
            return;
        }
        setLocation(sanitized);
        setPage(1);
        router.push(`?location=${encodeURIComponent(sanitized)}`);
    };

    const handleUserSearchKeyDown = async (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Enter" && userSearchQuery.trim()) {
            setIsSearchingUser(true);
            try {
                const user = await getUserByName(
                    userSearchQuery.trim(),
                    apiKey,
                );
                if (user) {
                    setModalUser(user);
                    setIsModalOpen(true);
                    setUserSearchQuery("");
                } else {
                    alert("User not found!");
                }
            } catch (err) {
                console.error(err);
                alert("Error searching for user.");
            } finally {
                setIsSearchingUser(false);
            }
        }
    };

    const handleSaveApiKey = () => {
        saveApiKey();
        setShowKeyInput(false);
        setPage(1);
    };

    const handleClosePromo = (hideForToday: boolean) => {
        setShowPromoModal(false);
        if (hideForToday) {
            const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem(
                "gitranked_promo_hide_until",
                tomorrow.toString(),
            );
        }
    };

    const handleSavePromoKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem("gitranked_api_key", key);
        setShowPromoModal(false);
    };

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((sort: SortOption) => {
        setSortBy(sort);
        setPage(1);
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

    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white pb-20">
            <RateLimitBanner
                rateLimitHit={rateLimitHit}
                resetAt={rateLimitResetAt}
                onAddKey={() => setShowKeyInput(true)}
                onRefresh={handleRefresh}
            />

            <PageNavigation
                userSearchQuery={userSearchQuery}
                onUserSearchChange={setUserSearchQuery}
                isSearchingUser={isSearchingUser}
                onUserSearchKeyDown={handleUserSearchKeyDown}
                showKeyInput={showKeyInput}
                onToggleKeyInput={() => setShowKeyInput(!showKeyInput)}
                showToken={showToken}
                apiKey={apiKey}
                onToggleShowToken={() => setShowToken(!showToken)}
                onApiKeyChange={setApiKey}
                onSaveApiKey={handleSaveApiKey}
                hasApiKey={!!apiKey}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
                    <div className="w-full md:max-w-lg">
                        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-apple-text mb-3">
                            Cambodia&apos;s GitHub Leaderboard
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Find the most cracked devs in your local dev
                            community.
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
                        error={error}
                        page={page}
                        loadingProgress={loadingProgress}
                        onUserClick={async (user) => {
                            setModalUser(user);
                            setIsModalOpen(true);
                            setIsLoadingUserDetail(true);
                            try {
                                const fullUser = await getUserByName(
                                    user.login,
                                    apiKey,
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

                    {users.length > 0 && (
                        <PaginationControls
                            page={page}
                            hasNextPage={hasNextPage}
                            loading={loading}
                            onPageChange={setPage}
                        />
                    )}
                </div>
            </main>

            <UserModal
                user={modalUser}
                isOpen={isModalOpen}
                isLoading={isLoadingUserDetail}
                onClose={() => setIsModalOpen(false)}
            />

            <TokenPromoModal
                isOpen={showPromoModal}
                onClose={handleClosePromo}
                onSave={handleSavePromoKey}
            />

            <PageFooter
                userSearchQuery={userSearchQuery}
                onUserSearchChange={setUserSearchQuery}
                isSearchingUser={isSearchingUser}
                onUserSearchKeyDown={handleUserSearchKeyDown}
            />
        </div>
    );
}

export default GitRankedClient;
