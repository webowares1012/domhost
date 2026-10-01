import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import { getCurrentUser } from "@/lib/auth";

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

        const ids = Array.isArray(body.ids)
            ? body.ids.filter(
                (id: unknown): id is string =>
                    typeof id === "string" && id.trim() !== "",
            )
            : [];

        if (ids.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No domains selected",
                },
                { status: 400 },
            );
        }

        const result = await Domain.deleteMany({
            _id: { $in: ids },
        });

        return NextResponse.json(
            {
                success: true,
                message: `${result.deletedCount} domain(s) deleted successfully`,
                deletedCount: result.deletedCount,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("BULK DELETE DOMAINS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete domains",
            },
            { status: 500 },
        );
    }
}