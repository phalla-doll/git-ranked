import { sendGAEvent } from "@next/third-parties/google";

export function trackEvent(
    eventName: string,
    params: Record<string, unknown> = {},
) {
    if (typeof window !== "undefined") {
        sendGAEvent("event", eventName, params);
    }
}

export const analytics = {
    locationSearch: (location: string, resultsCount: number) => {
        trackEvent("location_search", {
            location,
            results_count: resultsCount,
        });
    },

    userSearch: (username: string, found: boolean) => {
        trackEvent("user_search", { username, found });
    },

    userNotFound: (username: string) => {
        trackEvent("user_not_found", { searched_username: username });
    },

    sortChange: (sortBy: string) => {
        trackEvent("sort_change", { sort_by: sortBy });
    },

    paginationClick: (page: number, direction: "prev" | "next") => {
        trackEvent("pagination_click", { page, direction });
    },

    apiKeyToggle: (action: "open" | "close") => {
        trackEvent("api_key_toggle", { action });
    },

    apiKeySave: (hasKey: boolean) => {
        trackEvent("api_key_save", { has_key: hasKey });
    },

    rateLimitAddKey: () => {
        trackEvent("rate_limit_add_key");
    },

    userRowClick: (username: string, rank: number) => {
        trackEvent("user_row_click", { username, rank });
    },

    githubProfileClick: (username: string, source: "table" | "modal") => {
        trackEvent("github_profile_click", { username, source });
    },

    userBlogClick: (username: string) => {
        trackEvent("user_blog_click", { username });
    },

    externalLinkClick: (linkType: "mantha" | "github_tokens") => {
        trackEvent("external_link_click", { link_type: linkType });
    },

    userModalOpen: (username: string) => {
        trackEvent("user_modal_open", { username });
    },

    userModalClose: (username: string, viewDurationMs: number) => {
        trackEvent("user_modal_close", {
            username,
            view_duration_ms: viewDurationMs,
        });
    },

    promoModalOpen: () => {
        trackEvent("promo_modal_open");
    },

    promoModalDismiss: (hideForToday: boolean) => {
        trackEvent("promo_modal_dismiss", { hide_for_today: hideForToday });
    },

    promoModalSave: () => {
        trackEvent("promo_modal_save");
    },

    apiError: (errorMessage: string) => {
        trackEvent("api_error", { error_message: errorMessage });
    },

    rateLimitHit: () => {
        trackEvent("rate_limit_hit");
    },
};
