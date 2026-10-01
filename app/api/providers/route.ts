import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Provider from "@/models/Provider";
import { getCurrentUser } from "@/lib/auth";
import Domain from "@/models/Domain";

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

/*
 * DELETE /api/providers
 * Body: { id: "provider_id" }
 */
/*
 * DELETE /api/providers
 * Body: { id: "provider_id" }
 */
export async function DELETE(req: NextRequest) {
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

        const id =
            typeof body.id === "string"
                ? body.id.trim()
                : "";

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Provider ID is required",
                },
                { status: 400 },
            );
        }

        // Find provider
        const provider = await Provider.findById(id).lean();

        if (!provider) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Provider not found",
                },
                { status: 404 },
            );
        }

        /*
         * Check whether any domain is using this provider
         *
         * Domains store the provider slug in `purchasedFrom`
         */
        const domainUsingProvider = await Domain.findOne({
            purchasedFrom: provider.slug,
        })
            .select("_id domainName")
            .lean();

        if (domainUsingProvider) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This provider cannot be deleted because it is being used by an existing domain.",
                    provider: {
                        id: provider._id,
                        name: provider.name,
                        slug: provider.slug,
                    },
                    domain: {
                        id: domainUsingProvider._id,
                        domainName: domainUsingProvider.domainName,
                    },
                },
                { status: 409 },
            );
        }

        /*
         * Provider is not being used by any domain,
         * so it is safe to delete.
         */
        await Provider.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: "Provider deleted successfully",
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("DELETE PROVIDER ERROR:", error);

        /*
         * Invalid MongoDB ObjectId
         */
        if (error.name === "CastError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid provider ID",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete provider",
            },
            { status: 500 },
        );
    }
}