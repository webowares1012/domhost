import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Provider from "@/models/Provider";
import { getCurrentUser } from "@/lib/auth";

/*
 * GET /api/providers
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        await connectDB();

        const providers = await Provider.find({})
            .sort({ name: 1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                providers,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET PROVIDERS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch providers",
            },
            { status: 500 },
        );
    }
}

/*
 * POST /api/providers
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        await connectDB();

        const body = await req.json();

        const name =
            typeof body.name === "string"
                ? body.name.trim()
                : "";

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Provider name is required",
                },
                { status: 400 },
            );
        }

        /*
         * Create slug
         */
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid provider name",
                },
                { status: 400 },
            );
        }

        /*
         * Check duplicate
         */
        const existingProvider = await Provider.findOne({
            slug,
        });

        if (existingProvider) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This provider already exists",
                    provider: existingProvider,
                },
                { status: 409 },
            );
        }

        /*
         * Create provider
         */
        const provider = await Provider.create({
            name,
            slug,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Provider created successfully",
                provider,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("CREATE PROVIDER ERROR:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This provider already exists",
                },
                { status: 409 },
            );
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors || {}).map(
                (err: any) => err.message,
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Provider validation failed",
                    errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create provider",
            },
            { status: 500 },
        );
    }
}