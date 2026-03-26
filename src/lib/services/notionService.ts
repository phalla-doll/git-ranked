import type { GitHubUserDetail } from "@/types";

const NOTION_API_URL = "https://api.notion.com/v1";

interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
}

const circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;

function checkCircuitBreaker(): void {
    if (circuitBreaker.isOpen) {
        const timeSinceLastFailure =
            Date.now() - circuitBreaker.lastFailureTime;
        if (timeSinceLastFailure > CIRCUIT_BREAKER_TIMEOUT) {
            circuitBreaker.isOpen = false;
            circuitBreaker.failureCount = 0;
            console.log("Circuit breaker closed");
        } else {
            throw new Error(
                "Notion API is temporarily unavailable (circuit breaker open)",
            );
        }
    }
}

function recordFailure(): void {
    circuitBreaker.failureCount++;
    circuitBreaker.lastFailureTime = Date.now();

    if (circuitBreaker.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitBreaker.isOpen = true;
        console.error("Circuit breaker opened after multiple failures");
    }
}

function recordSuccess(): void {
    circuitBreaker.failureCount = 0;
}

function validateNotionConfig(): void {
    const token = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!token) {
        throw new Error("NOTION_TOKEN environment variable is not set");
    }
    if (!databaseId) {
        throw new Error("NOTION_DATABASE_ID environment variable is not set");
    }
    if (token.length < 20) {
        throw new Error("NOTION_TOKEN appears to be invalid (too short)");
    }
    if (!databaseId.match(/^[a-f0-9]{32}$/)) {
        throw new Error("NOTION_DATABASE_ID format is invalid");
    }
}

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
    delayMs = 1000,
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (response.status >= 400 && response.status < 500) {
                return response;
            }

            if (response.ok) {
                recordSuccess();
                return response;
            }

            if (attempt === maxRetries) {
                return response;
            }

            console.log(
                `Retrying Notion API request (attempt ${attempt}/${maxRetries})...`,
            );
            await new Promise((resolve) =>
                setTimeout(resolve, delayMs * attempt),
            );
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt === maxRetries) {
                throw lastError;
            }

            await new Promise((resolve) =>
                setTimeout(resolve, delayMs * 2 ** (attempt - 1)),
            );
        }
    }

    throw lastError || new Error("Max retries exceeded");
}

function mapNotionToGitHubUser(page: any): GitHubUserDetail | null {
    try {
        const properties = page.properties || {};

        const nameProp = properties.Name;
        const login = nameProp?.title?.[0]?.plain_text || "";

        if (!login) {
            return null;
        }

        const id = properties["User ID"]?.rich_text?.[0]?.plain_text || "";
        const avatarUrl = properties["Avatar URL"]?.url || "";
        const htmlUrl = properties["GitHub URL"]?.url || "";
        const displayName = properties.name?.rich_text?.[0]?.plain_text || null;
        const company = properties.Company?.rich_text?.[0]?.plain_text || null;
        const location =
            properties.Location?.rich_text?.[0]?.plain_text || null;
        const email = properties.email?.email || null;
        const bio = properties.Bio?.rich_text?.[0]?.plain_text || null;

        const publicRepos = properties.Repositories?.number || 0;
        const publicGists = 0;
        const followers = properties.Followers?.number || 0;
        const following = properties.Following?.number || 0;
        const totalStars = properties.total_stars?.number || 0;
        const recentActivityCount =
            properties.recent_activity_count?.number || 0;

        const createdAt = properties.Joined?.date?.start || "";

        return {
            login,
            id: id || `user_${login}`,
            avatar_url:
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${login}&background=random`,
            html_url: htmlUrl || `https://github.com/${login}`,
            name: displayName || login,
            company,
            blog: null,
            location,
            email,
            bio,
            public_repos: publicRepos,
            public_gists: publicGists,
            followers,
            following,
            created_at: createdAt,
            recent_activity_count: recentActivityCount,
            total_stars: totalStars,
        };
    } catch (error) {
        console.error("Error mapping Notion page to user:", error);
        return null;
    }
}

let cachedDataSourceId: string | null = null;

async function getDataSourceId(databaseId: string): Promise<string> {
    if (cachedDataSourceId) {
        return cachedDataSourceId;
    }

    const token = process.env.NOTION_TOKEN;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Notion-Version": "2025-09-03",
        },
        signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to fetch database: ${response.status} - ${errorText}`,
        );
    }

    const data = await response.json();
    const dataSources = data.data_sources || [];

    if (dataSources.length === 0) {
        throw new Error("No data sources found for database");
    }

    const dataSourceId = dataSources[0].id;
    cachedDataSourceId = dataSourceId;
    console.log(
        `Using data source: ${dataSourceId} (${dataSources[0].name || "unnamed"})`,
    );
    return dataSourceId;
}

async function queryNotionDatabase(
    databaseId: string,
    body?: any,
): Promise<any> {
    checkCircuitBreaker();
    validateNotionConfig();

    const token = process.env.NOTION_TOKEN;
    const dataSourceId = await getDataSourceId(databaseId);

    const requestBody: any = {
        page_size: 100,
        ...body,
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetchWithRetry(
            `${NOTION_API_URL}/data_sources/${dataSourceId}/query`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Notion-Version": "2025-09-03",
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Notion API error:", errorText);
            throw new Error(
                `Notion API error: ${response.status} - ${errorText}`,
            );
        }

        return await response.json();
    } catch (error) {
        recordFailure();
        console.error("Notion API fetch error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            cause: error instanceof Error ? (error as any).cause : null,
            stack: error instanceof Error ? error.stack : undefined,
            databaseId,
            timestamp: new Date().toISOString(),
        });

        if (error instanceof Error) {
            if (error.name === "AbortError") {
                throw new Error(
                    "Notion API request timed out after 30 seconds",
                );
            }
            if ((error as any).cause?.code === "ECONNRESET") {
                throw new Error(
                    "Notion API connection was reset. This may be due to rate limiting or network issues. Please try again.",
                );
            }
            throw new Error(`Notion API request failed: ${error.message}`);
        }
        throw new Error("Unknown error occurred while fetching from Notion");
    }
}

export async function getUsers(): Promise<{
    users: GitHubUserDetail[];
    total_count: number;
    error?: string;
}> {
    try {
        const databaseId = process.env.NOTION_DATABASE_ID;

        if (!databaseId) {
            throw new Error("NOTION_DATABASE_ID is not configured");
        }

        const allUsers: GitHubUserDetail[] = [];
        let hasMore = true;
        let nextCursor: string | undefined;

        while (hasMore) {
            const body: any = nextCursor ? { start_cursor: nextCursor } : {};

            const response = await queryNotionDatabase(databaseId, body);

            const pages = response.results || [];
            const users = pages
                .map(mapNotionToGitHubUser)
                .filter(
                    (user: GitHubUserDetail | null): user is GitHubUserDetail =>
                        user !== null,
                );

            allUsers.push(...users);

            hasMore = response.has_more;
            nextCursor = response.next_cursor || undefined;
        }

        return {
            users: allUsers,
            total_count: allUsers.length,
        };
    } catch (error) {
        console.error("Error fetching users from Notion:", error);
        return {
            users: [],
            total_count: 0,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch data from Notion",
        };
    }
}

export async function getUserByLogin(
    username: string,
): Promise<GitHubUserDetail | null> {
    try {
        const databaseId = process.env.NOTION_DATABASE_ID;

        if (!databaseId) {
            throw new Error("NOTION_DATABASE_ID is not configured");
        }

        const response = await queryNotionDatabase(databaseId, {
            filter: {
                property: "login",
                title: {
                    equals: username,
                },
            },
        });

        const pages = response.results || [];

        if (pages.length === 0) {
            return null;
        }

        const user = mapNotionToGitHubUser(pages[0]);
        return user;
    } catch (error) {
        console.error(`Error fetching user ${username} from Notion:`, error);
        return null;
    }
}
