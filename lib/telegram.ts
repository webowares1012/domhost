const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN is missing");
}

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

type TelegramResponse<T = unknown> = {
    ok: boolean;
    result?: T;
    description?: string;
};

export async function sendTelegramMessage(
    chatId: number | string,
    text: string
) {
    if (!TELEGRAM_BOT_TOKEN) {
        throw new Error("TELEGRAM_BOT_TOKEN is missing");
    }

    const response = await fetch(
        `${TELEGRAM_API_URL}/sendMessage`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "HTML",
            }),
            cache: "no-store",
        }
    );

    const data =
        (await response.json()) as TelegramResponse;

    if (!response.ok || !data.ok) {
        throw new Error(
            data.description || "Telegram message failed"
        );
    }

    return data.result;
}