import { connectDB } from "@/lib/mongodb";
import Domain from "@/models/Domain";
import TelegramSubscriber from "@/models/TelegramSubscriber";
import { sendTelegramMessage } from "@/lib/telegram";

function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export async function sendDomainExpiryAlerts() {
    await connectDB();

    const now = new Date();

    const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const domains = await Domain.find({
        expiryDate: {
            $gte: now,
            $lte: thirtyDaysFromNow,
        },
    }).lean();

    if (domains.length === 0) {
        console.log("No domains expiring within 30 days.");
        return {
            sent: 0,
            domains: 0,
        };
    }

    const subscribers =
        await TelegramSubscriber.find({
            isActive: true,
        }).lean();

    let sent = 0;

    for (const subscriber of subscribers) {
        for (const domain of domains) {
            const expiryDate = new Date(domain.expiryDate);

            const remainingMilliseconds =
                expiryDate.getTime() - now.getTime();

            const daysLeft = Math.ceil(
                remainingMilliseconds /
                (1000 * 60 * 60 * 24)
            );
            const alertDays = [30, 15, 7, 3, 1];

            if (!alertDays.includes(daysLeft)) {
                continue;
            }

            const message =
                `⚠️ <b>Domain Expiry Alert</b>\n\n` +
                `🌐 <b>Domain:</b> ${domain.domainName}\n` +
                `📅 <b>Expiry Date:</b> ${formatDate(domain.expiryDate)}\n` +
                `⏳ <b>Days Left:</b> ${daysLeft}\n` +
                `📁 <b>Category:</b> ${domain.category}\n` +
                `🏢 <b>Purchased From:</b> ${domain.purchasedFrom}\n\n` +
                `Please renew your domain before it expires.`;

            try {
                await sendTelegramMessage(
                    subscriber.chatId,
                    message
                );

                sent++;
            } catch (error) {
                console.error(
                    `Failed to notify chat ${subscriber.chatId}:`,
                    error
                );
            }
        }
    }

    console.log(
        `Telegram alerts sent: ${sent}. Domains found: ${domains.length}`
    );

    return {
        sent,
        domains: domains.length,
    };
}