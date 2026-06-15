const COMMITTERS_BASE = "https://committers.top";
const DEFAULT_REGION = "cambodia";
const COMMITTERS_CACHE_TTL_MS = 10 * 60 * 1000;

const COMMITTERS_USER_AGENT = "git-ranked/1.0 (+https://gitranked.manthaa.dev)";

export interface CommitterEntry {
    login: string;
    name: string | null;
    contributions: number | null;
    rank: number;
}

export interface CommitterList {
    users: CommitterEntry[];
    dataAsof: string | null;
}

interface RankOnlyJson {
    user_private?: string[];
    data_asof?: string;
}

interface CacheEntry {
    list: CommitterList;
    expires: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Normalises a free-text location (e.g. "Phnom Penh, Cambodia") into a
 * committers.top region slug ("cambodia"). committers.top regions are
 * lowercase, underscore-separated country/region names.
 */
export function toRegionSlug(location: string | null | undefined): string {
    const trimmed = (location ?? "").trim().toLowerCase();
    if (!trimmed) {
        return DEFAULT_REGION;
    }
    return trimmed.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTags(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function fetchText(url: string): Promise<string> {
    const response = await fetch(url, {
        headers: { "User-Agent": COMMITTERS_USER_AGENT },
        next: { revalidate: 600 },
    });
    if (!response.ok) {
        throw new Error(
            `committers.top fetch failed (${response.status}): ${url}`,
        );
    }
    return response.text();
}

function parseCountsAndNames(
    html: string,
    orderedLogins: string[],
): Map<string, { name: string | null; contributions: number | null }> {
    const result = new Map<
        string,
        { name: string | null; contributions: number | null }
    >();

    // Cut the document at the start of the Organizations table so a user login
    // can't accidentally match an organization row below it. Anchor on the
    // section's stable markup (`<h3 id="organizations">` / the org table class)
    // rather than the word "Organizations" — that word also appears earlier in
    // the page's badge instructions ("For organizations, ..."), which would
    // truncate the entire user list before any counts are parsed.
    const orgBoundary = html.search(
        /<h3[^>]*\bid=["']organizations["']|class=["'][^"']*organizations-list/i,
    );
    const section = orgBoundary >= 0 ? html.slice(0, orgBoundary) : html;
    const text = stripTags(section);

    for (const login of orderedLogins) {
        const pattern = new RegExp(
            `(?<![A-Za-z0-9-])${escapeRegExp(login)}\\s*\\(([^)]*)\\)\\s*(\\d+)`,
        );
        const match = text.match(pattern);
        if (match) {
            const name = match[1].trim() || null;
            const contributions = Number.parseInt(match[2], 10);
            result.set(login, { name, contributions });
        } else {
            result.set(login, { name: null, contributions: null });
        }
    }

    return result;
}

export async function getCommitters(
    region: string = DEFAULT_REGION,
): Promise<CommitterList> {
    const slug = region || DEFAULT_REGION;
    const now = Date.now();
    const cached = cache.get(slug);
    if (cached && cached.expires > now) {
        return cached.list;
    }

    const jsonUrl = `${COMMITTERS_BASE}/rank_only/${slug}.json`;
    const htmlUrl = `${COMMITTERS_BASE}/${slug}_private`;

    const [jsonText, html] = await Promise.all([
        fetchText(jsonUrl),
        fetchText(htmlUrl),
    ]);

    const data = JSON.parse(jsonText) as RankOnlyJson;
    const orderedLogins = Array.isArray(data.user_private)
        ? data.user_private
        : [];

    const meta = parseCountsAndNames(html, orderedLogins);

    const users: CommitterEntry[] = orderedLogins.map((login, index) => {
        const entry = meta.get(login) ?? {
            name: null,
            contributions: null,
        };
        return {
            login,
            name: entry.name,
            contributions: entry.contributions,
            rank: index + 1,
        };
    });

    const list: CommitterList = {
        users,
        dataAsof: data.data_asof ?? null,
    };

    cache.set(slug, { list, expires: Date.now() + COMMITTERS_CACHE_TTL_MS });
    return list;
}
