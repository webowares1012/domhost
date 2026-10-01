import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/auth";
import Domain from "@/models/Domain";

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

        const categories = await Category.find({})
            .sort({ name: 1 })
            .lean();

        return NextResponse.json(
            {
                success: true,
                categories,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
            },
            { status: 500 },
        );
    }
}

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
                    message: "Category name is required",
                },
                { status: 400 },
            );
        }

        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid category name",
                },
                { status: 400 },
            );
        }

        const existingCategory = await Category.findOne({
            slug,
        });

        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This category already exists",
                    category: existingCategory,
                },
                { status: 409 },
            );
        }

        const category = await Category.create({
            name,
            slug,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Category created successfully",
                category,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("CREATE CATEGORY ERROR:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This category already exists",
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
                    message: "Category validation failed",
                    errors,
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category",
            },
            { status: 500 },
        );
    }
}

/*
 * DELETE /api/categories
 * Body: { id: "category_id" }
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
                    message: "Category ID is required",
                },
                { status: 400 },
            );
        }

        // Find category
        const category = await Category.findById(id).lean();

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category not found",
                },
                { status: 404 },
            );
        }

        /*
         * Check if this category is being used
         * by any existing domain.
         */
        const domainUsingCategory = await Domain.findOne({
            category: category.slug,
        })
            .select("_id domainName")
            .lean();

        if (domainUsingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This category cannot be deleted because it is being used by an existing domain.",

                    category: {
                        id: category._id,
                        name: category.name,
                        slug: category.slug,
                    },

                    domain: {
                        id: domainUsingCategory._id,
                        domainName: domainUsingCategory.domainName,
                    },
                },
                { status: 409 },
            );
        }

        /*
         * Category is not being used,
         * so it is safe to delete.
         */
        await Category.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: "Category deleted successfully",
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error("DELETE CATEGORY ERROR:", error);

        /*
         * Invalid MongoDB ObjectId
         */
        if (error.name === "CastError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid category ID",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete category",
            },
            { status: 500 },
        );
    }
}