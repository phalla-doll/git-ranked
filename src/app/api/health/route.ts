import { NextResponse } from "next/server";

export async function GET() {
    try {
        const token = process.env.NOTION_TOKEN;
        const databaseId = process.env.NOTION_DATABASE_ID;

        if (!token) {
            return NextResponse.json(
                {
                    status: "unhealthy",
                    error: "Missing NOTION_TOKEN environment variable",
                    checks: {
                        notionToken: false,
                        notionDatabaseId: !!databaseId,
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 500 },
            );
        }

        if (!databaseId) {
            return NextResponse.json(
                {
                    status: "unhealthy",
                    error: "Missing NOTION_DATABASE_ID environment variable",
                    checks: {
                        notionToken: true,
                        notionDatabaseId: false,
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 500 },
            );
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch("https://api.notion.com/v1/users/me", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Notion-Version": "2022-06-28",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {
                    status: "unhealthy",
                    error: "Notion API authentication failed",
                    statusCode: response.status,
                    errorDetail: errorText,
                    checks: {
                        notionToken: true,
                        notionDatabaseId: true,
                        notionApi: false,
                    },
                    timestamp: new Date().toISOString(),
                },
                { status: 503 },
            );
        }

        return NextResponse.json({
            status: "healthy",
            checks: {
                notionToken: true,
                notionDatabaseId: true,
                notionApi: true,
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
                    notionToken: !!process.env.NOTION_TOKEN,
                    notionDatabaseId: !!process.env.NOTION_DATABASE_ID,
                    notionApi: false,
                },
                timestamp: new Date().toISOString(),
            },
            { status: 503 },
        );
    }
}
