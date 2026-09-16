import mongoose, { Schema, Model } from "mongoose";

export interface ITelegramSubscriber {
    chatId: number;
    username?: string;
    firstName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const telegramSubscriberSchema =
    new Schema<ITelegramSubscriber>(
        {
            chatId: {
                type: Number,
                required: true,
                unique: true,
                index: true,
            },

            username: {
                type: String,
                default: "",
            },

            firstName: {
                type: String,
                default: "",
            },

            isActive: {
                type: Boolean,
                default: true,
                index: true,
            },
        },
        {
            timestamps: true,
        }
    );

const TelegramSubscriber =
    (mongoose.models.TelegramSubscriber as Model<ITelegramSubscriber>) ||
    mongoose.model<ITelegramSubscriber>(
        "TelegramSubscriber",
        telegramSubscriberSchema
    );

export default TelegramSubscriber;