"use client";

import {
    AlertCircleIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowUpRight01Icon,
    CommandLineIcon,
    EyeIcon,
    KeyIcon,
    Loading01Icon,
    Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { StatCard } from "@/components/StatCard";
import { TokenPromoModal } from "@/components/TokenPromoModalWrapper";
import { UserModal } from "@/components/UserModal";
import { POPULAR_LOCATIONS } from "@/data/locations";
import {
    getUserByName,
    searchUsersInLocation,
} from "@/lib/services/githubService";
import { type GitHubUserDetail, SortOption } from "@/types";

function GitRankedClient() {
    const [location, setLocation] = useState("Cambodia");
    const [mounted, setMounted] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [users, setUsers] = useState<GitHubUserDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
    const [totalCount, setTotalCount] = useState(0);
    const [rateLimitHit, setRateLimitHit] = useState(false);
    const [page, setPage] = useState(1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const inputWrapperRef = useRef<HTMLFormElement>(null);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && typeof window !== "undefined") {
            const savedKey = localStorage.getItem("gitranked_api_key");
            if (savedKey) {
                setApiKey(savedKey);
            }
        }
    }, [mounted]);

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
    }, []);

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

    const fetchUsers = useCallback(
        async (loc: string = location, p: number = 1) => {
            setLoading(true);
            setUsers([]);
            setError(null);
            setRateLimitHit(false);
            setShowSuggestions(false);
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
        [location, sortBy, apiKey],
    );

    useEffect(() => {
        fetchUsers(location, page);
    }, [fetchUsers, location, page]);

    useEffect(() => {
        setPage(1);
        startTransition(() => {
            fetchUsers(location, 1);
        });
    }, [fetchUsers, location]);

    useEffect(() => {
        if (page > 1) {
            startTransition(() => {
                fetchUsers(location, page);
            });
        }
    }, [fetchUsers, location, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        startTransition(() => {
            fetchUsers(location, 1);
        });
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocation(value);

        if (value.trim().length > 0) {
            const filtered = POPULAR_LOCATIONS.filter(
                (loc) =>
                    loc.toLowerCase().includes(value.toLowerCase()) &&
                    loc.toLowerCase() !== value.toLowerCase(),
            ).slice(0, 6);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setLocation(suggestion);
        setShowSuggestions(false);
        setPage(1);
        startTransition(() => {
            fetchUsers(suggestion, 1);
        });
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
        if (apiKey.trim()) {
            localStorage.setItem("gitranked_api_key", apiKey.trim());
        } else {
            localStorage.removeItem("gitranked_api_key");
        }
        setShowKeyInput(false);
        setPage(1);
        startTransition(() => {
            fetchUsers(location, 1);
        });
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

    const getTotalLabel = () => {
        return "Total Developers";
    };

    const maxFollowers =
        users.length > 0 ? Math.max(...users.map((u) => u.followers)) : 0;
    const totalRepos = users.reduce((acc, user) => acc + user.public_repos, 0);

    return (
        <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white pb-20">
            {rateLimitHit && (
                <div className="bg-orange-50 border-b border-orange-100 relative z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon
                                icon={AlertCircleIcon}
                                size={16}
                                color="#F97316"
                                strokeWidth={1.5}
                            />
                            <span className="text-xs font-medium text-orange-800">
                                Rate limit reached. Showing cached data.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowKeyInput(true)}
                            className="text-[10px] font-medium text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
                        >
                            Add Key
                        </button>
                    </div>
                </div>
            )}

            <nav className="glass-panel sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                                <HugeiconsIcon
                                    icon={CommandLineIcon}
                                    size={20}
                                    color="white"
                                    strokeWidth={1.5}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-lg text-apple-text leading-none tracking-tight">
                                    GitRanked
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-apple-blue/20 transition-all w-64">
                                <HugeiconsIcon
                                    icon={Search01Icon}
                                    size={16}
                                    color="currentColor"
                                    className="text-gray-400"
                                    strokeWidth={1.5}
                                />
                                <input
                                    type="text"
                                    placeholder="Find user..."
                                    className="bg-transparent border-none focus:outline-none text-sm w-full text-apple-text placeholder-gray-400 font-medium"
                                    value={userSearchQuery}
                                    onChange={(e) =>
                                        setUserSearchQuery(e.target.value)
                                    }
                                    onKeyDown={handleUserSearchKeyDown}
                                    disabled={isSearchingUser}
                                />
                                {isSearchingUser && (
                                    <HugeiconsIcon
                                        icon={Loading01Icon}
                                        size={14}
                                        color="#2563EB"
                                        className="animate-spin"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowKeyInput(!showKeyInput)}
                                className={`p-2 rounded-full transition-all ${mounted && apiKey ? "text-apple-blue bg-blue-50" : "text-gray-500 hover:bg-gray-100"}`}
                                title="API Settings"
                            >
                                <HugeiconsIcon
                                    icon={KeyIcon}
                                    size={20}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                />
                            </button>
                        </div>
                    </div>

                    {showKeyInput && (
                        <div className="absolute top-full left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2">
                            <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
                                <div className="text-sm text-apple-text">
                                    <p className="font-medium mb-1">
                                        GitHub Access Token
                                    </p>
                                    <p className="text-gray-500 flex items-center flex-wrap gap-1">
                                        Add a token to increase API rate limits.{" "}
                                        <a
                                            href="https://github.com/settings/tokens"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-apple-blue hover:underline inline-flex items-center gap-1 font-medium"
                                        >
                                            Generate one here{" "}
                                            <HugeiconsIcon
                                                icon={ArrowUpRight01Icon}
                                                size={12}
                                                color="currentColor"
                                                strokeWidth={1.5}
                                            />
                                        </a>
                                    </p>
                                </div>
                                <div className="flex w-full md:w-auto gap-2 items-center">
                                    <div className="relative w-full md:w-80">
                                        <input
                                            type={
                                                showToken ? "text" : "password"
                                            }
                                            placeholder="ghp_..."
                                            value={apiKey}
                                            onChange={(e) =>
                                                setApiKey(e.target.value)
                                            }
                                            className="bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm w-full focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowToken(!showToken)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <HugeiconsIcon
                                                icon={EyeIcon}
                                                size={14}
                                                color="currentColor"
                                                strokeWidth={
                                                    showToken ? 3 : 1.5
                                                }
                                            />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSaveApiKey}
                                        className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
                    <div className="w-full md:max-w-lg">
                        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-apple-text mb-3">
                            Cambodia's GitHub Leaderboard
                        </h1>
                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            Find top creators in your local dev community.
                        </p>
                        <form
                            onSubmit={handleSearch}
                            className="relative group"
                            ref={inputWrapperRef}
                        >
                            <div className="relative shadow-soft rounded-2xl">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <HugeiconsIcon
                                        icon={Search01Icon}
                                        size={20}
                                        color="currentColor"
                                        className="text-gray-400"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-0 ring-1 ring-gray-200 text-apple-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-all font-medium text-lg"
                                    placeholder="Search by location (e.g. Phnom Penh)..."
                                    value={location}
                                    onChange={handleLocationChange}
                                    onFocus={() => {
                                        if (
                                            location.trim().length > 0 &&
                                            suggestions.length > 0
                                        )
                                            setShowSuggestions(true);
                                    }}
                                    autoComplete="off"
                                />
                                <div className="absolute inset-y-2 right-2">
                                    <button
                                        type="submit"
                                        className="h-full px-6 bg-apple-blue hover:bg-apple-blueHover text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        Search
                                    </button>
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul
                                        ref={suggestionsRef}
                                        className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-hover border border-gray-100 z-50 max-h-60 overflow-y-auto py-2"
                                    >
                                        {suggestions.map((suggestion) => (
                                            <li key={suggestion}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectSuggestion(
                                                            suggestion,
                                                        )
                                                    }
                                                    className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 shadow-sm overflow-hidden">
                    <div className="p-8">
                        <StatCard
                            label={getTotalLabel()}
                            value={
                                totalCount ? totalCount.toLocaleString() : "-"
                            }
                        />
                    </div>
                    <div className="p-8">
                        <StatCard
                            label="Top Influence"
                            value={
                                users.length > 0
                                    ? maxFollowers.toLocaleString()
                                    : "-"
                            }
                        />
                    </div>
                    <div className="p-8">
                        <StatCard
                            label="Total Repositories"
                            value={totalRepos.toLocaleString()}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-1 gap-4">
                        <h2 className="text-lg font-medium text-apple-text">
                            {getListTitle()}
                        </h2>

                        <div className="flex overflow-x-auto custom-scrollbar bg-gray-200/50 p-1 rounded-xl w-full sm:w-auto">
                            {[
                                {
                                    id: SortOption.FOLLOWERS,
                                    label: "Followers",
                                },
                                { id: SortOption.REPOS, label: "Repositories" },
                                { id: SortOption.JOINED, label: "Newest" },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSortBy(option.id)}
                                    className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ease-out whitespace-nowrap ${
                                        sortBy === option.id
                                            ? "bg-white text-apple-text shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <LeaderboardTable
                        users={users}
                        sortBy={sortBy}
                        loading={isPending || loading}
                        error={error}
                        page={page}
                        onUserClick={(user) => {
                            setModalUser(user);
                            setIsModalOpen(true);
                        }}
                    />

                    {users.length > 0 && (
                        <div className="flex justify-center items-center gap-6 mt-8">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1 || loading}
                                className="p-2 text-gray-400 hover:text-apple-text disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <HugeiconsIcon
                                    icon={ArrowLeft01Icon}
                                    size={24}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                />
                            </button>
                            <span className="text-sm font-medium text-gray-500 tabular-nums">
                                Page {page}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={users.length < 100 || loading}
                                className="p-2 text-gray-400 hover:text-apple-text disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={24}
                                    color="currentColor"
                                    strokeWidth={1.5}
                                />
                            </button>
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between border border-blue-100 mt-6">
                        <div>
                            <h4 className="font-medium text-apple-blue mb-1">
                                Don't see yourself listed?
                            </h4>
                            <p className="text-sm text-blue-800/70 max-w-sm">
                                Try searching for your exact username in the
                                search bar above to verify your stats.
                            </p>
                        </div>
                        <div className="hidden sm:block p-3 bg-white rounded-full text-apple-blue shadow-sm">
                            <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                size={20}
                                color="#2563EB"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <UserModal
                user={modalUser}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <TokenPromoModal
                isOpen={showPromoModal}
                onClose={handleClosePromo}
                onSave={handleSavePromoKey}
            />

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                            GitRanked Cambodia
                        </p>
                        <p className="text-xs text-gray-500">
                            Community leaderboard for local developers.
                        </p>
                    </div>
                    <div className="text-xs text-gray-500 flex flex-wrap justify-center items-center gap-1">
                        <span>Created as a hobby and maintained by</span>
                        <a
                            href="https://manthaa.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:underline transition-colors"
                        >
                            Mantha
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default GitRankedClient;
