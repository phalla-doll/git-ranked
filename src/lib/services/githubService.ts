import { LRUCache } from "lru-cache";
import { cache } from "react";
import type {
    GitHubEvent,
    GitHubRepository,
    GitHubUserDetail,
    GraphQLRepositoryNode,
    SearchResponse,
} from "@/types";
import { SortOption } from "@/types";

const BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";

const BASE_MOCK_USERS: GitHubUserDetail[] = [
    {
        login: "tharith-p",
        id: 101,
        avatar_url: "https://picsum.photos/200/200?random=1",
        html_url: "https://github.com/tharith-p",
        name: "Tharith Pangs",
        company: "GitRanked KH",
        blog: "https://gitranked.kh",
        location: "Phnom Penh, Cambodia",
        email: null,
        bio: "Full stack developer passionate about React and Node.js.",
        public_repos: 45,
        public_gists: 12,
        followers: 1205,
        following: 110,
        created_at: "2018-01-15T10:20:30Z",
        recent_activity_count: 890,
        total_stars: 450,
    },
    {
        login: "sopheak-dev",
        id: 102,
        avatar_url: "https://picsum.photos/200/200?random=2",
        html_url: "https://github.com/sopheak-dev",
        name: "Sopheak",
        company: "KhmerCode",
        blog: "",
        location: "Siem Reap, Cambodia",
        email: null,
        bio: "Open source contributor. Rust enthusiast.",
        public_repos: 82,
        public_gists: 5,
        followers: 890,
        following: 45,
        created_at: "2019-05-10T08:00:00Z",
        recent_activity_count: 2400,
        total_stars: 120,
    },
    {
        login: "vireak-codes",
        id: 103,
        avatar_url: "https://picsum.photos/200/200?random=3",
        html_url: "https://github.com/vireak-codes",
        name: "Vireak Roth",
        company: "StartUp Inc",
        blog: "",
        location: "Cambodia",
        email: null,
        bio: "Building the future of tech in SEA.",
        public_repos: 24,
        public_gists: 2,
        followers: 650,
        following: 300,
        created_at: "2020-03-22T14:15:00Z",
        recent_activity_count: 420,
        total_stars: 85,
    },
    {
        login: "dara-js",
        id: 104,
        avatar_url: "https://picsum.photos/200/200?random=4",
        html_url: "https://github.com/dara-js",
        name: "Dara Ly",
        company: null,
        blog: "",
        location: "Battambang, Cambodia",
        email: null,
        bio: "JavaScript all the way.",
        public_repos: 112,
        public_gists: 20,
        followers: 430,
        following: 12,
        created_at: "2016-11-02T09:30:00Z",
        recent_activity_count: 1500,
        total_stars: 310,
    },
    {
        login: "bopha-design",
        id: 105,
        avatar_url: "https://picsum.photos/200/200?random=5",
        html_url: "https://github.com/bopha-design",
        name: "Bopha Chan",
        company: "Creative Studio",
        blog: "https://bopha.design",
        location: "Phnom Penh",
        email: null,
        bio: "Frontend Engineer & UI Designer.",
        public_repos: 18,
        public_gists: 1,
        followers: 340,
        following: 80,
        created_at: "2021-01-05T11:00:00Z",
        recent_activity_count: 350,
        total_stars: 65,
    },
];

const generateMockUsers = (count: number): GitHubUserDetail[] => {
    const users = [...BASE_MOCK_USERS];
    const companies = [
        "Freelance",
        "TechKhmer",
        "StartupKH",
        "AngkorDev",
        "MekongSoft",
        "Smart Axiata",
        null,
    ];
    const locations = [
        "Phnom Penh",
        "Siem Reap",
        "Battambang",
        "Kampot",
        "Sihanoukville",
        "Cambodia",
    ];
    const firstNames = [
        "Chan",
        "Sok",
        "Dara",
        "Vireak",
        "Srey",
        "Piseth",
        "Rithy",
        "Nary",
        "Bona",
        "Sophea",
    ];
    const lastNames = [
        "Heng",
        "Lim",
        "Ng",
        "Chea",
        "Ly",
        "Keo",
        "Ouk",
        "Seng",
        "Mao",
        "Sok",
    ];

    for (let i = users.length; i < count; i++) {
        const template = users[i % users.length];
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const randomLogin =
            randomName.toLowerCase().replace(" ", "_") +
            Math.floor(Math.random() * 1000);

        users.push({
            ...template,
            id: 2000 + i,
            login: randomLogin,
            name: randomName,
            followers: Math.floor(
                template.followers * (0.1 + Math.random() * 0.8),
            ),
            public_repos: Math.floor(
                template.public_repos * (0.2 + Math.random() * 1.5),
            ),
            recent_activity_count: Math.floor(
                (template.recent_activity_count || 0) *
                    (0.2 + Math.random() * 2.5),
            ),
            total_stars: Math.floor(Math.random() * 500),
            company: companies[Math.floor(Math.random() * companies.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            avatar_url: `https://picsum.photos/200/200?random=${i + 10}`,
            created_at: new Date(
                Date.now() - Math.floor(Math.random() * 100000000000),
            ).toISOString(),
        });
    }

    return users.sort((a, b) => b.followers - a.followers);
};

const MOCK_USERS_CAMBODIA = generateMockUsers(500);

const searchCache = new LRUCache<
    string,
    {
        users: GitHubUserDetail[];
        total_count: number;
        rateLimited: boolean;
        error?: string;
    }
>({
    max: 100,
    ttl: 5 * 60 * 1000,
});

const calculateCommitsFromEvents = (events: GitHubEvent[]): number => {
    if (!Array.isArray(events)) return 0;
    return events.reduce((acc: number, event: GitHubEvent) => {
        if (
            event &&
            typeof event === "object" &&
            event.type === "PushEvent" &&
            event.payload &&
            typeof event.payload === "object" &&
            "size" in event.payload
        ) {
            return acc + (Number(event.payload.size) || 0);
        }
        return acc;
    }, 0);
};

const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
};

const fetchGraphQLUserDetails = async (
    usernames: string[],
    token: string,
): Promise<Record<string, GitHubUserDetail>> => {
    const chunks = chunkArray(usernames, 10);
    const allUsers: Record<string, GitHubUserDetail> = {};

    for (const chunk of chunks) {
        const queries = chunk
            .map((username, index) => {
                const safeKey = `user_${index}`;
                return `
        ${safeKey}: user(login: "${username}") {
          login
          databaseId
          avatarUrl
          url
          name
          company
          websiteUrl
          location
          email
          bio
          createdAt
          followers { totalCount }
          following { totalCount }
          gists(privacy: PUBLIC) { totalCount }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
          repositories(first: 30, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
            totalCount
            nodes {
              stargazerCount
            }
          }
        }
      `;
            })
            .join("\n");

        const query = `query { ${queries} }`;

        try {
            const response = await fetch(GRAPHQL_URL, {
                method: "POST",
                headers: {
                    Authorization: `bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });

            const result = await response.json();

            if (result.data) {
                chunk.forEach((username, index) => {
                    const safeKey = `user_${index}`;
                    const data = result.data[safeKey];
                    if (data) {
                        const totalStars =
                            data.repositories?.nodes?.reduce(
                                (acc: number, repo: GraphQLRepositoryNode) =>
                                    acc + (repo.stargazerCount || 0),
                                0,
                            ) || 0;

                        allUsers[username.toLowerCase()] = {
                            login: data.login,
                            id: data.databaseId,
                            avatar_url: data.avatarUrl,
                            html_url: data.url,
                            name: data.name,
                            company: data.company,
                            blog: data.websiteUrl,
                            location: data.location,
                            email: data.email,
                            bio: data.bio,
                            public_repos: data.repositories?.totalCount || 0,
                            public_gists: data.gists?.totalCount || 0,
                            followers: data.followers?.totalCount || 0,
                            following: data.following?.totalCount || 0,
                            created_at: data.createdAt,
                            recent_activity_count:
                                data.contributionsCollection
                                    ?.contributionCalendar
                                    ?.totalContributions || 0,
                            total_stars: totalStars,
                        };
                    }
                });
            } else if (result.errors) {
                console.warn("GraphQL errors:", result.errors);
            }
        } catch (e) {
            console.warn("GraphQL chunk fetch failed", e);
        }
    }

    return allUsers;
};

export const getUserByName = cache(
    async (
        username: string,
        apiKey?: string,
    ): Promise<GitHubUserDetail | null> => {
        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (apiKey) {
            headers.Authorization = `token ${apiKey}`;

            try {
                const map = await fetchGraphQLUserDetails([username], apiKey);
                if (map[username.toLowerCase()]) {
                    return map[username.toLowerCase()];
                }
            } catch (_e) {
                console.warn(
                    "GraphQL single fetch failed, falling back to REST",
                );
            }
        }

        try {
            const response = await fetch(`${BASE_URL}/users/${username}`, {
                headers,
            });
            if (!response.ok) return null;
            const user = (await response.json()) as GitHubUserDetail;

            try {
                const eventsRes = await fetch(
                    `${BASE_URL}/users/${username}/events?per_page=100`,
                    { headers },
                );
                if (eventsRes.ok) {
                    const events = await eventsRes.json();
                    user.recent_activity_count =
                        calculateCommitsFromEvents(events);
                }
            } catch (_e) {
                user.recent_activity_count = 0;
            }

            try {
                const reposRes = await fetch(
                    `${BASE_URL}/users/${username}/repos?per_page=100&type=owner&sort=pushed`,
                    { headers },
                );
                if (reposRes.ok) {
                    const repos = await reposRes.json();
                    if (Array.isArray(repos)) {
                        user.total_stars = repos.reduce(
                            (acc: number, repo: GitHubRepository) =>
                                acc + (repo.stargazers_count || 0),
                            0,
                        );
                    }
                }
            } catch (_e) {
                // Ignore star fetch errors
            }

            return user;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    },
);

export const searchUsersInLocation = cache(
    async (
        query: string,
        sort: SortOption,
        page: number = 1,
        apiKey?: string,
    ): Promise<{
        users: GitHubUserDetail[];
        total_count: number;
        rateLimited: boolean;
        error?: string;
    }> => {
        const cacheKey = `${query}:${sort}:${page}:${apiKey ? "with-key" : "no-key"}`;
        const cached = searchCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
        };

        if (apiKey) {
            headers.Authorization = `token ${apiKey}`;
        }

        try {
            const q = `location:"${query}"`;
            const fetchSize = 50;
            const searchUrl = `${BASE_URL}/search/users?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=${fetchSize}&page=${page}`;

            const searchRes = await fetch(searchUrl, { headers });

            if (!searchRes.ok) {
                if (searchRes.status === 403 || searchRes.status === 429) {
                    console.warn("Rate limited. Returning mock data.");
                    await new Promise((resolve) => setTimeout(resolve, 800));

                    const mockUsers = [...MOCK_USERS_CAMBODIA];
                    if (sort === SortOption.FOLLOWERS) {
                        mockUsers.sort((a, b) => b.followers - a.followers);
                    } else if (sort === SortOption.REPOS) {
                        mockUsers.sort(
                            (a, b) => b.public_repos - a.public_repos,
                        );
                    }

                    const start = (page - 1) * 50;
                    const paginatedMock = mockUsers.slice(start, start + 50);
                    const result = {
                        users: paginatedMock,
                        total_count: mockUsers.length,
                        rateLimited: true,
                    };
                    searchCache.set(cacheKey, result);
                    return result;
                }
                return {
                    users: [],
                    total_count: 0,
                    rateLimited: false,
                    error: `API Error (${searchRes.status}): ${searchRes.statusText}`,
                };
            }

            const searchData = (await searchRes.json()) as SearchResponse;
            const usernames = searchData.items.map((i) => i.login);

            let detailedUsers: GitHubUserDetail[] = [];

            if (apiKey && usernames.length > 0) {
                try {
                    const usersMap = await fetchGraphQLUserDetails(
                        usernames,
                        apiKey,
                    );

                    detailedUsers = usernames
                        .map((login) => usersMap[login.toLowerCase()] || null)
                        .filter((u): u is GitHubUserDetail => u !== null);
                } catch (e) {
                    console.error("GraphQL hydration failed", e);
                }
            }

            if (detailedUsers.length === 0) {
                const detailPromises = searchData.items.map(async (item) => {
                    try {
                        const detailRes = await fetch(
                            `${BASE_URL}/users/${item.login}`,
                            { headers },
                        );
                        if (!detailRes.ok) return null;
                        return (await detailRes.json()) as GitHubUserDetail;
                    } catch (_e) {
                        return null;
                    }
                });
                detailedUsers = (await Promise.all(detailPromises)).filter(
                    (u): u is GitHubUserDetail => u !== null,
                );
            }

            if (detailedUsers.length === 0 && searchData.items.length > 0) {
                const result = {
                    users: MOCK_USERS_CAMBODIA.slice(0, 100),
                    total_count: 500,
                    rateLimited: true,
                };
                searchCache.set(cacheKey, result);
                return result;
            }

            if (sort === SortOption.FOLLOWERS) {
                detailedUsers.sort((a, b) => b.followers - a.followers);
            } else if (sort === SortOption.REPOS) {
                detailedUsers.sort((a, b) => b.public_repos - a.public_repos);
            } else if (sort === SortOption.JOINED) {
                detailedUsers.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                );
            }

            const result = {
                users: detailedUsers,
                total_count: searchData.total_count,
                rateLimited: false,
            };
            searchCache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error("Failed to fetch GitHub data", error);
            return {
                users: [],
                total_count: 0,
                rateLimited: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Connection failed.",
            };
        }
    },
);
