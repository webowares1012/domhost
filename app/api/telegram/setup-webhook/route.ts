import { NextResponse } from "next/server";

export async function GET() {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (!token || !secret) {
            return NextResponse.json(
                {
                    message: "Telegram environment variables are missing",
                },
                {
                    status: 500,
                }
            );
        }

        const webhookUrl =
            `${process.env.NEXT_PUBLIC_APP_URL}` +
            `/api/telegram/webhook`;

        const response = await fetch(
            `https://api.telegram.org/bot${token}/setWebhook`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: webhookUrl,
                    secret_token: secret,
                    allowed_updates: ["message"],
                }),
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.ok ? 200 : 500,
        });
    } catch (error) {
        console.error("SET TELEGRAM WEBHOOK ERROR:", error);

        return NextResponse.json(
            {
                message: "Failed to set Telegram webhook",
            },
            {
                status: 500,
            }
        );
    }
}