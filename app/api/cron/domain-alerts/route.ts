import { NextRequest, NextResponse } from "next/server";
import { sendDomainExpiryAlerts } from "@/lib/sendDomainExpiryAlerts";

export async function GET(request: NextRequest) {
    try {
        const authorization =
            request.headers.get("authorization");

        if (
            authorization !==
            `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const result =
            await sendDomainExpiryAlerts();

        return NextResponse.json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("DOMAIN ALERT CRON ERROR:", error);

        return NextResponse.json(
            {
                message: "Failed to send domain alerts",
            },
            {
                status: 500,
            }
        );
    }
}