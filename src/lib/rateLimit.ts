import { LRUCache } from "lru-cache";

const rateLimiter = new LRUCache<string, { count: number; resetAt: number }>({
    max: 10000,
    ttl: 60 * 60 * 1000,
});

const RATE_LIMIT_PER_HOUR = 100;

export function checkRateLimit(ip: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
} {
    const now = Date.now();
    const key = ip;
    const record = rateLimiter.get(key);

    if (!record || now >= record.resetAt) {
        const resetAt = now + 60 * 60 * 1000;
        rateLimiter.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: RATE_LIMIT_PER_HOUR - 1, resetAt };
    }

    if (record.count >= RATE_LIMIT_PER_HOUR) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    record.count += 1;
    rateLimiter.set(key, record);

    return {
        allowed: true,
        remaining: RATE_LIMIT_PER_HOUR - record.count,
        resetAt: record.resetAt,
    };
}

export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp;
    }

    return "unknown";
}
