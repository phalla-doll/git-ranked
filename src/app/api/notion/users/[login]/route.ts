import { NextResponse } from "next/server";
import { getUserByLogin } from "@/lib/services/notionService";

interface RouteContext {
    params: Promise<{ login: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const { login } = await context.params;

    try {
        if (!login) {
            return NextResponse.json(
                { error: "Login parameter is required" },
                { status: 400 },
            );
        }

        const user = await getUserByLogin(login);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(`Error in /api/notion/users/${login}:`, error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 },
        );
    }
}
