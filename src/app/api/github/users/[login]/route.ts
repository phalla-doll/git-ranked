import { NextResponse } from "next/server";
import { getUserByName } from "@/lib/services/githubService";

interface RouteContext {
    params: Promise<{ login: string }>;
}

export const revalidate = 300;

export async function GET(
    _request: Request,
    context: RouteContext,
): Promise<NextResponse> {
    try {
        const { login } = await context.params;
        const apiKey = process.env.GITHUB_TOKEN;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GITHUB_TOKEN is not configured on the server" },
                { status: 500 },
            );
        }

        const user = await getUserByName(login, apiKey);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        if (errorMessage.includes("User not found")) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
