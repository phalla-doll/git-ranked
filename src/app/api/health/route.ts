import { NextResponse } from "next/server";

const COMMITTERS_HEALTH_URL = "https://committers.top/rank_only/cambodia.json";

export async function GET() {
    try {
        const token = process.env.GITHUB_TOKEN;

        if (!token) {
            return NextResponse.json(
                {
                    status: "unhealthy",
                    error: "Missing GITHUB_TOKEN environment variable",
                    checks: {
                        githubToken: false,
                        committersApi: false,
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 500 },
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(COMMITTERS_HEALTH_URL, {
            headers: {
                "User-Agent": "git-ranked/1.0 (+https://gitranked.manthaa.dev)",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {
                    status: "unhealthy",
                    error: "Ranking data source (committers.top) unreachable",
                    statusCode: response.status,
                    errorDetail: errorText,
                    checks: {
                        githubToken: true,
                        committersApi: false,
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 503 },
            );
        }

        return NextResponse.json({
            status: "healthy",
            checks: {
                githubToken: true,
                committersApi: true,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Health check error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                status: "unhealthy",
                error: errorMessage,
                errorType: error instanceof Error ? error.name : "Unknown",
                checks: {
                    githubToken: !!process.env.GITHUB_TOKEN,
                    committersApi: false,
                },
                timestamp: new Date().toISOString(),
            },
            { status: 503 },
        );
    }
}
