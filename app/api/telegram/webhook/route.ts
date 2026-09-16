import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TelegramSubscriber from "@/models/TelegramSubscriber";
import { sendTelegramMessage } from "@/lib/telegram";

type TelegramUpdate = {
    message?: {
        chat?: {
            id: number;
        };

        from?: {
            id: number;
            username?: string;
            first_name?: string;
        };

        text?: string;
    };
};

export async function POST(request: NextRequest) {
    try {
        const secretFromTelegram =
            request.headers.get("x-telegram-bot-api-secret-token");

        if (
            secretFromTelegram !==
            process.env.TELEGRAM_WEBHOOK_SECRET
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

        const update =
            (await request.json()) as TelegramUpdate;

        const message = update.message;
        const chatId = message?.chat?.id;
        const text = message?.text?.trim();

        if (!chatId || !text) {
            return NextResponse.json({
                success: true,
            });
        }

        await connectDB();

        if (text === "/start") {
            const subscriber =
                await TelegramSubscriber.findOneAndUpdate(
                    {
                        chatId,
                    },
                    {
                        chatId,
                        username: message.from?.username || "",
                        firstName: message.from?.first_name || "",
                        isActive: true,
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    }
                );

            await sendTelegramMessage(
                chatId,
                `👋 <b>Welcome to Domhost!</b>\n\n` +
                `You are now subscribed to domain expiry alerts.\n\n` +
                `You will receive notifications when your tracked domains are close to expiry.\n\n` +
                `Use /stop to unsubscribe.`
            );

            console.log(
                "Telegram subscriber activated:",
                subscriber.chatId
            );
        }

        if (text === "/stop") {
            await TelegramSubscriber.findOneAndUpdate(
                {
                    chatId,
                },
                {
                    isActive: false,
                }
            );

            await sendTelegramMessage(
                chatId,
                `You have been unsubscribed from Domhost domain alerts.\n\n` +
                `Send /start whenever you want to subscribe again.`
            );
        }

        if (text === "/status") {
            const subscriber =
                await TelegramSubscriber.findOne({
                    chatId,
                });

            const status = subscriber?.isActive
                ? "subscribed"
                : "not subscribed";

            await sendTelegramMessage(
                chatId,
                `Your Domhost Telegram status: <b>${status}</b>.`
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("TELEGRAM WEBHOOK ERROR:", error);

        return NextResponse.json(
            {
                message: "Webhook processing failed",
            },
            {
                status: 500,
            }
        );
    }
}