"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { InfoBanner } from "@/components/InfoBanner";
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
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions";
import { useUsers } from "@/hooks/useUsers";
import { getUserByName } from "@/lib/services/githubService";
import type { GitHubUserDetail } from "@/types";
import { SortOption } from "@/types";

function GitRankedClient() {
    const [location, setLocation] = useState("Cambodia");
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
    const [page, setPage] = useState(1);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [isPending, _startTransition] = useTransition();
    const inputWrapperRef = useRef<HTMLDivElement>(null);

    const { apiKey, setApiKey, saveApiKey } = useApiKey();
    const { users, loading, error, totalCount, rateLimitHit } = useUsers(
        location,
        sortBy,
        page,
        apiKey,
    );
    const {
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleLocationChange,
    } = useLocationSuggestions();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputWrapperRef.current &&
                !inputWrapperRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShowSuggestions]);

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

    const handleSearch = () => {
        setPage(1);
    };

    const handleLocationChangeWrapper = useCallback(
        (value: string) => {
            setLocation(value);
            handleLocationChange(value);
        },
        [handleLocationChange],
    );

    const handleSelectSuggestion = (suggestion: string) => {
        setLocation(suggestion);
        setShowSuggestions(false);
        setPage(1);
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

    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white pb-20">
            <RateLimitBanner
                rateLimitHit={rateLimitHit}
                onAddKey={() => setShowKeyInput(true)}
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
                            Find top creators in your local dev community.
                        </p>
                        <div className="relative group" ref={inputWrapperRef}>
                            <LocationSearch
                                location={location}
                                suggestions={suggestions}
                                showSuggestions={showSuggestions}
                                onLocationChange={handleLocationChangeWrapper}
                                onSearch={handleSearch}
                                onLocationFocus={() => {
                                    if (
                                        location.trim().length > 0 &&
                                        suggestions.length > 0
                                    )
                                        setShowSuggestions(true);
                                }}
                                onSelectSuggestion={handleSelectSuggestion}
                            />
                        </div>
                    </div>
                </div>

                <StatsGrid totalCount={totalCount} users={users} />

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-4">
                        <h2 className="text-lg font-medium text-apple-text">
                            {getListTitle()}
                        </h2>

                        <SortOptions sortBy={sortBy} onSortChange={setSortBy} />
                    </div>

                    <LeaderboardTable
                        users={users}
                        sortBy={sortBy}
                        loading={isPending || loading}
                        error={error}
                        page={page}
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

                    {users.length > 0 && (
                        <PaginationControls
                            page={page}
                            usersCount={users.length}
                            loading={loading}
                            onPageChange={setPage}
                        />
                    )}

                    <InfoBanner />
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

            <PageFooter />
        </div>
    );
}

export default GitRankedClient;
