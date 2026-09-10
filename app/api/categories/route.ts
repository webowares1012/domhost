import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { getCurrentUser } from "@/lib/auth";

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