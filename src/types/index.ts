export interface GitHubUserSummary {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    score: number;
}

export interface GitHubEventPayload {
    size?: number;
}

export interface GitHubEvent {
    type: string;
    payload?: GitHubEventPayload;
}

export interface GraphQLRepositoryNode {
    stargazerCount?: number;
}

export interface GitHubRepository {
    stargazers_count?: number;
}

export type HugeIcon = readonly (readonly [
    string,
    { readonly [key: string]: string | number },
])[];

export interface GitHubUserDetail {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    bio: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    recent_activity_count?: number;
    total_stars?: number;
}

export interface SearchResponse {
    total_count: number;
    incomplete_results: boolean;
    items: GitHubUserSummary[];
}

export enum SortOption {
    FOLLOWERS = "followers",
    REPOS = "repositories",
    JOINED = "joined",
    CONTRIBUTIONS = "contributions",
}

export interface AppState {
    users: GitHubUserDetail[];
    loading: boolean;
    error: string | null;
    location: string;
    page: number;
    hasMore: boolean;
    sortBy: SortOption;
    apiKey: string;
}
